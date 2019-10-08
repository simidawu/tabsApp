import { MyStore } from './../../shared/store';
import { UserState } from './../../shared/models/user.model';
import { Http } from '@angular/http';
import { Injectable, ErrorHandler } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from '../../../environments/environment';

@Injectable()
export class MyErrorHandlerService implements ErrorHandler {
  user: UserState;
  userID = -1;
  constructor(private http: Http, private $store: Store<MyStore>) {
    this.$store.select(s => s.userReducer).subscribe(u => {
      this.user = u;
      this.userID = +u.id;
    });
  }
  handleError(err: any): void {
    console.error(err);
    if (err) {
      let log;
      if (err.status > -1) {
        log = new Log(err.status, err, this.userID);
      } else {
        log = new Log(0, { name: err.name, message: err.stack }, this.userID);
      }
      this.http.post(environment.baseUrl + 'utils/logs', log).subscribe(res => {});
    }
    // do something with the error
  }
}

class Log {
  STATUS_CODE: number;
  BODY: any;
  MOBILE_FLAG: 'Y' | 'N';
  EQUIP_NAME: string;
  CREATED_BY: number;
  constructor(code: number, body: any, by: number) {
    this.STATUS_CODE = code;
    this.BODY = body;
    this.CREATED_BY = by;
    this.MOBILE_FLAG = 'Y';
    this.EQUIP_NAME = navigator.userAgent;
  }
}
