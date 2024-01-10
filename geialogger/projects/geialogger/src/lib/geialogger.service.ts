import { Injectable, SecurityContext } from '@angular/core';
import { NgxCaptureService} from 'ngx-capture'
import { LogModel } from './log.model';
import { LogFormat } from './log-format.model';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser'
@Injectable({
    providedIn: 'root'
})
export class GeialoggerService {

    private  logs: LogModel[] = [];
    private originalLog = console.log;
    private originalError = console.error;
    private originalWarn = console.warn;
    private originalInfo = console.info;

    constructor(
        private sanitizer: DomSanitizer,
        private ngxCaptureService: NgxCaptureService
    ) {
        console.log = (log: any) => {
            this.sanitizeLogArray();
            this.originalLog(log);
            const logModel = this.parseLogToLogModel(log, 'log');
            this.logs.push(logModel);
        };
        console.error = (err: any) => {
            this.sanitizeLogArray();
            this.originalError(err);
            const logModel = this.parseLogToLogModel(err, 'error');
            this.logs.push(logModel);
        };

        console.warn = (err: any) => {
            this.sanitizeLogArray();
            this.originalWarn(err);
            const logModel = this.parseLogToLogModel(err, 'warn');
            this.logs.push(logModel);
        };

        console.info = (err: any) => {
            this.sanitizeLogArray();
            this.originalInfo(err);
            const logModel = this.parseLogToLogModel(err, 'info');
            this.logs.push(logModel);

        };
        console.log('Logging Started');
    }

    private sanitizeLogArray() : void {
        if (this.logs.length > 150) {
            this.logs = this.logs.splice(-150);
        }
    }


    private parseLogToLogModel(
        log: any,
        tipo: 'error' | 'log' | 'info' | 'warn'
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

    private capturePrintScreen(): Observable<string> {
        return this.ngxCaptureService.getImage(document.body, true);
    }

    private createLogFile(logFormat: LogFormat, filename: string): string {
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

    private downloadLogFile(fileUrl: string, filename: string) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
    }
}
