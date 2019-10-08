import { Injectable } from '@angular/core';

@Injectable()
export class CacheService {
  private cache: object = {};
  constructor() {}

  get(comName: string, key: string, isClone = true) {
    if (this.cache[comName] && this.cache[comName][key]) {
      const cache = this.cache[comName][key];
      if (cache.updateTime && cache.maxAge) {
        if (cache.updateTime.getTime() + cache.maxAge > new Date().getTime()) {
          return isClone
            ? JSON.parse(JSON.stringify(cache.value))
            : cache.value;
        } else {
          delete cache.updateTime;
          delete cache.maxAge;
        }
      } else {
        return isClone ? JSON.parse(JSON.stringify(cache.value)) : cache.value;
      }
    } else {
      return null;
    }
  }

  update(comName: string, key: string, newVal: any, maxAge?: number) {
    this.cache[comName] = this.cache[comName] || {};
    this.cache[comName][key] = { value: newVal };
    if (maxAge) {
      const cache = this.cache[comName][key];
      cache['updateTime'] = new Date();
      cache['maxAge'] = maxAge;
    }
  }

  clear(comName: string) {
    delete this.cache[comName];
  }
}
