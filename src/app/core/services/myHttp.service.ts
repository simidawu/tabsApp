import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Http, Headers, RequestOptions } from '@angular/http';
import { LoginConfig } from '../../login/shared/config/login.config';
import { EncryptUtilService } from './encryptUtil.service';

import { MyStore } from './../../shared/store';
import { UserState } from './../../shared/models/user.model';
import { replaceQuery } from '../../shared/utils';

import { timeout } from 'rxjs/operators';

@Injectable()
export class MyHttpService {
  user: UserState;
  timeOut: number = 30 * 1000;

  constructor(
    private http: Http,
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    private encryptUtilService: EncryptUtilService,
    private store$: Store<MyStore>,
  ) {
    this.store$
      .select('userReducer')
      .subscribe((user: UserState) => (this.user = user));
  }

  postWithoutToken(url: string, body: any) {
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
    });
    const options = new RequestOptions({ headers: headers });
    const stringBody = JSON.stringify(body);
    return this.http
      .post(url, stringBody, options)
      .pipe(
        timeout(this.timeOut)
        )
      // .timeout(this.timeOut)
      .toPromise();
  }

  async initOptions(loginFlag: boolean) {
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
    });
    if (!loginFlag) {
      const token = JSON.parse(localStorage.getItem('access_token'));
      if (token && !this.isTokenExpired()) {
        headers.append('access_token', token);
      } else {
        let res;
        try {
          res = await this.getNewToken();
        } catch (err) {
          if (!loginFlag) {
            this.showError(
              'Error',
              'Your token is already expired,please login again!',
              () => {
                this.navCtrl.navigateRoot('/login');
              },
            );
            return;
          }
        }
        const newToken = res.json().Token;
        localStorage.setItem('moduleList', JSON.stringify(res.json().Modules));
        localStorage.setItem('access_token', JSON.stringify(newToken));
        localStorage.setItem('tokenExpires', res.json().Expires);
        headers.append('access_token', newToken);
      }
    }
    const options = new RequestOptions({ headers: headers });
    return options;
  }

  async showError(title: string, message: string, cb: any) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            cb();
          },
        },
      ],
    });
    await alert.present();
  }

  async post(url: string, body: any, loginFlag: boolean = false) {
    const options = await this.initOptions(loginFlag);
    const stringBody = JSON.stringify(body);
    return this.http
      .post(url, stringBody, options)
      .pipe(
        timeout(this.timeOut)
        )
      // .timeout(this.timeOut)
      .toPromise();
  }

  async get(url: string) {
    const options = await this.initOptions(false);
    return this.http
      .get(url, options)
      .pipe(
        timeout(this.timeOut)
        )
      // .timeout(this.timeOut)
      .toPromise();
  }

  async delete(url: string) {
    const options = await this.initOptions(false);
    return this.http
      .delete(url, options)
      .pipe(
        timeout(this.timeOut)
        )
      // .timeout(this.timeOut)
      .toPromise();
  }

  isTokenExpired() {
    const tokenExpired: number = parseInt(localStorage.getItem('tokenExpires'));
    const nowTime = new Date().getTime();
    if (tokenExpired > nowTime) {
      return false;
    } else {
      return true;
    }
  }

  originGet(url: string) {
    return this.http
      .get(url)
      .pipe(
        timeout(this.timeOut)
        )
      // .timeout(this.timeOut)
      .toPromise();
  }

  public getNewToken() {
    const enUsername = this.encryptUtilService.AesEncrypt(
      this.user.username,
      this.encryptUtilService.key,
      this.encryptUtilService.iv,
    );
    const enPassword = this.encryptUtilService.AesEncrypt(
      this.user.password,
      this.encryptUtilService.key,
      this.encryptUtilService.iv,
    );
    return this.postWithoutToken(LoginConfig.loginUrl, {
      userName: enUsername,
      password: enPassword,
    });
  }

  lazyLoad(api: string) {
    if (!api) {
      throw new Error('無API');
    }
    return this.http.get(
      replaceQuery(
        api.indexOf('https:') > -1 || api.indexOf('http:') > -1
          ? api
          : environment.baseUrl + api,
        {},
        this.user,
      ),
    );
  }
}
