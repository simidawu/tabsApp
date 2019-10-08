import { LocalStorageService } from './localStorage.service';
import { MyHttpService } from './myHttp.service';
// import { BossConfig } from './../../application/my-modules/inspection/boss/shared/config/boss.config';
import { MyErrorHandlerService } from './myErrorHandler.service';
import { UserState } from './../../shared/models/user.model';
import { BehaviorSubject, Subject, Observable, of, forkJoin, pipe, defer } from 'rxjs';
import { map, } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import {
  Platform,
  ToastController,
  LoadingController,
  AlertController,
} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

import { BarcodeScanner, BarcodeScanResult, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { CodePush } from '@ionic-native/code-push/ngx';
import { Network } from '@ionic-native/network/ngx';
import { tify, sify } from '../../shared/utils/chinese-conv/';

import { MyStore } from './../../shared/store';
import { User_ChineseConv } from './../../shared/actions/user.action';
import { environment } from '../../../environments/environment';
import { async } from '@angular/core/testing';
@Injectable()
export class PluginService {
  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private barcodeScanner: BarcodeScanner,
    private camera: Camera,
    private codePush: CodePush,
    private network: Network,
    private platform: Platform,
    private translate: TranslateService,
    private store$: Store<MyStore>,
    private myErrorHandlerService: MyErrorHandlerService,
    private myHttp: MyHttpService,
    private localStorageService: LocalStorageService
  ) {
    this.translate.onLangChange.subscribe((a: any) => {
      this.subscribeTranslateText();
      this.chineseConvUserMes();
    });
    this.store$
      .select('userReducer')
      .subscribe((user: UserState) => (this.user = user));
  }

  user: UserState;
  appNewVersion: string = '';
  translateTexts: any = {};
  updateProgress = new BehaviorSubject<number>(0);
  uploadProgress = new Subject<number>();
  /**
   * 对本地用户信息简繁体更新
   */
  chineseConvUserMes() {
    const userStr: string = localStorage.getItem('currentUser');
    if (!(userStr)) {
      return;
    }
    const user: UserState = JSON.parse(userStr);
    if (!user.modules) {
      return;
    }
    const userTrans = JSON.parse(this.chineseConv(user.modules));
    Object.assign(user, { modules: userTrans });
    this.store$.dispatch(new User_ChineseConv(user));
  }

  /**
   * 获得i18n的翻译内容
   */
  subscribeTranslateText() {
    this.translate
      .get([
        'Plugin.update_successed',
        'Plugin.update_success',
        'Plugin.app_size',
        'alert',
        'Plugin.no_wifi_alert',
        'Plugin.restart_for_update',
        'Plugin.update_error',
        'Plugin.is_newest',
        'Plugin.have_new_version',
        'cancel',
        'confirm',
        'Plugin.update_content',
        'error',
        'Plugin.not_found',
        'Plugin.http_error1',
        'Plugin.http_error2',
        'Plugin.http_error3',
        'Plugin.http_error4',
        'Plugin.http_error5',
        'autologin_err',
      ])
      .subscribe(res => {
        this.translateTexts = res;
      });
  }

  ObserveUser() {
    return this.store$.select('userReducer');
  }

  chineseConv(value: any) {
    if (value === void 0 || value === null) {
      return '';
    }
    const chinese = ['ZH-CN', 'ZH-TW'];
    const idx = chinese.indexOf(this.translate.currentLang.toUpperCase());
    switch (idx) {
      case 0:
        return sify(JSON.stringify(value))
          .replace(/^\"/g, '')
          .replace(/\"$/g, '');
      case 1:
        return tify(JSON.stringify(value))
          .replace(/^\"/g, '')
          .replace(/\"$/g, '');
      default:
        return JSON.stringify(value);
    }
  }
  getAlert() {
    return this.alertCtrl;
  }
  getCodePush() {
    return this.codePush;
  }
  isCordova() {
    return this.platform.is('cordova');
  }
  isWifi() {
    return this.network.type === 'wifi';
  }

  hasNoNetwork() {
    return this.network.type === 'none';
  }

  getPictureUrlArray(imgs: string): string[] {
    if (imgs) {
      return imgs.split(',').map(i => environment.staticBaseUrl + i);
    }
    return [];
  }

  confirmUpdate() {
    this.codePush.notifyApplicationReady().then(async () => {
      if (!localStorage.getItem('showConfirmUpdate') || localStorage.getItem('showConfirmUpdate') == '0') {
        return;
      }
      const alert = await this.alertCtrl.create({
        header: this.translateTexts['update_successed'],
        buttons: ['OK'],
      });
      await alert.present();
      this.showConfirmUpdate('0');
    });
  }
  showConfirmUpdate(ss: string) {
    // '1' show '0' not show
    localStorage.setItem('showConfirmUpdate', ss);
  }
  codePushSync() {
    const codePush = this.codePush;
    codePush
      .sync({}, progress => {
        // console.log(`Downloaded ${progress.receivedBytes} of ${progress.totalBytes}`);
        this.updateProgress.next(
          Math.floor(progress.receivedBytes / progress.totalBytes * 100),
        );
      })
      .subscribe(async syncStatus => {
        // console.log('Sync Status1: ', syncStatus);
        if (syncStatus === 0) {
        }
        switch (syncStatus) {
          case 4:
            break;
          case 5:
            break;
          case 7:
            break;
          case 8:
            break;
          case 1:
            this.showConfirmUpdate('1');
            this.updateAppVersion(this.appNewVersion);
            const confirm = await this.alertCtrl.create({
              header: this.translateTexts['update_success'],
              message: this.translateTexts['restart_for_update'],
              buttons: [
                {
                  text: this.translateTexts['cancel'],
                  handler: () => { },
                },
                {
                  text: this.translateTexts['confirm'],
                  handler: () => {
                    codePush.restartApplication();
                  },
                },
              ],
            });
            await confirm.present();
            break;
          case 3:
            this.showToast(this.translateTexts['update_error']);
            break;
          default:
            break;
        }
      });
  }

  updateAppVersion(v: string) {
    this.localStorageService.setItem2('appVersion', v);
  }

  checkAppForUpdate(auto: boolean = true) {
    if (!this.isCordova()) {
      return;
    }
    return this.codePush
      .checkForUpdate()
      .then(async apk => {
        if (!apk) {
          this.confirmUpdate();
          if (!auto) {
            this.showToast(this.translateTexts['is_newest']);
          }
          return;
        }
        const des = apk.description.split('&&');
        if (des.length > 1) {
          this.appNewVersion = des[0];
          if (+environment.appVersion >= +this.appNewVersion) {
            if (!auto) {
              this.showToast(this.translateTexts['is_newest']);
            }
            return;
          }
        }
        const confirm = await this.alertCtrl.create({
          header: this.translateTexts['have_new_version'],
          message: this.chineseConv(
            `${this.translateTexts['update_content']}: ${des[des.length - 1]} , ${this.translateTexts['app_size']}: ${(apk.packageSize / Math.pow(1024, 2)).toFixed(2)}M`,
          ),
          buttons: [
            {
              text: this.translateTexts['cancel'],
              handler: () => { },
            },
            {
              text: this.translateTexts['confirm'],
              handler: () => {
                this.confirmWifiTodo(this.codePushSync);
              },
            },
          ],
        });
        await confirm.present();
      })
      .catch(err => {
        console.log(err);
      });
  }
  async createBasicConfirm(message: string) {
    const subject = new Subject<boolean>();
    const confirm = await this.alertCtrl.create({
      header: this.translateTexts['alert'],
      message: message,
      buttons: [
        {
          text: this.translateTexts['cancel'],
          handler: () => {
            subject.next(false);
          },
        },
        {
          text: this.translateTexts['confirm'],
          handler: () => {
            subject.next(true);
          },
        },
      ],
    });
    await confirm.present();
    return subject.asObservable();
  }

  async confirmWifiTodo(todo: any) {
    if (!this.isWifi()) {
      const confirm = await this.alertCtrl.create({
        header: this.translateTexts['alert'],
        message: this.translateTexts['no_wifi_alert'],
        buttons: [
          {
            text: this.translateTexts['cancel'],
            handler: () => { },
          },
          {
            text: this.translateTexts['confirm'],
            handler: () => {
              todo.call(this);
            },
          },
        ],
      });
      await confirm.present();
    } else {
      todo.call(this);
    }
  }

  setBarcode(content: string) {
    this.barcodeScanner.encode('TEXT_TYPE', content).then(
      res => { },
      err => {
        console.log(err);
      },
    );
  }

  getBarcode(opt?: BarcodeScannerOptions): Promise<BarcodeScanResult> {
    const myOpt: BarcodeScannerOptions = {
      resultDisplayDuration: 0,
      showFlipCameraButton: true,
      showTorchButton: true,
    };
    opt && Object.assign(myOpt, opt);
    return this.barcodeScanner.scan(myOpt);
  }

  async createBasicAlert(subText: string) {
    const alert = await this.alertCtrl.create({
      header: this.chineseConv(this.translateTexts['error']),
      message: subText,
      buttons: [this.translateTexts['confirm']],
    });
    await alert.present();
  }
  getNewPhoto(type: number, size: number, opts: any = {}): Promise<any> {
    let options: CameraOptions = {
      // 这些参数可能要配合着使用，比如选择了sourcetype是0，destinationtype要相应的设置
      quality: 50, // 相片质量0-100
      allowEdit: false, // 在选择之前允许修改截图
      destinationType: this.camera.DestinationType.DATA_URL,
      // DATA_URL : 0, Return image as base64-encoded string,
      // FILE_URI : 1, Return image file URI,
      // NATIVE_URI : 2 Return image native URI (e.g., assets-library:// on iOS or content:// on Android)
      sourceType: type, // 从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
      encodingType: this.camera.EncodingType.JPEG, // 保存的图片格式： JPEG = 0, PNG = 1
      targetWidth: size, // 照片宽度
      targetHeight: size, // 照片高度
      mediaType: this.camera.MediaType.PICTURE,
      // 可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
      cameraDirection: this.camera.Direction.BACK, // 枪后摄像头类型：Back= 0,Front-facing = 1
      saveToPhotoAlbum: true, // 保存进手机相册
      correctOrientation: true,
    };
    options = Object.assign(options, opts);
    return this.camera.getPicture(options);
  }

  async showToast(content: string, position: any = 'top', duration: number = 2000, ) {
    const toast = await this.toastCtrl.create({
      message: content,
      duration: duration,
      position: position,
    });
    toast.present();
  }

  async createLoading(content: string = 'Please wait...') {
    return this.loadingCtrl.create({
      message: content,
    });
  }

  async createLoading2(content: string = 'Please wait...') {
    const loading = await this.loadingCtrl.create({
      message: content,
    });
    loading.present();
    return () => loading.dismiss();
  }


  /**
   *  节流，限制事件的触发频率
   *
   * @param {*} 方法
   * @param {Object} 上下文
   * @param {any[]} 需要传入的参数
   * @param {number} [during=100] 间隔的时间
   */
  throttle(
    method: any,
    context: Object,
    args: any[] = [],
    during: number = 100,
  ) {
    clearTimeout(method.tId);
    method.tId = setTimeout(function () {
      method.call(context, ...args);
    }, during);
  }

  errorDeal(err: any, showAlert: boolean = false) {
    let errTip = '';
    if (err.name === 'TimeoutError') {
      this.showToast(this.translateTexts['http_error4']);
      return;
    }
    switch (err.status) {
      case 400:
        let errMes = '';
        let show = false;
        try {
          const json = err.json();
          if (typeof json !== 'object') {
            errMes = json;
            show = true;
          } else {
            errMes = err.json().ExceptionMessage;
          }
        } catch (e) {
          console.log(err);
          errMes = err._body;
          show = true;
        }
        errTip = this.chineseConv(errMes);
        if (/^\s*ORA/i.test(errTip)) {
          errTip = this.translateTexts['http_error5'];
        }
        show && this.showToast(errTip);
        break;
      case 404:
        this.showToast(this.translateTexts['not_found']);
        break;
      case 0:
        this.showToast(this.translateTexts['http_error1']);
        break;
      case 500:
        this.showToast(this.translateTexts['http_error2']);
        break;
      default:
        this.myErrorHandlerService.handleError(err);
        this.showToast(this.translateTexts['http_error3']);
        break;
    }
    return errTip;
  }

  async uploadPicture(img: string) {
    if (!img) {
      // return Observable.of('');
      return of('');
    }
    img = img.replace(/data\:image\/(jpeg|png);base64\,/, '');

    // return Observable.fromPromise(
    //   this.myHttp.post(BossConfig.uploadPicture, { PICTURE: img }),
    // ).map(res => {
    //   let url = res.json()['PICTURE_URL'];
    //   return url;
    // });

    // const res = await this.myHttp.post(BossConfig.uploadPicture, { PICTURE: img });
    // const url = res.json();
    // return url['PICTURE_URL'];
  }

  uploadPictureList(imgs: string[]) {
    const out: any = [];
    if (imgs && imgs.length > 0) {
      const req: Observable<string>[] = [];
      imgs.forEach(i => {
        if (i.indexOf(environment.staticBaseUrl) > -1) {
          i = i.replace(environment.staticBaseUrl, '');
          if (i) {
            out.push(i);
          }
        } else if (/data\:image\/(jpeg|png);base64\,/.test(i)) {
          // req.push(this.uploadPicture(i));
          const rtn: any = this.uploadPicture(i);
          req.push(defer(rtn));
        } else {
          out.push(i);
        }
      });
      if (req.length > 0) {
        // return Observable.forkJoin(req).map(res => {
        //   res.forEach(r => out.push(r));
        //   return out;
        // });

        return forkJoin([req]).pipe(
          map(res => {
            res.forEach(r => out.push(r));
            return out;
          }),
        );
      }
    }
    // return Observable.of(out);
    return of(out);
  }

  dateFormat(date: any, toFormat: string, fromFormat?: string) {
    const m = moment(date, fromFormat);
    if (m.isValid()) {
      return m.format(toFormat);
    } else {
      return date;
    }
  }
}
