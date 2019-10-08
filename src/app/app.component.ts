import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { MyStore } from './shared/store';
import { UserState } from './shared/models/user.model';
import { User_Clear, User_Login } from './shared/actions/user.action';

import { PluginService } from './core/services/plugin.service';
import { LocalStorageService } from './core/services/localStorage.service';

import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

import { LoginService } from './login/shared/service/login.service';

declare var window: any;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  user: UserState;
  updateProg: Observable<number>;

  constructor(
    private router: Router,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translate: TranslateService,
    private store$: Store<MyStore>,
    private plugin: PluginService,
    private localStorageService: LocalStorageService,
    private loginService: LoginService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.store$.select('userReducer').subscribe((user: UserState) => {
      this.user = user;
    });
    this.platform.ready().then(() => {
      this.updateProg = this.plugin.updateProgress.asObservable();
      this.translate.setDefaultLang('zh-TW');
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.setDefaultLanguage();
      this.appInit();
      this.plugin.checkAppForUpdate();
      if (this.platform.is('cordova') && this.platform.is('ios')) {
        // 当应用每次从后台变成前台时，检查app是否有新版本
        this.platform.resume.subscribe(async () => {
          const currentUser = JSON.parse(localStorage.getItem('currentUser'));
          if (currentUser && currentUser.username) {
            this.plugin.checkAppForUpdate();
          }
        });
      }
    });
  }

  async appInit() {
    console.log(1);
    await this.localStorageService.init();
    window['localStorage2'] = this.localStorageService;
    const appVersion = await localStorage2.getItem2('appVersion');
    if (!appVersion) {
      await localStorage2.setItem2('appVersion', environment.appVersion);
    }
    // console.log(this.user);
    if (!this.user || !this.user.username || !this.user.password) { 
      console.log(2);
      const user = await this.localStorageService.getItem2('currentUser');
      // console.log(user, 1);
      if (user) {
        if (user.hasOwnProperty('rememberPWD') && !user.rememberPWD) {
          user.password = '';
          user.myNineCode = '';
        }
        this.user = user;
        this.store$.dispatch(new User_Login(user));
        if (!(user.username && user.password)) {
          this.router.navigate(['/login']);
          return;
        }
      } else {
        this.router.navigate(['/login']);
        return;
      }
    }
    if (this.user.myNineCode) {
      // 已经有用户信息和设定为要验证手势密码,跳转手势密码登录界面
      this.router.navigate(['/login']);
    } else {
      if (this.user.autoLogin) {
        const ADloginSuccess = await this.loginService.myADLogin(
          this.user.username,
          this.user.password,
        );
        if (!ADloginSuccess) {
          this.store$.dispatch(new User_Clear());
          this.router.navigate(['/login']);
          setTimeout(
            () =>
              this.plugin.showToast(
                this.plugin.translateTexts['autologin_err'],
                'top',
                4000,
              ),
            100,
          );
        } else {
          this.router.navigate(['/tabs']);
        }
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  // 设置app默认语言版本
  setDefaultLanguage() {
    let preferLang;
    if (this.user) {
      preferLang = this.user.preferLang;
    }
    let targetLang: string;
    if (preferLang) {
      targetLang = preferLang;
    } else {
      // 若用户没有调整过语言版本，则选择与浏览器一致的版本
      const userLanguage = window.navigator.language.toLowerCase();
      const languageType = ['zh', 'en'];
      let index = -1;
      languageType.forEach((val, idx) => {
        if (userLanguage.indexOf(val) > -1) {
          index = idx;
          return;
        }
      });
      if (index === 0) {
        if (userLanguage === 'zh-cn') {
          targetLang = 'zh-CN';
        } else {
          targetLang = 'zh-TW';
        }
      } else if (index > 0) {
        targetLang = languageType[index];
      } else if (index === -1) {
        targetLang = 'zh-CN';
      }
    }
    this.translate.use(targetLang);
  }
}
