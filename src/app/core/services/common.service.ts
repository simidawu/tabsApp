import { AlertController, LoadingController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { tify, sify } from '../../shared/utils/chinese-conv/';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class CommonService {
  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private translate: TranslateService,
  ) { }


  async showAlert(title: string, subtitle: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: subtitle,
      buttons: ['OK'],
    });
    await alert.present();
  }


  async showConfirm(title: string, msg: string, cb: any) {
    const confirm = await this.alertCtrl.create({
      header: title,
      message: msg,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            cb();
          },
        },
      ],
    });
    await confirm.present();
  }

  async showOptionConfirm(title: string, msg: string, cb: any) {
    const confirm = await this.alertCtrl.create({
      header: title,
      message: msg,
      buttons: [
        {
          text: 'Cancel',
          handler: () => { },
        },
        {
          text: 'OK',
          handler: () => {
            cb();
          },
        },
      ],
    });
    await confirm.present();
  }

  getToday() {
    const newDate = new Date();
    const month =
      newDate.getMonth() + 1 > 9
        ? newDate.getMonth() + 1
        : '0' + (newDate.getMonth() + 1);
    const day =
      newDate.getDate() > 9 ? newDate.getDate() : '0' + newDate.getDate();
    return newDate.getFullYear() + '-' + month + '-' + day;
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
    });
    await loading.present();
  }

  hideLoading() {
    // this.loadingCtrl && this.loadingCtrl.dismiss();
    this.loadingCtrl.dismiss();
  }

  chineseConv(value: string) {
    if (value) {
      const currentLang = this.translate.currentLang;
      if (!currentLang) { return value; }
      const chinese = ['ZH-CN', 'ZH-TW'];
      const idx = chinese.indexOf(currentLang.toUpperCase());
      switch (idx) {
        case 0:
          return sify(value);
        case 1:
          return tify(value);
        default:
          return value;
      }
    }
  }

  /**
   * 计算字符长度，中文算2个
   * @param val
   */
  getByteLen(val: string) {
    let len = 0;
    for (let i = 0; i < val.length; i++) {
      let a = val.charAt(i);
      if (a.match(/[^\x00-\xff]/gi) != null) {
        len += 2;
      } else {
        len += 1;
      }
    }
    return len;
  }
}
