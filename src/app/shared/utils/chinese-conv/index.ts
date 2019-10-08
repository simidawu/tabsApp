import { UserState } from './../../models/user.model';
import tongwenSt from './tongwen/tongwen-st';
import tongwenTs from './tongwen/tongwen-ts';

export default {
  sify: tongwenTs,
  tify: tongwenSt,
};
export const sify = tongwenTs;
export const tify = tongwenSt;

export const replaceQuery = (url: string, query: any, user?: UserState) => {
  const prefix = '*';
  if (url && query) {
    for (let prop in query) {
      const queryVal = query[prop];
      url = url.replace(
        `{${prop}}`,
        queryVal || queryVal === 0 ? queryVal : '',
      );
    }
    if (user) {
      for (let prop in user) {
        const userVal = user[prop];
        url = url.replace(
          `{${prefix + prop}}`,
          userVal || userVal === 0 ? userVal : '',
        );
      }
    }
    url = url.replace(/\{\w+\}/g, '');
  }

  return url;
};
