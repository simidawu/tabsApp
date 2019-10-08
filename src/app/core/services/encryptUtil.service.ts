import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';

@Injectable()
export class EncryptUtilService {
  constructor() {}
  key = 'defed456!@#@#ewaa45h4r1238132&AU';
  iv = '45de#d@#$!#asgfd';

  AesEncrypt(text: string, key: string, iv: string) {
    const key2 = CryptoJS.enc.Utf8.parse(key);
    const iv2 = CryptoJS.enc.Utf8.parse(iv);
    const ciphertext = CryptoJS.AES.encrypt(text, key2, {
      iv: iv2,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return ciphertext.toString();
  }

  AesDecrypt(text: string, key: string, iv: string) {
    const key2 = CryptoJS.enc.Utf8.parse(key);
    const iv2 = CryptoJS.enc.Utf8.parse(iv);
    const bytes = CryptoJS.AES.decrypt(text.toString(), key2, {
      iv: iv2,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);
    return plaintext;
  }
}
