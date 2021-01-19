import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NotificationType, UserDto, UserInfos } from '@strat-editor/data';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { NotificationService } from './notifications.service';

@Injectable({
  providedIn: 'root',
})
export class AuthentService {
  private controller = 'auth';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  public login(userDto: UserDto): Observable<UserInfos> {
    return this.http
      .post<UserInfos>(environment.apiUrl + this.controller + '/login', userDto)
      .pipe(
        map((userInfos) => {
          localStorage.setItem('userInfos', JSON.stringify(userInfos));
          this.notificationService.displayNotification({
            message: 'You are logged in !',
            type: NotificationType.success,
          });
          return userInfos;
        }),
        catchError((err) => {
          this.notificationService.displayNotification({
            message: 'Error during login',
            type: NotificationType.error,
          });
          return throwError(err);
        })
      );
  }
  public refreshToken(): Observable<UserInfos> {
    return this.http
      .get<any>(environment.apiUrl + this.controller + '/refresh')
      .pipe(
        timeout(2000),
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  public confirmEmail(token: string) {
    return this.http
      .post<any>(environment.apiUrl + this.controller + '/confirm', { token })
      .pipe(
        catchError((err) => {
          return throwError(err);
        })
      );
  }

  public sendConfirmationEmail(userInfos: UserInfos) {
    return this.http
      .post<any>(
        environment.apiUrl + this.controller + '/send-confirmation-mail',
        {
          userMail: userInfos.userMail,
        }
      )
      .pipe(
        map(() => {
          this.notificationService.displayNotification({
            message: 'Confirmation mail sent !',
            type: NotificationType.success,
          });
        }),
        catchError((err) => {
          this.notificationService.displayNotification({
            message: 'Error during confirmation mail sending',
            type: NotificationType.error,
          });
          return throwError(err);
        })
      );
  }

  public disconnect() {
    localStorage.removeItem('userInfos');
    return this.http
      .get(environment.apiUrl + this.controller + '/disconnect')
      .pipe(
        map(() => {
          this.notificationService.displayNotification({
            message: 'You are disconnected',
            type: NotificationType.success,
          });
        }),
        catchError((err) => {
          return throwError(err);
        })
      );
  }
}
