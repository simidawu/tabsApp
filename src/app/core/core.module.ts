import { Store } from '@ngrx/store';
import { MyErrorHandlerService } from './services/myErrorHandler.service';
import { CommonService } from './services/common.service';
import { NgModule, Optional, SkipSelf, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule, Http } from '@angular/http';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { CodePush } from '@ionic-native/code-push/ngx';
import { Network } from '@ionic-native/network/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

import { MyHttpService } from './services/myHttp.service';

import { ArrayUtilService } from './services/arrayUtil.service';
import { PluginService } from './services/plugin.service';
import { ValidateService } from './services/validate.service';
import { NgValidatorExtendService } from './services/ng-validator-extend.service';
import { EncryptUtilService } from './services/encryptUtil.service';
import { CacheService } from './services/cache.service';

@NgModule({
  imports: [CommonModule, HttpModule],
  declarations: [],
  providers: [
    MyHttpService,
    PluginService,
    ValidateService,
    NgValidatorExtendService,
    BarcodeScanner,
    Camera,
    ArrayUtilService,
    InAppBrowser,
    CodePush,
    Network,
    SQLite,
    EncryptUtilService,
    CacheService,
    CommonService,
    MyErrorHandlerService,
    {
      provide: ErrorHandler,
      useClass: MyErrorHandlerService,
      deps: [Http, Store],
    },
    ScreenOrientation
  ],
  exports: [],
})
export class CoreModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule,
  ) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only',
      );
    }
  }
}
