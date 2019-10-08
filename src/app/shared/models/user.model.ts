export interface UserState {
  id: string;
  companyId: string;
  companys: any[];
  username: string;
  password: string;
  nickname: string;
  avatarUrl: string;
  empno: string;
  position: string;
  department: string;
  patternCode: string;
  myNineCode: string;
  mobile: string;
  telephone: string;
  email: string;
  autoLogin: boolean;
  sex: string;
  rememberPWD: boolean;
  preferLang: string;
  privilege?: Privilege[];
  modules?: MyModule[];
}
export class UserModel implements UserState {
  id: string;
  companyId: string;
  companys: any[];
  username: string;
  password: string;
  nickname: string;
  avatarUrl: string;
  empno: string;
  position: string;
  department: string;
  patternCode: string;
  myNineCode: string;
  mobile: string;
  telephone: string;
  email: string;
  autoLogin: boolean;
  preferLang: string;
  rememberPWD: boolean;
  sex: string;
  modules?: MyModule[];
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}

export interface Privilege {
  moduleID: number;
  function: {
    FUNCTION_ID: string;
    FUNCTION_NAME: string;
    FUNCTION_URL: string;
    ROLE_ID: number;
    ROLE_NAME: string;
  }[];
}

export interface MyModule {
  GROUP_ID: number;
  DISPLAY: 'Y' | 'N';
  GROUP_NAME: string;
  ICON_URL: string;
  MODULE_DESCRIPTION: string;
  MODULE_ID: number;
  MODULE_NAME: string;
  TIPS?: number;
}
