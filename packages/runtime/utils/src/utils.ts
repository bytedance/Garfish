export const objectToString = Object.prototype.toString;

export const noop = () => {};

export function createKey() {
  return Math.random().toString(36).substr(2, 8);
}

export function isObject(val: any) {
  return val && typeof val === 'object';
}

export function isPlainObject(val: any) {
  return objectToString.call(val) === '[object Object]';
}

export function isPromise(obj: any) {
  return isObject(obj) && typeof obj.then === 'function';
}

const hasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwn(obj: any, key: PropertyKey): boolean {
  return hasOwnProperty.call(obj, key);
}

export function def(obj: Object, key: string, value: any) {
  Object.defineProperty(obj, key, {
    get: () => value,
    set: (val: any) => {
      if (__DEV__) {
        if (val !== value) {
          error(`Try to modify a read-only property ${key}`);
        }
      }
    },
    configurable: __DEV__ ? true : false,
  });
}

// Array to Object `['a'] => { a: true }`
export function makeMap(list: Array<PropertyKey>) {
  const map = Object.create(null);
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return (val) => map[val] as boolean;
}

export function inBrowser() {
  return typeof window !== 'undefined';
}

const warnPrefix = '[Garfish warning]';
const processError = (
  error: string | Error,
  fn: (val: string | Error, isString: boolean) => void,
) => {
  if (typeof error === 'string') {
    error = `${warnPrefix}: ${error}\n\n`;
    fn(error, true);
  } else if (error instanceof Error) {
    if (!error.message.startsWith(warnPrefix)) {
      error.message = `${warnPrefix}: ${error.message}`;
    }
    fn(error, false);
  }
};

export function warn(msg: string | Error) {
  processError(msg, (e, isString) => {
    const warnMsg = isString ? e : (e as Error).message;
    if (__TEST__) {
      callTestCallback(warn, warnMsg);
      return;
    }
    console.warn(warnMsg);
  });
}

export function error(error: string | Error) {
  processError(error, (e, isString) => {
    if (isString) {
      throw new Error(e as string);
    } else {
      throw e;
    }
  });
}

export function validURL(str) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  return !!pattern.test(str);
}

// When the string is set as the object property name,
// it will be attempted to be transformed into a constant version to avoid repeated caching by the browser
export function internFunc(internalizeString) {
  // Don't consider "Hash-collision，https://en.wikipedia.org/wiki/Collision_(computer_science)"
  // v8貌似在 16383 长度时会发生 hash-collision，经过测试后发现正常
  const temporaryOb = {};
  temporaryOb[internalizeString] = true;
  return Object.keys(temporaryOb)[0];
}

export function evalWithEnv(code: string, params: Record<string, any>) {
  const keys = Object.keys(params);
  const nativeWindow = (0, eval)('window;');
  // No random value can be used, otherwise it cannot be reused as a constant string
  const randomValKey = '__garfish__exec_temporary__';
  const vales = keys.map((k) => `window.${randomValKey}.${k}`);

  try {
    nativeWindow[randomValKey] = params;
    const evalInfo = [
      `;(function(${keys.join(',')}){`,
      `\n}).call(${vales[0]},${vales.join(',')});`,
    ];
    const internalizeString = internFunc(evalInfo[0] + code + evalInfo[1]);
    // (0, eval) This expression makes the eval under the global scope
    (0, eval)(internalizeString);
  } catch (e) {
    throw e;
  } finally {
    delete nativeWindow[randomValKey];
  }
}

export function nextTick(cb: () => void): void {
  Promise.resolve().then(cb);
}

export function assert(condition: any, msg?: string | Error) {
  if (!condition) {
    error(msg || 'unknow reason');
  }
}

export function toBoolean(val: any) {
  return val === 'false' ? false : Boolean(val);
}

export function remove<T>(list: Array<T> | Set<T>, el: T) {
  if (Array.isArray(list)) {
    const i = list.indexOf(el);
    if (i > -1) {
      list.splice(i, 1);
      return true;
    }
    return false;
  } else {
    if (list.has(el)) {
      list.delete(el);
      return true;
    }
    return false;
  }
}

// 有些测试 jest.mock 不好测，可用这个工具方法
export function callTestCallback(obj: any, ...args: any[]) {
  if (__TEST__) {
    const oncalled = obj._oncalled;
    if (typeof oncalled === 'function') {
      oncalled.apply(null, args);
    }
  }
}

// 数组去重，不保证顺序
export function unique<T>(list: Array<T>) {
  const res: Array<T> = [];
  for (let i = 0, len = list.length; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      if (list[i] === list[j]) {
        j = ++i;
      }
    }
    res.push(list[i]);
  }
  return __TEST__ ? res.sort() : res;
}

export function isPrimitive(val: any) {
  return (
    val === null ||
    typeof val === 'string' ||
    typeof val === 'number' ||
    typeof val === 'bigint' ||
    typeof val === 'symbol' ||
    typeof val === 'boolean' ||
    typeof val === 'undefined'
  );
}

