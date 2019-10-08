import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';

@Injectable()
export class LocalStorageService {
  database: SQLiteObject;
  constructor(private sqlite: SQLite, private platform: Platform) {

  }

  setItem(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  getItem(key: string) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {
      return;
    }
  }

  removeItem(key: string) {
    return localStorage.removeItem(key);
  }

  private isCordova() {
    return this.platform.is('cordova');
  }

  async setItem2(key: string, data: any) {
    if (this.isCordova()) {
      await this.database.executeSql(`DELETE FROM MOA_LOCAL_STORAGE WHERE ITEM_KEY='${key}';`, []);
      await this.database.executeSql(`INSERT INTO MOA_LOCAL_STORAGE (ITEM_KEY, ITEM_VALUE)
      VALUES ('${key}','${JSON.stringify(data)}');`, []);
    } else {
      this.setItem(key, data);
    }
  }

  async getItem2(key: string) {
    if (this.isCordova()) {
      const data = await this.database.executeSql(`SELECT ITEM_VALUE FROM MOA_LOCAL_STORAGE WHERE ITEM_KEY='${key}';`, []);
      if (data.rows.length > 0) {
        const val = data.rows.item(0).ITEM_VALUE;
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      } else {
        return '';
      }
    } else {
      return this.getItem(key);
    }
  }

  async init() {
    if (this.isCordova()) {
      this.database = await this.sqlite.create({
        name: 'localStorage',
        location: 'default',
      });
      return this.createTable();
    }
  }

  async removeItem2(key: string) {
    if (this.isCordova()) {
      await this.database.executeSql(`DELETE FROM MOA_LOCAL_STORAGE WHERE ITEM_KEY='${key}';`, []);
    } else {
      this.removeItem(key);
    }
  }

  private async createTable() {
    return this.database.executeSql(
      `SELECT COUNT(1) FROM MOA_LOCAL_STORAGE;`,
      [],
    ).catch((err) => this.database.executeSql(
      `CREATE TABLE IF NOT EXISTS MOA_LOCAL_STORAGE
        (ITEM_KEY VARCHAR2(300),ITEM_VALUE VARCHAR2(4000));`,
      [],
    ));
  }
}
