import { environment } from './../../../../environments/environment';

export class LoginConfig {
  // 登陆
  static loginUrl: string = environment.baseUrl + 'global/login';
}
