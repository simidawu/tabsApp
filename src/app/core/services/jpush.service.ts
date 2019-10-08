import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

declare var window: any;
declare var document: any;

@Injectable()
export class JPushService {
  public jPushPlugin = (<any>window).plugins
    ? (<any>window).plugins.jPushPlugin || null
    : null;
  jPushHandler: Subscription; //接收句柄，再view被关闭的时候取消订阅，否则对已关闭的view进行数据脏检查会报错
  jPushOffline: Subscription;
  constructor() { }

  wrapEventObservable(event: string): Observable<any> {
    return new Observable(observer => {
      document.addEventListener(event, observer.next.bind(observer), false);
      return () =>
        document.removeEventListener(
          event,
          observer.next.bind(observer),
          false,
        );
    });
  }

  init() {
    window.plugins.jPushPlugin.init();
  }

  // 设置服务器角标
  setBadge(num: number) {
    window.plugins.jPushPlugin.setBadge(num);
  }

  // 设置本地角标
  setApplicationIconBadgeNumber(num: number) {
    window.plugins.jPushPlugin.setApplicationIconBadgeNumber(num);
  }
}
