declare class AraleQRCode {
  constructor(opts: { text: string; size: number });
  toDataURL(type: string, p: number): string;
}

declare const  localStorage2 : {
  setItem(key: string, data: any):void;
  getItem(key: string):string;
  removeItem(key: string):void;
  removeItem2(key: string):Promise<void>;
  setItem2(key: string, data: any):Promise<void>;
  getItem2(key: string) :Promise<string>;
}
