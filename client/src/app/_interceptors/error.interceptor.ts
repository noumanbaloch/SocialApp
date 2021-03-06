import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private _router: Router, private _toastr: ToastrService) {
    debugger
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(error => {
        if(error){
          switch(error.status){
            case 500:
              const navigationExtras: NavigationExtras = {state: {error: error.error}}
              this._router.navigateByUrl('/server-error', navigationExtras)
              break;
            case 400:
              if(error.error.errors){
                debugger
                const modalStateErrors = [];
                for(const key in error.error.errors){
                  if(error.error.errors[key]){
                    modalStateErrors.push(error.error.errors[key]);
                  }
                }
                throw modalStateErrors.flat();
              }
              else if(typeof(error.error) == 'string')
              {
                this._toastr.error(error.error, error.status);
              }
              else{
                this._toastr.error(error.statusText === 'OK' ? 'Bad Request': error.statusText, error.status);
              }
              break;
            case 401:
              this._toastr.error(error.statusText === 'OK' ? 'Unauthorized': error.statusText, error.status);
              break;
            case 404:
              this._router.navigateByUrl('/not-found');
              break;
            default:
              this._toastr.error("Something unexpexted went wrong");
              console.log(error);
              break;
          }
        }
        return throwError(error);
      })
    );
  }
}
