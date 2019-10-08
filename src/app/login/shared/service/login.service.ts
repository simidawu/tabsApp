import { Store } from '@ngrx/store';

import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { environment } from './../../../../environments/environment';
import { MyHttpService } from '../../../core/services/myHttp.service';
import { PluginService } from '../../../core/services/plugin.service';
import { EncryptUtilService } from '../../../core/services/encryptUtil.service';

import { UserModel, MyModule } from '../../../shared/models/user.model';
import { MyStore } from './../../../shared/store';
import { User_Login, User_Update } from './../../../shared/actions/user.action';


@Injectable()
export class LoginService {
  currentUser: UserModel;

  // moduleListStorageName: string = 'moduleList';
  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private myHttp: MyHttpService,
    private pluginService: PluginService,
    private encryptUtilService: EncryptUtilService,
    private store$: Store<MyStore>,
  ) { }

  public async login(username: string, password: string, extra?: any) {
    this.showLoading();
    const ADLoginSuccess = await this.myADLogin(username, password, false, extra);
    console.log(ADLoginSuccess);
    this.loadingCtrl.dismiss();
    if (ADLoginSuccess) {
      return true;
    } else {
      return false;
    }
  }

  async myADLogin(
    username: string,
    password: string,
    noErrorMsg: boolean = true,
    extra?: any,
  ) {
    this.currentUser = new UserModel(username, password);
    this.currentUser = Object.assign(this.currentUser, extra);
    this.store$.dispatch(new User_Update(this.currentUser));
    let res;
    try {
      const enUsername = this.encryptUtilService.AesEncrypt(
        username,
        this.encryptUtilService.key,
        this.encryptUtilService.iv,
      );
      const enPassword = this.encryptUtilService.AesEncrypt(
        password,
        this.encryptUtilService.key,
        this.encryptUtilService.iv,
      );
      res = await this.myHttp.post(
        environment.baseUrl + 'global/login',
        { userName: enUsername, password: enPassword },
        true,
      );
    } catch (err) {
      this.pluginService.errorDeal(err);

      return false;
    }
    const token = res.json().Token;
    if (token) {
      localStorage.setItem('access_token', JSON.stringify(token));
      localStorage.setItem('tokenExpires', res.json().Expires);
      const user = res.json().User;
      const companys = res.json().Companys;
      this.currentUser.id = user.ID;
      this.currentUser.companyId = user.COMPANY_ID;
      this.currentUser.companys = companys;
      if (user.AVATAR_URL.substr(0, 6) === 'Images') {
        this.currentUser.avatarUrl = environment.baseUrl + user.AVATAR_URL;
      } else {
        this.currentUser.avatarUrl = user.AVATAR_URL;
      }

      this.currentUser.nickname = user.NICK_NAME;
      this.currentUser.position = user.JOB_TITLE;
      this.currentUser.department = user.DEPT_NAME;
      this.currentUser.empno = user.EMPNO;
      this.currentUser.mobile = user.MOBILE;
      this.currentUser.email = user.EMAIL;
      this.currentUser.telephone = user.TELEPHONE;
      this.currentUser.sex = user.SEX;
      const modules: MyModule[] = res
        .json()
        .Modules.filter((_: MyModule) => _.MODULE_ID !== 26025);
      if (user.COMPANY_ID === 'MSL') {
        modules.push({
          DISPLAY: 'Y',
          GROUP_ID: 1,
          GROUP_NAME: '工作相关',
          ICON_URL: 'assets/icon/geshui.png',
          MODULE_DESCRIPTION: '个税专项附加扣除申请',
          MODULE_ID: -1,
          MODULE_NAME: '个税扣减',
        });
      }
      this.currentUser.modules = this.updateModuleList(
        modules,
        this.currentUser.username,
      );
      this.store$.dispatch(new User_Login(this.currentUser));

      localStorage.setItem('access_token', JSON.stringify(token));
      localStorage.setItem('tokenExpires', res.json().Expires);

      if (localStorage.getItem('appLoginUser')) {
        if (
          this.currentUser.username === localStorage.getItem('appLoginUser')
        ) {
          if (localStorage.getItem('appCompanyId')) {
            environment.companyID = localStorage.getItem('appCompanyId');
          } else {
            localStorage.setItem('appCompanyId', user.COMPANY_ID);
            environment.companyID = localStorage.getItem('appCompanyId');
          }
        } else {
          localStorage.setItem('appLoginUser', this.currentUser.username);
          localStorage.setItem('appCompanyId', user.COMPANY_ID);
          environment.companyID = localStorage.getItem('appCompanyId');
        }
      } else {
        localStorage.setItem('appLoginUser', this.currentUser.username);
        localStorage.setItem('appCompanyId', user.COMPANY_ID);
        environment.companyID = localStorage.getItem('appCompanyId');
      }
      return true;

    } else {
      if (!noErrorMsg) {
        this.showError('Get Token Error');
      }
    }
  }

  updateModuleList(newModuleLists: any[], newName: string) {
    const user = this.pluginService.user;
    if (user.username === newName) {
      const moduleLists = user.modules || [];
      newModuleLists = newModuleLists.map(l => {
        const idx = moduleLists.findIndex(
          (ol: any) => +ol.MODULE_ID === +l.MODULE_ID,
        );
        if (idx > -1) {
          return Object.assign(l, { DISPLAY: moduleLists[idx].DISPLAY });
        } else {
          l.DISPLAY = 'Y';
          return l;
        }
      });
    }
    return JSON.parse(this.pluginService.chineseConv(newModuleLists));
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
    });
    await loading.present();
  }

  async showError(text: string) {
    const loading = await this.alertCtrl.create({
      header: 'Fail',
      message: text,
      buttons: ['OK'],
    });
    await loading.present();
  }
}