// Deeply merge two objects, can handle circular references, the latter overwrite the previous
export function deepMerge<K, T>(o: K, n: T, dp?: boolean) {
  const leftRecord = new WeakMap();
  const rightRecord = new WeakMap();
  const valueRecord = new WeakMap();

  const isArray = Array.isArray;
  const isAllRefs = (a, b) => {
    if (leftRecord.has(a) || rightRecord.has(a)) {
      return leftRecord.has(b) || rightRecord.has(b);
    }
  };

  const clone = (v) => {
    // Deep clone
    if (isPrimitive(v) || typeof v === 'function') {
      return v;
    } else if (valueRecord.has(v)) {
      return valueRecord.get(v);
    } else if (leftRecord.has(v)) {
      return leftRecord.get(v);
    } else if (rightRecord.has(v)) {
      return rightRecord.get(v);
    } else if (isArray(v)) {
      if (dp) v = unique(v);
      const arr = [];
      valueRecord.set(v, arr);
      for (let i = 0, len = v.length; i < len; i++) {
        arr[i] = clone(v[i]);
      }
      return arr;
    } else if (typeof v === 'object') {
      const obj = {};
      valueRecord.set(v, obj);
      const keys = Reflect.ownKeys(v);
      keys.forEach((key) => (obj[key] = clone(v[key])));
      return obj;
    }
  };

  const setValue = (r, k) => {
    if (r.has(k)) {
      return r.get(k);
    } else {
      const val = clone(k);
      if (!isPrimitive(val) && typeof val !== 'function') {
        r.set(k, val);
      }
      return val;
    }
  };

  const mergeObject = (l, r) => {
    const res = {};
    const leftKeys = Reflect.ownKeys(l);
    const rightKeys = Reflect.ownKeys(r);

    leftRecord.set(l, res);
    rightRecord.set(r, res);

    leftKeys.forEach((key) => {
      const lv = l[key];
      const rv = r[key];

      if (hasOwn(r, key)) {
        if (isArray(lv) && isArray(rv)) {
          const item = clone([].concat(lv, rv));
          res[key] = dp ? unique(item) : item;
        } else if (isPlainObject(lv) && isPlainObject(rv)) {
          res[key] = isAllRefs(lv, rv)
            ? leftRecord.get(lv) // The same value on the left and right, whichever is OK
            : mergeObject(lv, rv);
        } else {
          res[key] = setValue(rightRecord, rv);
        }
      } else {
        res[key] = setValue(leftRecord, lv);
      }
    });

    rightKeys.forEach((key) => {
      if (hasOwn(res, key)) return;
      res[key] = setValue(rightRecord, r[key]);
    });

    return res;
  };

  return mergeObject(o, n) as K & T;
}

// Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
// Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
export function isAbsolute(url: string) {
  // `c:\\` 这种 case 返回 false，在浏览器中使用本地图片，应该用 file 协议
  if (!/^[a-zA-Z]:\\/.test(url)) {
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
      return true;
    }
  }
  return false;
}

export function transformUrl(resolvePath: string, curPath: string) {
  // const baseUrl = new URL(resolvePath, location.href);
  // const realPath = new URL(curPath, baseUrl.href);
  // return realPath.href;
  return curPath;
}

export function findTarget(
  el: Element | ShadowRoot | Document,
  selectors: Array<string>,
) {
  for (const s of selectors) {
    const target = el.querySelector(s);
    if (target) return target;
  }
  return el;
}

export function setDocCurrentScript(
  target,
  code: string,
  define?: boolean,
  url?: string,
  async?: boolean,
) {
  if (!target) return noop;
  const el = document.createElement('script');
  if (async) {
    el.setAttribute('async', 'true');
  }

  if (url) {
    el.setAttribute('src', url);
  } else if (code) {
    el.textContent = code;
  }

  const set = (val) => {
    try {
      if (define) {
        Object.defineProperty(target, 'currentScript', {
          value: val,
          writable: true,
          configurable: true,
        });
      } else {
        target.currentScript = val;
      }
    } catch (e) {
      if (__DEV__) {
        warn(e);
      }
    }
  };

  set(el);
  return () => set(null);
}

export function __extends(d, b) {
  Object.setPrototypeOf(d, b);

  function fNOP() {
    this.constructor = d;
  }

  if (b === null) {
    d.prototype = Object.create(b);
  } else {
    if (b.prototype) fNOP.prototype = b.prototype;
    d.prototype = new fNOP();
  }
}

export function isFunction(what: unknown): what is Function {
  return typeof what === 'function';
}

export const hookObjectProperty = <
  T extends {},
  K extends keyof T,
  P extends any[]
>(
  obj: T,
  key: K,
  hookFunc: (origin: T[K], ...params: P) => T[K],
) => {
  return (...params: P) => {
    if (!obj) {
      return noop;
    }
    const origin = obj[key];
    const hookedUnsafe = hookFunc(origin, ...params);
    let hooked = hookedUnsafe;

    // To method packages a layer of a try after all the hooks to catch
    if (isFunction(hooked)) {
      hooked = (function (this: any, ...args: any) {
        try {
          return (hookedUnsafe as any).apply(this, args);
        } catch {
          return isFunction(origin) && origin.apply(this, args);
        }
      } as any) as T[K];
    }
    obj[key] = hooked;

    return (strict?: boolean) => {
      if (!strict || hooked === obj[key]) {
        obj[key] = origin;
      }
    };
  };
};
