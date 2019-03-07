import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { AuthenticationDataService } from "../../services/authentication-data/authentication-data.service";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ToastController } from "@ionic/angular";

@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authenticationDataService: AuthenticationDataService,
    private translateService: TranslateService,
    private toastController: ToastController
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const req = request.clone(this.transformRequest());
    return next.handle(req).pipe(
      tap(
        evt => {
          if (evt instanceof HttpResponse) {
            // console.info("api call success :", event);
          }
        },
        err => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              this.router.navigateByUrl("/logout");
              this.toastController
                .create({
                  message: this.translateService.instant("SESSION_EXPIRED"),
                  duration: 4000
                })
                .then(t => {
                  t.present();
                });
            }
          }
        }
      )
    );
  }

  transformRequest() {
    let headers = new HttpHeaders();
    const headersObj = this.authenticationDataService.getRequestOptionsHeaders();
    for (const h of Object.entries(headersObj)) {
      headers = headers.set(h[0], h[1]);
    }
    return { headers: headers };
  }
}
