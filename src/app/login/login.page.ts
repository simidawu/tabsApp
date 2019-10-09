import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { Store } from '@ngrx/store';
import { MyStore } from './../shared/store';
import { UserState } from './../shared/models/user.model';
import { environment } from '../../environments/environment';

import { LoginService } from './shared/service/login.service';
@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage {

  appVersion: string;

  LoginForm: FormGroup;
  translateTexts: any;
  usernameErrorTip: string;
  passwordErrorTip: string;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private translate: TranslateService,
    private store$: Store<MyStore>,
    private loginService: LoginService,
  ) { }


  ngOnInit() {

    this.subscribeTranslateText();
    this.LoginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
      rememberPWD: [false],
      autoLogin: [false]
    });

    this.store$.select('userReducer').subscribe((user: UserState) => {
      if (user && user.nickname) {
        this.LoginForm.controls['userName'].setValue(user.username);
        this.LoginForm.controls['password'].setValue(user.password);
        this.LoginForm.controls['rememberPWD'].setValue(user.rememberPWD);
        this.LoginForm.controls['autoLogin'].setValue(user.autoLogin);
      }
    });
    const locVersion = localStorage.getItem('appVersion');
    const configVersion = environment.appVersion;
    if (locVersion) {
      this.appVersion = Math.max(+locVersion, +configVersion) + '';
    } else {
      this.appVersion = configVersion;
    }
  }

  subscribeTranslateText() {
    this.translate
      .get([
        'Login.usernameErrorTip',
        'Login.passwordErrorTip',
      ])
      .subscribe(res => {
        this.translateTexts = res;
      });
    this.usernameErrorTip = this.translateTexts['Login.usernameErrorTip'];
    this.passwordErrorTip = this.translateTexts['Login.passwordErrorTip'];
  }

  async login() {
    const value = this.LoginForm.value;

    const loginSuccess = await this.loginService.login(
      value.userName.toLowerCase(),
      value.password,
      {
        rememberPWD: value.rememberPWD,
        autoLogin: value.autoLogin,
      },
    );
    if (loginSuccess) {
      const urlParams = localStorage.getItem('urlParams');
      if (urlParams) {
        this.router.navigateByUrl(urlParams ? urlParams : '/modules');
        localStorage.removeItem('lastURL');
      } else {
        this.router.navigate(['/tabs']);
      }
    } else {
      return;
    }
  }

}
