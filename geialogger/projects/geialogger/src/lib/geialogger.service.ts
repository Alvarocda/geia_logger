import { Injectable, SecurityContext } from '@angular/core';
import { NgxCaptureService } from 'ngx-capture'
import { LogModel } from './log.model';
import { LogFormat } from './log-format.model';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser'
@Injectable({
  providedIn: 'root'
})
export class GeialoggerService {
  logs: LogModel[] = [];
  originalLog = console.log;
  originalError = console.error;
  originalWarn = console.warn;
  originalInfo = console.info;
  
  
  // O que essa lib faz é basicamente substituir o comportamento padrão do log e do error
    // Sempre que o usuário usar o log ou error, ele vai executar as funções abaixo e logar numa array as mensagens de log
    constructor(
      private sanitizer: DomSanitizer,
      private ngxCaptureService: NgxCaptureService
  ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log = (log: any) => {
          const logModel = this.parseLogToLogModel(log, 'log');
          this.originalLog(log);
          this.logs.push(logModel);
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.error = (err: any) => {
          const logModel = this.parseLogToLogModel(err, 'erro');
          this.originalError(err);
          this.logs.push(logModel);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.warn = (err: any) => {
          const logModel = this.parseLogToLogModel(err, 'warn');
          this.originalWarn(err);
          this.logs.push(logModel);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.info = (err: any) => {
          const logModel = this.parseLogToLogModel(err, 'info');
          this.originalInfo(err);
          this.logs.push(logModel);
      };
      console.log('Logging iniciado');
  }

  // Acredito que um array muito grande vai ficar pesando a aplicação, então vou armazenar apenas os ultimos 150 logs
  sanitizeLogArray() {
      if (this.logs.length > 150) {
          this.logs = this.logs.splice(-150);
      }
  }


  parseLogToLogModel(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      log: any,
      tipo: 'erro' | 'log' | 'info' | 'warn'
  ): LogModel {
      const logModel: LogModel = {
          log: log,
          tipo: tipo,
          time: new Date(),
      };

      return logModel;
  }

  prepareLog() {
      const logFormat = {} as LogFormat;
      const agoraMiliseconds = Date.now();
      const filename = `${agoraMiliseconds}_console_logs.json`;

      this.capturePrintScreen().subscribe({
          next: (base64: string) => {
              logFormat.printscreen = base64;
          },
          complete: () => {
              logFormat.logs = this.logs;
              const fileUrl = this.createLogFile(logFormat, filename);
              this.downloadLogFile(fileUrl, filename);
          },
      });

  }

  capturePrintScreen(): Observable<string> {
      return this.ngxCaptureService.getImage(document.body, true);
  }

  createLogFile(logFormat: LogFormat, filename: string): string {
      const blob = new Blob([JSON.stringify(logFormat, null, '\t')], {
          type: 'application/octet-stream',
      });

      const file = new File([blob], filename, {
          type: 'application/octet-stream',
      });

      const secureUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          window.URL.createObjectURL(file)
      );

      const fileUrl = this.sanitizer.sanitize(SecurityContext.URL, secureUrl);
      return fileUrl!;
  }

  downloadLogFile(fileUrl: string, filename: string) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
  }
}
