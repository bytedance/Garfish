(function () {
  'use strict';

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  var __assign = function () {
    __assign =
      Object.assign ||
      function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };

  function __values(o) {
    var s = typeof Symbol === 'function' && Symbol.iterator,
      m = s && o[s],
      i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === 'number')
      return {
        next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        },
      };
    throw new TypeError(
      s ? 'Object is not iterable.' : 'Symbol.iterator is not defined.',
    );
  }

  function __read(o, n) {
    var m = typeof Symbol === 'function' && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i['return'])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  }

  function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || from);
  }

  (function (document) {
    if (!('currentScript' in document)) {
      Object.defineProperty(document, 'currentScript', {
        get: function () {
          // IE 8-10 support script readyState
          // IE 11+ support stack trace
          try {
            throw new Error();
          } catch (err) {
            // Find the second match for the "at" string to get file src url from stack.
            // Specifically works with the format of stack traces in IE.
            var i = 0;
            var stackDetails = /.*at [^(]*\((.*):(.+):(.+)\)$/gi.exec(
              err.stack,
            );
            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            var scriptLocation = (stackDetails && stackDetails[1]) || false;
            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            var line = (stackDetails && stackDetails[2]) || 0;
            var currentLocation = document.location.href.replace(
              document.location.hash,
              '',
            );
            var inlineScriptSource = '';
            var scripts = document.getElementsByTagName('script'); // Live NodeList collection
            if (scriptLocation === currentLocation) {
              var pageSource = document.documentElement.outerHTML;
              var inlineScriptSourceRegExp = new RegExp(
                '(?:[^\\n]+?\\n){0,' +
                  (line - 2) +
                  '}[^<]*<script>([\\d\\D]*?)<\\/script>[\\d\\D]*',
                'i',
              );
              inlineScriptSource = pageSource
                .replace(inlineScriptSourceRegExp, '$1')
                .trim();
            }
            for (; i < scripts.length; i++) {
              // If ready state is interactive, return the script tag
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              if (scripts[i].readyState === 'interactive') {
                return scripts[i];
              }
              // If src matches, return the script tag
              if (scripts[i].src === scriptLocation) {
                return scripts[i];
              }
              // If inline source matches, return the script tag
              if (
                scriptLocation === currentLocation &&
                scripts[i].innerHTML &&
                scripts[i].innerHTML.trim() === inlineScriptSource
              ) {
                return scripts[i];
              }
            }
            // If no match, return null
            return null;
          }
        },
      });
    }
  })(document);

  var DEFAULT_SIZE = 10;
  var DEFAULT_WAIT = 1000;
  function createBatchSender(config) {
    var endpoint = config.endpoint,
      transport = config.transport;
    var _a = config.size,
      size = _a === void 0 ? DEFAULT_SIZE : _a,
      _b = config.wait,
      wait = _b === void 0 ? DEFAULT_WAIT : _b;
    var batch = [];
    var tid = 0;
    var sender = {
      setSize: function (v) {
        size = v;
      },
      setWait: function (v) {
        wait = v;
      },
      getEndpoint: function () {
        return endpoint;
      },
      send: function (e) {
        batch.push(e);
        if (batch.length >= size) {
          sendBatch.call(this);
        }
        clearTimeout(tid);
        tid = setTimeout(sendBatch.bind(this), wait);
      },
      flush: function () {
        clearTimeout(tid);
        sendBatch.call(this);
      },
      getBatchData: function () {
        return batch.length
          ? JSON.stringify({
              ev_type: 'batch',
              list: batch,
            })
          : '';
      },
      clear: function () {
        clearTimeout(tid);
        batch = [];
      },
    };
    function sendBatch() {
      if (!batch.length) {
        return;
      }
      transport.post({
        url: endpoint,
        data: this.getBatchData(),
      });
      batch = [];
    }
    return sender;
  }

  var EVENTS = [
    'init',
    'start',
    'config',
    'beforeDestroy',
    'provide',
    'report',
    'beforeBuild',
    'build',
    'beforeSend',
    'send',
    'beforeConfig',
  ];

  var noop = function () {};
  function id(v) {
    return v;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  function isObject(o) {
    return typeof o === 'object' && o !== null;
  }
  function isInstanceOf(wat, base) {
    try {
      return wat instanceof base;
    } catch (_e) {
      return false;
    }
  }
  var objProto = Object.prototype;
  // https://stackoverflow.com/a/5878101
  function isPlainObject(o) {
    if (isObject(o)) {
      if (typeof Object.getPrototypeOf === 'function') {
        var proto = Object.getPrototypeOf(o);
        return proto === objProto || proto === null;
      }
      // cannot test, requires ES3
      /* istanbul ignore next */
      return objProto.toString.call(o) === '[object Object]';
    }
    return false;
  }
  function isArray(o) {
    return objProto.toString.call(o) === '[object Array]';
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  function isFunction(o) {
    return typeof o === 'function';
  }
  function isBoolean(o) {
    return typeof o === 'boolean';
  }
  function isNumber(o) {
    return typeof o === 'number';
  }
  function isString(o) {
    return typeof o === 'string';
  }
  function isError(wat) {
    switch (Object.prototype.toString.call(wat)) {
      case '[object Error]':
        return true;
      case '[object Exception]':
        /* istanbul ignore next */
        return true;
      case '[object DOMError]':
        return true;
      case '[object DOMException]':
        /* istanbul ignore next */
        return true;
      default:
        /* istanbul ignore next */
        return wat instanceof Error;
    }
  }
  function isEvent(wat) {
    return typeof Event !== 'undefined' && isInstanceOf(wat, Event);
  }
  function isErrorEvent(what) {
    return Object.prototype.toString.call(what) === '[object ErrorEvent]';
  }
  function isPromiseRejectionEvent(what) {
    return (
      Object.prototype.toString.call(what) === '[object PromiseRejectionEvent]'
    );
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  function omit(object) {
    var keys = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      keys[_i - 1] = arguments[_i];
    }
    if (isObject(object)) {
      var res_1 = {};
      objectForIn(object, function (k, v) {
        if (!arrayIncludes(keys, k)) {
          res_1[k] = v;
        }
      });
      return res_1;
    }
    return object;
  }
  function hasKey(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }
  function objectForIn(object, callback) {
    if (isObject(object)) {
      for (var i in object) {
        if (hasKey(object, i)) {
          callback.call(null, i, object[i]);
        }
      }
    }
  }
  // 把source对象中的内容深度赋给target, 数组合并
  function mergeDeepConcatArray() {
    var source = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      source[_i] = arguments[_i];
    }
    var result = {};
    var k = 0;
    while (k < source.length) {
      result = _mergeDeepMergeArray(result, source[k++]);
    }
    return result;
  }
  // 递归赋值
  function _mergeDeepMergeArray(target, source) {
    var result = __assign({}, target);
    for (var key in source) {
      if (hasKey(source, key) && source[key] !== undefined) {
        if (isObject(source[key]) && isPlainObject(source[key])) {
          result[key] = _mergeDeepMergeArray(
            isObject(target[key]) ? target[key] : {},
            source[key],
          );
        } else if (isArray(source[key]) && isArray(target[key])) {
          result[key] = _mergeDeepArray(target[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    return result;
  }
  function _mergeDeepArray(target, source) {
    var _target = isArray(target) ? target : [];
    var _source = isArray(source) ? source : [];
    return Array.prototype.concat.call(_target, _source).map(function (v) {
      if (v instanceof RegExp) {
        return v;
      } else if (isObject(v) && isPlainObject(v)) {
        return _mergeDeepMergeArray({}, v);
      } else if (isArray(v)) {
        return _mergeDeepArray([], v);
      } else {
        return v;
      }
    });
  }
  // 检查数组中是否有元素
  function arrayIncludes(array, value) {
    if (!isArray(array)) {
      return false;
    }
    if (array.length === 0) {
      return false;
    }
    var k = 0;
    while (k < array.length) {
      if (array[k] === value) {
        return true;
      }
      k++;
    }
    return false;
  }
  var arrayRemove = function (arr, e) {
    if (!isArray(arr)) {
      return arr;
    }
    var i = arr.indexOf(e);
    if (i >= 0) {
      var arr_ = arr.slice();
      arr_.splice(i, 1);
      return arr_;
    }
    return arr;
  };
  /**
   * 按路径访问对象属性
   * @param target 待访问对象
   * @param property 访问属性路径
   * @param { (target: any, property: string): any } visitor 访问器
   */
  var safeVisit = function (target, path, visitor) {
    var _a, _b;
    var paths = path.split('.');
    var _c = __read(paths),
      method = _c[0],
      rest = _c.slice(1);
    while (target && rest.length > 0) {
      target = target[method];
      (_a = rest), (_b = __read(_a)), (method = _b[0]), (rest = _b.slice(1));
    }
    if (!target) {
      return undefined;
    }
    return visitor(target, method);
  };
  /**
   *  按路径调用函数
   * @param target 待调用对象，如 `client`
   * @param methods 待调用方法路径，可能是一级路径 `client.start`, 或者是多级命令 `client.context.set`
   * @param args 调用参数
   */
  var safeCall = function (target, method, args) {
    return safeVisit(target, method, function (obj, property) {
      if (obj && property in obj && isFunction(obj[property])) {
        try {
          return obj[property].apply(obj, args);
        } catch (err) {
          // ignore
          return undefined;
        }
      }
    });
  };
  var applyRecord = function () {
    var record = {};
    var set = function (key, val) {
      return (record[key] = val);
    };
    var del = function (key) {
      return delete record[key];
    };
    return [record, set, del];
  };
  var pick = function (obj, keys) {
    if (!obj || !isObject(obj)) return obj;
    return keys.reduce(function (prev, cur) {
      prev[cur] = obj[cur];
      return prev;
    }, {});
  };

  var count = 0;
  var log = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    // eslint-disable-next-line no-console
    console.log.apply(
      console,
      __spreadArray(
        ['[SDK]', Date.now(), ('' + count++).padStart(8, ' ')],
        __read(args),
      ),
    );
  };
  var warnCount = 0;
  var warn = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    // eslint-disable-next-line no-console
    console.warn.apply(
      console,
      __spreadArray(
        ['[SDK]', Date.now(), ('' + warnCount++).padStart(8, ' ')],
        __read(args),
      ),
    );
  };

  function createContextAgent() {
    var context = {};
    var stringified = {};
    var contextAgent = {
      set: function (k, v) {
        context[k] = v;
        try {
          stringified[k] = JSON.stringify(v);
        } catch (err) {
          warn('failed to stringify', err);
        }
        return contextAgent;
      },
      merge: function (ctx) {
        context = __assign(__assign({}, context), ctx);
        try {
          Object.keys(ctx).forEach(function (key) {
            stringified[key] = JSON.stringify(ctx[key]);
          });
        } catch (err) {
          warn('failed to stringify', err);
        }
        return contextAgent;
      },
      delete: function (k) {
        delete context[k];
        delete stringified[k];
        return contextAgent;
      },
      clear: function () {
        context = {};
        stringified = {};
        return contextAgent;
      },
      get: function (k) {
        return stringified[k];
      },
      toString: function () {
        return __assign({}, stringified);
      },
    };
    return contextAgent;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  var hookObjectProperty = function (obj, key, hookFunc) {
    return function () {
      var params = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        params[_i] = arguments[_i];
      }
      if (!obj) {
        return noop;
      }
      var origin = obj[key];
      var hookedUnsafe = hookFunc.apply(
        void 0,
        __spreadArray([origin], __read(params)),
      );
      var hooked = hookedUnsafe;
      // 给所有 hook 之后的方法包一层 try catch
      if (isFunction(hooked)) {
        hooked = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          try {
            return hookedUnsafe.apply(this, args);
          } catch (_a) {
            return isFunction(origin) && origin.apply(this, args);
          }
        };
      }
      obj[key] = hooked;
      return function (strict) {
        if (!strict || hooked === obj[key]) {
          obj[key] = origin;
        }
      };
    };
  };
  /**
   * 劫持对象方法
   * 必须记得给 hookFunc 劫持的方法包 try catch ！
   * 不在本方法里包是为了避免对象原方法被调用两次
   */
  var hookMethodDangerously = function (obj, key, hookFunc) {
    return function () {
      var params = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        params[_i] = arguments[_i];
      }
      obj[key] = hookFunc.apply(
        void 0,
        __spreadArray([obj[key]], __read(params)),
      );
    };
  };

  var isHitBySampleRate = function (sampleRate) {
    if (Math.random() < Number(sampleRate)) {
      return true;
    }
    return false;
  };

  var runProcessors = function (fns) {
    return function (e) {
      var e_1, _a;
      var r = e;
      try {
        for (
          var fns_1 = __values(fns), fns_1_1 = fns_1.next();
          !fns_1_1.done;
          fns_1_1 = fns_1.next()
        ) {
          var f = fns_1_1.value;
          if (r) {
            try {
              r = f(r);
            } catch (_err) {
              // ignore
            }
          } else {
            break;
          }
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (fns_1_1 && !fns_1_1.done && (_a = fns_1.return)) _a.call(fns_1);
        } finally {
          if (e_1) throw e_1.error;
        }
      }
      return r;
    };
  };

  var camelToKebab = function (str) {
    return str.replace(/([a-z])([A-Z])/g, function (_, a, b) {
      return a + '-' + b.toLowerCase();
    });
  };
  function getRegexp(ignore) {
    if (!isArray(ignore)) {
      return null;
    }
    return ignore.length ? joinRegExp(ignore) : null;
  }
  function joinRegExp(patterns) {
    var sources = [];
    var len = patterns.length;
    for (var i = 0; i < len; i++) {
      var pattern = patterns[i];
      if (isString(pattern)) {
        sources.push(pattern.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1'));
      } else if (pattern && pattern.source) {
        sources.push(pattern.source);
      }
    }
    return new RegExp(sources.join('|'), 'i');
  }
  function safeStringify(a) {
    try {
      return JSON.stringify(a);
    } catch (err) {
      return '[FAILED_TO_STRINGIFY]:' + String(err);
    }
  }

  /**
   * 生成uuid
   * stolen from https://github.com/kelektiv/node-uuid#readme uuid/v4
   *
   * @returns
   */
  function mathRNG() {
    var rnds = new Array(16);
    var r = 0;
    for (var i = 0; i < 16; i++) {
      if ((i & 0x03) === 0) {
        r = Math.random() * 0x100000000;
      }
      rnds[i] = (r >>> ((i & 0x03) << 3)) & 0xff;
    }
    return rnds;
  }
  function bytesToUuid(buf) {
    var byteToHex = [];
    for (var index = 0; index < 256; ++index) {
      byteToHex[index] = (index + 0x100).toString(16).substr(1);
    }
    var i = 0;
    var bth = byteToHex;
    // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
    return [
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
      '-',
      bth[buf[i++]],
      bth[buf[i++]],
      '-',
      bth[buf[i++]],
      bth[buf[i++]],
      '-',
      bth[buf[i++]],
      bth[buf[i++]],
      '-',
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
      bth[buf[i++]],
    ].join('');
  }
  function uuid() {
    var rnds = mathRNG();
    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    return bytesToUuid(rnds);
  }

  function createClient(creationConfig) {
    var builder = creationConfig.builder,
      createSender = creationConfig.createSender,
      createDefaultConfig = creationConfig.createDefaultConfig,
      createConfigManager = creationConfig.createConfigManager,
      userConfigNormalizer = creationConfig.userConfigNormalizer,
      initConfigNormalizer = creationConfig.initConfigNormalizer,
      validateInitConfig = creationConfig.validateInitConfig;
    var sender;
    var configManager;
    var handlers = {};
    EVENTS.forEach(function (e) {
      return (handlers[e] = []);
    });
    var inited = false;
    var started = false;
    // 缓存 start 之前 build 的事件
    var preStartQueue = [];
    // 禁止通过 provide 挂载的字段名
    var reservedNames = [];
    var client = {
      getBuilder: function () {
        return builder;
      },
      getSender: function () {
        return sender;
      },
      init: function (c) {
        if (inited) {
          throw new Error('already inited');
        }
        if (c && isObject(c) && validateInitConfig(c)) {
          var defaultConfig = createDefaultConfig(c);
          if (!defaultConfig) {
            throw new Error('defaultConfig missing');
          }
          var initConfig = initConfigNormalizer(c);
          configManager = createConfigManager(defaultConfig);
          configManager.setConfig(initConfig);
          configManager.onChange(function () {
            handle('config');
          });
          sender = createSender(configManager.getConfig());
          if (!sender) {
            throw new Error('sender missing');
          }
          inited = true;
          handle('init', true);
        } else {
          throw new Error('invalid InitConfig, init failed');
        }
      },
      set: function (c) {
        if (!inited) {
          return;
        }
        if (c && isObject(c)) {
          handle('beforeConfig', false, c);
          configManager === null || configManager === void 0
            ? void 0
            : configManager.setConfig(c);
        }
      },
      config: function (c) {
        if (!inited) {
          return;
        }
        if (c && isObject(c)) {
          handle('beforeConfig', false, c);
          configManager === null || configManager === void 0
            ? void 0
            : configManager.setConfig(userConfigNormalizer(c));
        }
        return configManager === null || configManager === void 0
          ? void 0
          : configManager.getConfig();
      },
      provide: function (name, value) {
        if (arrayIncludes(reservedNames, name)) {
          warn('cannot provide ' + name + ', reserved');
          return;
        }
        client[name] = value;
        handle('provide', false, name);
      },
      start: function () {
        var _this = this;
        if (!inited) {
          return;
        }
        if (started) {
          return;
        }
        configManager === null || configManager === void 0
          ? void 0
          : configManager.onReady(function () {
              started = true;
              handle('start', true);
              preStartQueue.forEach(function (e) {
                return _this.build(e);
              });
              preStartQueue = [];
            });
      },
      report: function (data) {
        if (!data) {
          return;
        }
        var processed = runProcessors(handlers['report'])(data);
        if (!processed) {
          return;
        }
        if (started) {
          this.build(processed);
        } else {
          preStartQueue.push(processed);
        }
      },
      build: function (data) {
        if (!started) {
          return;
        }
        var preBuild = runProcessors(handlers['beforeBuild'])(data);
        if (!preBuild) {
          return;
        }
        var built = builder.build(preBuild);
        if (!built) {
          return;
        }
        var processed = runProcessors(handlers['build'])(built);
        if (!processed) {
          return;
        }
        this.send(processed);
      },
      send: function (data) {
        if (!started) {
          return;
        }
        var processed = runProcessors(handlers['beforeSend'])(data);
        if (processed) {
          sender.send(processed);
          handle('send', false, processed);
        }
      },
      destroy: function () {
        handle('beforeDestroy', true);
      },
      on: function (ev, handler) {
        if (ev === 'init' && inited) {
          handler();
        } else if (ev === 'start' && started) {
          handler();
        } else if (handlers[ev]) {
          handlers[ev].push(handler);
        }
      },
      off: function (ev, handler) {
        if (handlers[ev]) handlers[ev] = arrayRemove(handlers[ev], handler);
      },
    };
    reservedNames = Object.keys(client);
    return client;
    function handle(ev, once) {
      if (once === void 0) {
        once = false;
      }
      var args = [];
      for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
      }
      handlers[ev].forEach(function (f) {
        try {
          f.apply(void 0, __spreadArray([], __read(args)));
        } catch (_err) {
          // ignore
        }
      });
      if (once) {
        handlers[ev].length = 0;
      }
    }
  }

  var ContextPlugin = function (client) {
    var contextAgent = createContextAgent();
    client.provide('context', contextAgent);
    client.on('report', function (ev) {
      if (!ev.extra) {
        ev.extra = {};
      }
      ev.extra.context = contextAgent.toString();
      return ev;
    });
  };

  var withCommandArray = function (
    client,
    captureContext,
    applyArgsWithContext,
  ) {
    // 缓存需要异步插件来消费的命令
    var cache = {};
    var newClient = function () {
      var _a;
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      var methodPath = args[0];
      if (!methodPath) return;
      var method = methodPath.split('.')[0];
      // 捕获上下文，等异步插件加载后传入
      if (!(method in newClient)) {
        var cachedCommands = cache[method] || [];
        // 区分预收集来的上下文与普通上下文
        var capturedContext =
          (_a =
            captureContext === null || captureContext === void 0
              ? void 0
              : captureContext(client)) !== null && _a !== void 0
            ? _a
            : {};
        cachedCommands.push(__spreadArray([capturedContext], __read(args)));
        cache[method] = cachedCommands;
        return;
      }
      return safeCall(newClient, methodPath, [].slice.call(args, 1));
    };
    hookObjectProperty(client, 'provide', function (origin) {
      return function (name, value) {
        newClient[name] = value;
        origin.call(client, name, value);
      };
    })();
    for (var nextKey in client) {
      // Avoid bugs when hasOwnProperty is shadowed
      if (Object.prototype.hasOwnProperty.call(client, nextKey)) {
        newClient[nextKey] = client[nextKey];
      }
    }
    client.on('provide', function (name) {
      if (cache[name]) {
        cache[name].forEach(function (cachedCommands) {
          var _a = __read(cachedCommands),
            capturedContext = _a[0],
            args = _a.slice(1);
          applyArgsWithContext === null || applyArgsWithContext === void 0
            ? void 0
            : applyArgsWithContext(client, capturedContext, args);
        });
        cache[name] = null;
      }
    });
    return newClient;
  };

  var applyMutationObserver = function (MutationObserver, callback) {
    var observer = MutationObserver && new MutationObserver(callback);
    var observe = function (target, options) {
      observer && target && observer.observe(target, options);
    };
    var disconnect = function () {
      return observer && observer.disconnect();
    };
    return [observe, disconnect];
  };
  var applyAnimationFrame = function (document, originRAF, originCAF, force) {
    var requestAnimationFrame =
      !isFunction(originRAF) || (force && document && document.hidden)
        ? function (cb) {
            cb(0);
            return 0;
          }
        : originRAF;
    var cancelAnimationFrame = isFunction(originCAF) ? originCAF : noop;
    /**
     * 以 animationFrame 调用函数，如果一帧内多次调用，则会取消前面的调用
     */
    var af;
    var scheduleAnimationFrame = function (cb) {
      af && cancelAnimationFrame(af);
      af = requestAnimationFrame(cb);
    };
    return [
      scheduleAnimationFrame,
      requestAnimationFrame,
      cancelAnimationFrame,
    ];
  };
  var applyPerformance = function (performance) {
    var timing = (performance && performance.timing) || undefined;
    var now = function () {
      if (performance && performance.now) return performance.now();
      var time = Date.now ? Date.now() : +new Date();
      var start = (timing && timing.navigationStart) || 0;
      return time - start;
    };
    var getEntriesByType = function (type) {
      var getEntriesByType = (performance || {}).getEntriesByType;
      return (
        (isFunction(getEntriesByType) &&
          getEntriesByType.call(performance, type)) ||
        []
      );
    };
    var getEntriesByName = function (name) {
      var getEntriesByName = (performance || {}).getEntriesByName;
      return (
        (isFunction(getEntriesByName) &&
          getEntriesByName.call(performance, name)) ||
        []
      );
    };
    var clearResourceTiming = function () {
      var clearResourceTimings = (performance || {}).clearResourceTimings;
      isFunction(clearResourceTimings) &&
        clearResourceTimings.call(performance);
    };
    return [
      timing,
      now,
      getEntriesByType,
      clearResourceTiming,
      getEntriesByName,
    ];
  };
  var applyPerformanceObserver = function (
    PerformanceObserver,
    callback,
    once,
    onFail,
  ) {
    var observer =
      PerformanceObserver &&
      new PerformanceObserver(function (list, ob) {
        if (list.getEntries) {
          list.getEntries().forEach(function (val, i, arr) {
            return callback(val, i, arr, ob);
          });
        } else {
          onFail && onFail();
        }
        once && ob.disconnect();
      });
    var observe = function () {
      var types = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        types[_i] = arguments[_i];
      }
      if (!PerformanceObserver || !observer) return onFail && onFail();
      try {
        types.forEach(function (type) {
          if (PerformanceObserver.supportedEntryTypes.indexOf(type) > -1) {
            observer.observe({ type: type, buffered: false });
          }
        });
      } catch (_a) {
        try {
          observer.observe({ entryTypes: types });
        } catch (_b) {
          //
        }
      }
    };
    var disconnect = function () {
      return observer && observer.disconnect();
    };
    return [observe, disconnect];
  };
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  var applyMonitor = function (monitorCtor, props, cb, deps) {
    if (props === void 0) {
      props = {};
    }
    if (deps === void 0) {
      deps = [];
    }
    try {
      var monitor = monitorCtor.apply(void 0, __spreadArray([], __read(deps)));
      return (monitor && monitor(props, cb)) || [];
    } catch (_a) {
      return [];
    }
  };

  function getDefaultBrowser() {
    if (typeof window === 'object' && isObject(window)) return window;
  }
  function getDefaultDocument() {
    if (typeof document === 'object' && isObject(document)) return document;
  }
  function getDefaultLocation() {
    return getDefaultBrowser() && window.location;
  }
  function getDefaultHistory() {
    return getDefaultBrowser() && window.history;
  }
  function getDefaultPerformance() {
    if (getDefaultBrowser() && isObject(window.performance))
      return window.performance;
  }
  function getDefaultXMLHttpRequest() {
    if (typeof XMLHttpRequest === 'function' && isFunction(XMLHttpRequest))
      return XMLHttpRequest;
  }
  function getDefaultFetch() {
    try {
      new Headers();
      new Request('');
      new Response();
      return window.fetch;
    } catch (_a) {
      //
    }
  }
  function getDefaultMutationObserver() {
    if (getDefaultBrowser() && isFunction(window.MutationObserver))
      return window.MutationObserver;
  }
  function getDefaultPerformanceObserver() {
    if (getDefaultBrowser() && isFunction(window.PerformanceObserver))
      return window.PerformanceObserver;
  }
  function getDefaultPerformanceTiming() {
    var performance = getDefaultPerformance();
    if (performance && isObject(performance.timing)) return performance.timing;
  }
  function getDefaultRaf() {
    if (getDefaultBrowser() && 'requestAnimationFrame' in window) {
      return window.requestAnimationFrame;
    }
  }
  function getDefaultCaf() {
    if (getDefaultBrowser() && 'cancelAnimationFrame' in window) {
      return window.cancelAnimationFrame;
    }
  }
  function getDefaultNavigator() {
    if (getDefaultBrowser() && 'navigator' in window) {
      return window.navigator;
    }
  }
  function getDefaultNetworkInformation() {
    var navigator = getDefaultNavigator();
    if (navigator) {
      return (
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection
      );
    }
  }

  function parseUrl(url) {
    var document = getDefaultDocument();
    if (!document) {
      // TODO: parse URL without document?
      return {
        url: url,
        protocol: '',
        domain: '',
        query: '',
        path: '',
        hash: '',
      };
    }
    var a = document.createElement('a');
    a.href = url;
    var path = a.pathname || '/';
    /* istanbul ignore next */
    if (path[0] !== '/') {
      path = '/' + path;
    }
    return {
      url: a.href,
      protocol: a.protocol.slice(0, -1),
      domain: a.hostname,
      query: a.search.substring(1),
      path: path,
      hash: a.hash,
    };
  }
  // parse location.href, without hash
  function getLocationUrl() {
    var location = getDefaultBrowser() && getDefaultLocation();
    return location
      ? {
          url: location.href,
          protocol: location.protocol.slice(0, -1),
          domain: location.hostname,
          path: location.pathname,
          query: location.search.substring(1),
        }
      : {};
  }

  var captureCurrentContext = function (client) {
    var capturedContext = __assign(__assign({}, getLocationUrl()), {
      timestamp: Date.now(),
    });
    var config = client.config();
    if (config === null || config === void 0 ? void 0 : config.pid) {
      capturedContext.pid = config.pid;
    }
    if (client === null || client === void 0 ? void 0 : client['context']) {
      capturedContext.context = client['context'].toString();
    }
    return capturedContext;
  };
  // only works for sync report
  // async report won't trigger 'report' immediately, es.g. sri
  var syncReportWithCapturedContext = function (client, ctx) {
    return function (fn) {
      var inject = function (ev) {
        ev.overrides = ctx;
        return ev;
      };
      client.on('report', inject);
      fn();
      client.off('report', inject);
    };
  };

  var getCookieId = function (cookieIdName) {
    var document = getDefaultDocument();
    if (document === null || document === void 0 ? void 0 : document.cookie) {
      return getValueFromCookieName(document.cookie, cookieIdName);
    }
    return '';
  };
  var setCookie = function (key, value) {
    var document = getDefaultDocument();
    if (document && key) {
      document.cookie = key + '=' + value;
    }
  };
  function getValueFromCookieName(cookie, name) {
    if (!cookie || !name) {
      return '';
    }
    return parseCookie(cookie)[name] || '';
  }
  function parseCookie(cookie) {
    var e_1, _a;
    var list = cookie.split(';');
    var cookieObj = {};
    try {
      for (
        var list_1 = __values(list), list_1_1 = list_1.next();
        !list_1_1.done;
        list_1_1 = list_1.next()
      ) {
        var item = list_1_1.value;
        var pair = item.split('=');
        var cookieKey = isString(pair[0]) && pair[0].trim();
        if (cookieKey && isString(pair[1])) {
          cookieObj[cookieKey] = pair[1].trim();
        }
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (list_1_1 && !list_1_1.done && (_a = list_1.return)) _a.call(list_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    return cookieObj;
  }

  /**
   * from sentry https://github.com/getsentry/sentry-javascript/blob/5.30.0/packages/utils/src/browser.ts
   */
  /**
   * Given a child DOM element, returns a query-selector statement describing that
   * and its ancestors
   * e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
   * @returns generated DOM path
   */
  function htmlTreeAsString(elem) {
    // try/catch both:
    // - accessing event.target (see getsentry/raven-js#838, #768)
    // - `htmlTreeAsString` because it's complex, and just accessing the DOM incorrectly
    // - can throw an exception in some circumstances.
    try {
      var currentElem = elem;
      var MAX_TRAVERSE_HEIGHT = 5;
      var MAX_OUTPUT_LEN = 80;
      var out = [];
      var height = 0;
      var len = 0;
      var separator = ' > ';
      var sepLength = separator.length;
      var nextStr = void 0;
      while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
        nextStr = _htmlElementAsString(currentElem);
        // bail out if
        // - nextStr is the 'html' element
        // - the length of the string that would be created exceeds MAX_OUTPUT_LEN
        //   (ignore this limit if we are on the first iteration)
        if (
          nextStr === 'html' ||
          (height > 1 &&
            len + out.length * sepLength + nextStr.length >= MAX_OUTPUT_LEN)
        ) {
          break;
        }
        out.push(nextStr);
        len += nextStr.length;
        currentElem = currentElem.parentNode;
      }
      return out.reverse().join(separator);
    } catch (_oO) {
      return '<unknown>';
    }
  }
  /**
   * Returns a simple, query-selector representation of a DOM element
   * e.g. [HTMLElement] => input#foo.btn[name=baz]
   * @returns generated DOM path
   */
  function _htmlElementAsString(el) {
    var elem = el;
    var out = [];
    var classes;
    var key;
    var attr;
    var i;
    if (!elem || !elem.tagName) {
      return '';
    }
    out.push(elem.tagName.toLowerCase());
    if (elem.id) {
      out.push('#' + elem.id);
    }
    var className = elem.className;
    if (className && isString(className)) {
      classes = className.split(/\s+/);
      for (i = 0; i < classes.length; i++) {
        out.push('.' + classes[i]);
      }
    }
    var attrWhitelist = ['type', 'name', 'title', 'alt'];
    for (i = 0; i < attrWhitelist.length; i++) {
      key = attrWhitelist[i];
      attr = elem.getAttribute(key);
      if (attr) {
        out.push('[' + key + '="' + attr + '"]');
      }
    }
    return out.join('');
  }
  var applyDomAndKeyPress = function (debounceDuration) {
    var keypressTimeout;
    /**
     * Wraps addEventListener to capture UI breadcrumbs
     * @param name the event name (e.g. "click")
     * @param handler function that will be triggered
     * @param debounce decides whether it should wait till another event loop
     * @returns wrapped breadcrumb events handler
     * @hidden
     */
    var domEventHandler = function (name, handler) {
      var lastCapturedEvent;
      return function (event) {
        // reset keypress timeout; e.g. triggering a 'click' after
        // a 'keypress' will reset the keypress debounce so that a new
        // set of keypresses can be recorded
        keypressTimeout = undefined;
        // It's possible this handler might trigger multiple times for the same
        // event (e.g. event propagation through node ancestors). Ignore if we've
        // already captured the event.
        if (!event || lastCapturedEvent === event) {
          return;
        }
        lastCapturedEvent = event;
        handler({ event: event, name: name });
      };
    };
    /**
     * Wraps addEventListener to capture keypress UI events
     * @param handler function that will be triggered
     * @returns wrapped keypress events handler
     * @hidden
     */
    var keypressEventHandler = function (handler) {
      // TODO: if somehow user switches keypress target before
      //       debounce timeout is triggered, we will only capture
      //       a single breadcrumb from the FIRST target (acceptable?)
      return function (event) {
        var target;
        try {
          target = event.target;
        } catch (e) {
          // just accessing event properties can throw an exception in some rare circumstances
          // see: https://github.com/getsentry/raven-js/issues/838
          return;
        }
        var tagName = target && target.tagName;
        // only consider keypress events on actual input elements
        // this will disregard keypresses targeting body (e.g. tabbing
        // through elements, hotkeys, etc)
        if (
          !tagName ||
          (tagName !== 'INPUT' &&
            tagName !== 'TEXTAREA' &&
            !target.isContentEditable)
        ) {
          return;
        }
        // record first keypress in a series, but ignore subsequent
        // keypresses until debounce clears
        !keypressTimeout && domEventHandler('input', handler)(event);
        clearTimeout(keypressTimeout);
        keypressTimeout = window.setTimeout(function () {
          keypressTimeout = undefined;
        }, debounceDuration);
      };
    };
    return [domEventHandler, keypressEventHandler];
  };
  var triggerHandlers = function (domBreadcrumb, type) {
    return function (data) {
      if (!type) {
        return;
      }
      try {
        domBreadcrumb(data);
      } catch (e) {
        // ignore
      }
    };
  };
  /**
   * Creates breadcrumbs from DOM API calls
   */
  var domBreadcrumb = function (addBreadcrumb) {
    return function (handlerData) {
      var target;
      // Accessing event.target can throw (see getsentry/raven-js#838, #768)
      try {
        target = handlerData.event.target
          ? htmlTreeAsString(handlerData.event.target)
          : htmlTreeAsString(handlerData.event);
      } catch (e) {
        target = '<unknown>';
      }
      if (target.length === 0) {
        return;
      }
      addBreadcrumb({
        type: 'dom',
        category: 'ui.' + handlerData.name,
        message: target,
      });
    };
  };

  function onPageLoad(callback) {
    var window = getDefaultBrowser();
    var document = getDefaultDocument();
    if (!window || !document) return;
    if (document.readyState === 'complete') {
      callback();
      return;
    }
    window.addEventListener(
      'load',
      function () {
        setTimeout(function () {
          callback();
        }, 0);
      },
      false,
    );
  }
  var invokeCallbackOnce = function (cb) {
    var hasInvoked = false;
    var invoke = function (params) {
      if (hasInvoked) return;
      hasInvoked = true;
      cb && cb(params);
    };
    return [invoke];
  };
  var onPageUnload = function (cb) {
    var _a = __read(invokeCallbackOnce(cb), 1),
      invokeCbOnce = _a[0];
    ['unload', 'beforeunload', 'pagehide'].forEach(function (ev) {
      addEventListener(ev, invokeCbOnce);
    });
  };
  var onHidden = function (cb, once) {
    var onVisibilityChange = function (event) {
      if (document.visibilityState === 'hidden') {
        cb(event);
        if (once) {
          removeEventListener('visibilitychange', onVisibilityChange, true);
        }
      }
    };
    addEventListener('visibilitychange', onVisibilityChange, true);
  };
  var loadScript = function (url, callback) {
    var _a;
    /* istanbul ignore next */
    var document = getDefaultDocument();
    // untestable for now
    /* istanbul ignore next */
    if (document) {
      var script = document.createElement('script');
      script.src = url;
      script.crossOrigin = 'anonymous';
      script.onload = callback;
      (_a = document.head) === null || _a === void 0
        ? void 0
        : _a.appendChild(script);
    }
  };

  // TODO pengli 过滤敏感header 提供开关强制上传
  // const isHeaderInBlackList = (name: string) => {
  //   return ['x-tt-token'].indexOf(name.toLowerCase()) > -1
  // }
  function getUrlParams(baseUrl) {
    return parseUrl(baseUrl);
  }
  function formatXHRAllResponseHeaders(headers) {
    if (isString(headers) && headers) {
      return headers.split('\r\n').reduce(function (result, line) {
        if (isString(line)) {
          var _a = __read(line.split(': '), 2),
            name_1 = _a[0],
            value = _a[1];
          result[name_1.toLowerCase()] = value;
        }
        return result;
      }, {});
    }
    return {};
  }
  var getEventParams = function (xhr, props, getLatestEntryByName) {
    var _method = xhr._method,
      _reqHeaders = xhr._reqHeaders,
      _url = xhr._url,
      _start = xhr._start,
      _data = xhr._data;
    var params = {
      api: 'xhr',
      request: __assign(__assign({}, getUrlParams(_url)), {
        method: _method.toLowerCase(),
        headers: _reqHeaders,
        timestamp: _start,
      }),
      response: {
        status: xhr.status || 0,
        is_custom_error: false,
        timing: getLatestEntryByName(xhr.responseURL),
        timestamp: Date.now(),
      },
      duration: Date.now() - _start,
    };
    if (typeof xhr.getAllResponseHeaders === 'function') {
      params.response.headers = formatXHRAllResponseHeaders(
        xhr.getAllResponseHeaders(),
      );
    }
    var status = params.response.status;
    // 非 2xx , 3xx 请求，上传request body
    if (props.collectBodyOnError && status >= 400) {
      params.request.body = _data ? '' + _data : undefined;
      params.response.body = xhr.response ? '' + xhr.response : undefined;
    }
    return params;
  };
  var checkIsIgnored = function (ignoreUrls, url) {
    var ignoreRgx = getRegexp(ignoreUrls || []);
    return !!ignoreRgx && ignoreRgx.test(url);
  };
  var getGetLatestEntryByName = function (performance) {
    var _a = __read(applyPerformance(performance), 5),
      getEntriesByName = _a[4];
    return function (name) {
      return getEntriesByName(name).pop();
    };
  };

  var hookSetHeader = function (setRequestHeader) {
    return function () {
      var setOptions = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        setOptions[_i] = arguments[_i];
      }
      this._reqHeaders = this._reqHeaders || {};
      var _a = __read(setOptions, 2),
        name = _a[0],
        value = _a[1];
      this._reqHeaders[name.toLowerCase()] = value;
      return setRequestHeader && setRequestHeader.apply(this, setOptions);
    };
  };
  var hookOnreadystatechange = function (xhr, getLatestEntryByName) {
    return hookMethodDangerously(xhr, 'onreadystatechange', function (
      origin,
      props,
      cb,
    ) {
      return function () {
        var ev = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          ev[_i] = arguments[_i];
        }
        try {
          this.readyState === 4 &&
            !checkIsIgnored(props.ignoreUrls, xhr._url) &&
            cb &&
            cb({
              ev_type: 'http',
              payload: getEventParams(xhr, props, getLatestEntryByName),
            });
        } catch (_a) {
          // do nothing
        }
        return origin && origin.apply(this, ev);
      };
    });
  };
  var hookSend = function (send, props, cb, getLatestEntryByName) {
    return function () {
      var sendOptions = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        sendOptions[_i] = arguments[_i];
      }
      hookOnreadystatechange(this, getLatestEntryByName)(
        props,
        props.hookCbAtReq(cb),
      );
      this._start = Date.now();
      this._data =
        sendOptions === null || sendOptions === void 0
          ? void 0
          : sendOptions[0];
      return send.apply(this, sendOptions);
    };
  };
  var hookOpen = function (open) {
    return function () {
      var _a;
      var openOptions = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        openOptions[_i] = arguments[_i];
      }
      (_a = __read(openOptions, 2)),
        (this._method = _a[0]),
        (this._url = _a[1]);
      return open.apply(this, openOptions);
    };
  };
  var hookXhr = function (Xhr, props, cb, getLatestEntryByName) {
    var Ctor = /** @class */ (function () {
      function Ctor() {
        var xhr = new Xhr();
        hookMethodDangerously(xhr, 'open', hookOpen)();
        hookMethodDangerously(xhr, 'setRequestHeader', hookSetHeader)();
        hookMethodDangerously(xhr, 'send', hookSend)(
          props,
          cb,
          getLatestEntryByName,
        );
        return xhr;
      }
      Ctor.UNSENT = Xhr.UNSENT;
      Ctor.OPENED = Xhr.OPENED;
      Ctor.HEADERS_RECEIVED = Xhr.HEADERS_RECEIVED;
      Ctor.LOADING = Xhr.LOADING;
      Ctor.DONE = Xhr.DONE;
      return Ctor;
    })();
    (
      Object.setPrototypeOf ||
      function (obj, proto) {
        obj.__proto__ = proto;
        return obj;
      }
    )(Ctor, Xhr.prototype);
    ['DONE', 'HEADERS_RECIEVED', 'LOADING', 'OPENED', 'UNSENT'].forEach(
      function (key) {
        Ctor[key] = Xhr[key];
      },
    );
    return Ctor;
  };
  var AjaxMonitor = function (global, performance) {
    if (global === void 0) {
      global = getDefaultXMLHttpRequest() && getDefaultBrowser();
    }
    if (performance === void 0) {
      performance = getDefaultPerformance();
    }
    if (!global) {
      return;
    }
    var getLatestEntryByName = getGetLatestEntryByName(performance);
    return function (props, cb) {
      if (props.autoWrap) {
        hookMethodDangerously(global, 'XMLHttpRequest', hookXhr)(
          props,
          cb,
          getLatestEntryByName,
        );
      }
      var wrapXhr = function (xhr, p, c) {
        if (p === void 0) {
          p = props;
        }
        if (c === void 0) {
          c = cb;
        }
        return hookXhr(xhr, p, c, getLatestEntryByName);
      };
      return [wrapXhr];
    };
  };

  function getPluginConfig(client, pluginName, defaultConfig) {
    var _a;
    var c =
      (_a = client.config()) === null || _a === void 0
        ? void 0
        : _a.plugins[pluginName];
    if (isObject(c)) {
      return __assign(__assign({}, defaultConfig), c);
    } else {
      return c ? defaultConfig : false;
    }
  }
  var reportOnInitCommonParams = function (client, overrides) {
    var clientConfig = client.config();
    var common = __assign(__assign({}, getLocationUrl()), {
      pid: clientConfig.pid,
      viewId: clientConfig.viewId,
    });
    return function (ev) {
      client.report(
        __assign(__assign({}, ev), {
          overrides: __assign(
            __assign({}, common),
            (overrides && overrides(ev)) || {},
          ),
        }),
      );
    };
  };

  var AJAX_MONITOR_PLUGIN_NAME = 'ajax';
  var defaultConfig$8 = {
    autoWrap: true,
    hookCbAtReq: id,
    ignoreUrls: [],
    collectBodyOnError: false,
  };
  var getCbHook = function (client) {
    return function (cb) {
      var _a;
      if (!cb) return cb;
      var clientConfig = client.config();
      var common = __assign(__assign({}, getLocationUrl()), {
        pid: clientConfig.pid,
        context:
          (_a =
            client === null || client === void 0
              ? void 0
              : client['context']) === null || _a === void 0
            ? void 0
            : _a.toString(),
        viewId: clientConfig.viewId,
      });
      return function (ev) {
        cb(
          __assign(__assign({}, ev), {
            overrides: __assign(__assign({}, common), {
              timestamp: ev.payload.request.timestamp,
            }),
          }),
        );
      };
    };
  };
  function AjaxMonitorPlugin(client) {
    client.on('init', function () {
      var config = getPluginConfig(
        client,
        AJAX_MONITOR_PLUGIN_NAME,
        defaultConfig$8,
      );
      if (!config) {
        return;
      }
      var _a = __read(
          applyMonitor(
            AjaxMonitor,
            __assign(__assign({}, config), { hookCbAtReq: getCbHook(client) }),
            client.report.bind(client),
          ),
          1,
        ),
        wrapXhr = _a[0];
      client.provide('wrapXhr', wrapXhr);
    });
  }

  var applyBreadcrumb = function (
    maxBreadcrumbs,
    onAddBreadcrumb,
    onMaxBreadcrumbs,
  ) {
    if (maxBreadcrumbs === void 0) {
      maxBreadcrumbs = 20;
    }
    if (onAddBreadcrumb === void 0) {
      onAddBreadcrumb = id;
    }
    if (onMaxBreadcrumbs === void 0) {
      onMaxBreadcrumbs = function (bs, max) {
        return bs.slice(-max);
      };
    }
    var breadcrumbs = [];
    var addBreadcrumb = function (breadcrumb) {
      var processed = onAddBreadcrumb(breadcrumb);
      if (processed) {
        var mergedBreadcrumb = __assign(__assign({}, breadcrumb), {
          timestamp: breadcrumb.timestamp || Date.now(),
        });
        breadcrumbs =
          maxBreadcrumbs >= 0 && breadcrumbs.length + 1 > maxBreadcrumbs
            ? onMaxBreadcrumbs(
                __spreadArray(__spreadArray([], __read(breadcrumbs)), [
                  mergedBreadcrumb,
                ]),
                maxBreadcrumbs,
              )
            : __spreadArray(__spreadArray([], __read(breadcrumbs)), [
                mergedBreadcrumb,
              ]);
      }
    };
    return [
      function () {
        return breadcrumbs;
      },
      addBreadcrumb,
    ];
  };

  var BreadcrumbMonitor = function (document) {
    if (document === void 0) {
      document = getDefaultDocument();
    }
    if (!document) {
      return;
    }
    return function (props, _cb) {
      var maxBreadcrumbs = props.maxBreadcrumbs,
        onAddBreadcrumb = props.onAddBreadcrumb,
        onMaxBreadcrumbs = props.onMaxBreadcrumbs,
        dom = props.dom;
      var _a = __read(applyDomAndKeyPress(100), 2),
        domEventHandler = _a[0],
        keypressHandler = _a[1];
      var _b = __read(
          applyBreadcrumb(maxBreadcrumbs, onAddBreadcrumb, onMaxBreadcrumbs),
          2,
        ),
        getBreadcrumbs = _b[0],
        addBreadcrumb = _b[1];
      var createDomBreadcrumb = domBreadcrumb(addBreadcrumb);
      var handlers = [];
      if (dom) {
        handlers.push(
          domEventHandler('click', triggerHandlers(createDomBreadcrumb, 'dom')),
        );
        handlers.push(
          keypressHandler(triggerHandlers(createDomBreadcrumb, 'dom')),
        );
        document.addEventListener('click', handlers[0]);
        document.addEventListener('keypress', handlers[1]);
      }
      var teardown = function () {
        document.removeEventListener('click', handlers[0]);
        document.removeEventListener('keypress', handlers[1]);
      };
      return [getBreadcrumbs, addBreadcrumb, teardown];
    };
  };

  var BREADCRUMB_MONITOR_PLUGIN_NAME = 'breadcrumb';
  var defaultConfig$7 = {
    maxBreadcrumbs: 20,
    dom: true,
  };
  function BreadcrumbMonitorPlugin(client) {
    client.on('init', function () {
      var config = getPluginConfig(
        client,
        BREADCRUMB_MONITOR_PLUGIN_NAME,
        defaultConfig$7,
      );
      if (!config) {
        return;
      }
      var _a = __read(applyMonitor(BreadcrumbMonitor, config, noop), 2),
        getBreadcrumbs = _a[0],
        addBreadcrumb = _a[1];
      client.on('report', function (ev) {
        if (ev.ev_type === 'http') {
          addBreadcrumb({
            type: 'http',
            category: ev.payload.api,
            message: '',
            data: {
              method: ev.payload.request.method,
              path: ev.payload.request.path,
              url: ev.payload.request.url,
              status_code: String(ev.payload.response.status),
            },
            timestamp: ev.payload.request.timestamp,
          });
        }
        return ev;
      });
      client.provide('getBreadcrumbs', getBreadcrumbs);
      client.provide('addBreadcrumb', addBreadcrumb);
    });
  }

  function isHttpURL(url) {
    if (!isString(url)) {
      return false;
    }
    var _a = __read(url.split(':'), 2),
      protocol = _a[0],
      path = _a[1];
    return !path || protocol === 'http' || protocol === 'https';
  }
  function isRequest(req, Request) {
    return req instanceof Request;
  }
  function isHeaders(headers, Headers) {
    return headers instanceof Headers;
  }
  var getFetchUrl = function (req, withQuery, Request) {
    if (withQuery === void 0) {
      withQuery = false;
    }
    var url = '';
    if (isRequest(req, Request)) {
      url = req.url;
    } else {
      url = req;
    }
    if (!withQuery) {
      url = isString(url) ? url.split('?')[0] : url;
    }
    return url;
  };
  function mergeHeaders(req, options, Headers, Request) {
    var headers = new Headers();
    if (
      isRequest(req, Request) &&
      req.headers &&
      isFunction(req.headers.forEach)
    ) {
      req.headers.forEach(function (value, key) {
        headers.append(key, value);
      });
    }
    if (options.headers) {
      var optionsHeaders = new Headers(options.headers);
      optionsHeaders.forEach(function (value, key) {
        headers.append(key, value);
      });
    }
    return headers;
  }
  var getAllHeaders = function (headers, Headers) {
    if (!headers) {
      return {};
    }
    if (isHeaders(headers, Headers)) {
      var _headers_1 = {};
      headers.forEach(function (value, key) {
        _headers_1[key] = value;
      });
      return _headers_1;
    } else if (isArray(headers)) {
      return headers.reduce(function (prev, _a) {
        var _b = __read(_a, 2),
          key = _b[0],
          value = _b[1];
        prev[key] = value;
        return prev;
      }, {});
    }
    return headers;
  };
  var getFetchMethod = function (req, options, Request) {
    var method = (options && options.method) || 'get';
    if (isRequest(req, Request)) {
      method = req.method || method;
    }
    return method.toLowerCase();
  };
  var getFetchBody = function (req, options, Request) {
    if (isRequest(req, Request)) {
      return req.body;
    } else {
      return options === null || options === void 0 ? void 0 : options.body;
    }
  };
  var getRequestParams = function (url, req, options, Request) {
    return __assign(
      { method: getFetchMethod(req, options, Request), timestamp: Date.now() },
      getUrlParams(url),
    );
  };

  /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
  var hookFetch$1 = function (
    _fetch,
    props,
    cb,
    Headers,
    Request,
    getLatestEntryByName,
  ) {
    return function (req, options) {
      if (options === void 0) {
        options = {};
      }
      var fetchPromise = _fetch(req, options);
      var url = getFetchUrl(req, false, Request);
      // 有业务方通过 fetch 来将 base64 转化成 blob || 业务方自行配置ignore
      if (!isHttpURL(url) || checkIsIgnored(props.ignoreUrls, url)) {
        return fetchPromise;
      }
      var httpPayload = {
        api: 'fetch',
        request: getRequestParams(
          req instanceof Request ? req.url : req,
          req,
          options,
          Request,
        ),
        response: {
          is_custom_error: false,
        },
        duration: 0,
      };
      httpPayload.request.headers = getAllHeaders(
        mergeHeaders(req, options, Headers, Request),
        Headers,
      );
      var hookedCb = props.hookCbAtReq(cb);
      var revokeCb = function () {
        hookedCb &&
          hookedCb({
            ev_type: 'http',
            payload: httpPayload,
          });
      };
      var onResolve = function (res) {
        var _a;
        try {
          httpPayload.response.status = res.status || 0;
          httpPayload.response.headers = getAllHeaders(res.headers, Headers);
          httpPayload.duration = Date.now() - httpPayload.request.timestamp;
          if (props.collectBodyOnError && res.status >= 400) {
            // fetch response body 正确地拿到涉及到异步和拷贝 先不拿
            httpPayload.request.body =
              (_a = getFetchBody(req, options, Request)) === null ||
              _a === void 0
                ? void 0
                : _a.toString();
          }
          var setTiming_1 = function () {
            return (httpPayload.response.timing = getLatestEntryByName(
              res.url,
            ));
          };
          // 存在 entry 立即拿拿不到的情况
          setTimeout(function () {
            setTiming_1();
            revokeCb();
          }, 100);
        } catch (_b) {
          // do nothing
        }
      };
      var onReject = function () {
        var _a;
        try {
          // 请求失败,或被拦截
          httpPayload.response.status = 0;
          httpPayload.duration = Date.now() - httpPayload.request.timestamp;
          // there won't be response in reject handler unless aborted
          // https://fetch.spec.whatwg.org/#:~:text=If%20response%E2%80%99s%20body%20is%20not%20null%20and%20is%20readable
          if (props.collectBodyOnError) {
            /* istanbul ignore next */
            httpPayload.request.body =
              (_a = getFetchBody(req, options, Request)) === null ||
              _a === void 0
                ? void 0
                : _a.toString();
          }
        } catch (_b) {
          // do nothing
        }
        revokeCb();
      };
      fetchPromise.then(onResolve, onReject);
      return fetchPromise;
    };
  };
  var FetchMonitor = function (global, Headers, Request, performance) {
    if (global === void 0) {
      global = getDefaultFetch() && getDefaultBrowser();
    }
    if (Headers === void 0) {
      Headers = window.Headers;
    }
    if (Request === void 0) {
      Request = window.Request;
    }
    if (performance === void 0) {
      performance = getDefaultPerformance();
    }
    if (!global || !Headers || !Request) {
      return;
    }
    var getLatestEntryByName = getGetLatestEntryByName(performance);
    return function (props, cb) {
      if (props.autoWrap) {
        // 劫持用户 fetch 方法
        hookMethodDangerously(global, 'fetch', hookFetch$1)(
          props,
          cb,
          Headers,
          Request,
          getLatestEntryByName,
        );
      }
      var wrapFetch = function (fetch, p, c) {
        if (p === void 0) {
          p = props;
        }
        if (c === void 0) {
          c = cb;
        }
        return hookFetch$1(fetch, p, c, Headers, Request, getLatestEntryByName);
      };
      return [wrapFetch];
    };
  };

  var FETCH_MONITOR_PLUGIN_NAME = 'fetch';
  var defaultConfig$6 = {
    autoWrap: true,
    hookCbAtReq: id,
    ignoreUrls: [],
    collectBodyOnError: false,
  };
  function FetchMonitorPlugin(client) {
    client.on('init', function () {
      var config = getPluginConfig(
        client,
        FETCH_MONITOR_PLUGIN_NAME,
        defaultConfig$6,
      );
      if (!config) {
        return;
      }
      var _a = __read(
          applyMonitor(
            FetchMonitor,
            __assign(__assign({}, config), { hookCbAtReq: getCbHook(client) }),
            client.report.bind(client),
          ),
          1,
        ),
        wrapFetch = _a[0];
      client.provide('wrapFetch', wrapFetch);
    });
  }

  var ERROR_FIELDS = [
    'name',
    'message',
    'stack',
    'filename',
    'lineno',
    'colno',
  ];
  var normalize = function (ex) {
    var error;
    if (!isError(ex)) {
      if (isPlainObject(ex) || isEvent(ex)) {
        error = {
          message: safeStringify(ex),
        };
      }
      if (isString(ex)) {
        error = {
          message: ex,
        };
      }
    } else {
      error = pick(ex, ERROR_FIELDS);
    }
    return error;
  };
  var normalizeError = function (event) {
    return normalize(event.error);
  };
  var normalizeException = function (event) {
    var error;
    // dig the object of the rejection out of known event types
    try {
      // PromiseRejectionEvents store the object of the rejection under 'reason'
      // see https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
      if ('reason' in event) {
        error = event.reason;
      }
      // something, somewhere, (likely a browser extension) effectively casts PromiseRejectionEvents
      // to CustomEvents, moving the `promise` and `reason` attributes of the PRE into
      // the CustomEvent's `detail` attribute, since they're not part of CustomEvent's spec
      // see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent and
      // https://github.com/getsentry/sentry-javascript/issues/2380
      else if ('detail' in event && 'reason' in event.detail) {
        error = event.detail.reason;
      }
    } catch (_oO) {
      // no-empty
    }
    return normalize(error);
  };
  var normalizeUnknownError = function (exception) {
    if (isErrorEvent(exception)) {
      return normalizeError(exception);
    } else if (isPromiseRejectionEvent(exception)) {
      return normalizeException(exception);
    } else {
      return normalize(exception);
    }
  };

  /* eslint-disable @typescript-eslint/prefer-optional-chain */
  var JS_ERROR_EV_TYPE = 'js_error';
  var JsErrorMonitor = function (window) {
    if (window === void 0) {
      window = getDefaultBrowser();
    }
    if (!window) {
      return;
    }
    return function (props, cb) {
      var ignoreErrors = props.ignoreErrors,
        onerror = props.onerror,
        onunhandledrejection = props.onunhandledrejection;
      var ignoreRegExp = getRegexp(ignoreErrors);
      var report = function (error, extra) {
        if (cb && error) {
          if (ignoreRegExp && ignoreRegExp.test(error.message)) {
            return;
          }
          cb({
            ev_type: JS_ERROR_EV_TYPE,
            payload: {
              error: error,
              breadcrumbs: [],
              extra: extra,
            },
          });
        }
      };
      if (onerror) {
        window.addEventListener('error', function (ev) {
          return report(normalizeError(ev));
        });
      }
      if (onunhandledrejection) {
        window.addEventListener('unhandledrejection', function (ev) {
          return report(normalizeException(ev));
        });
      }
      return [
        function (err, extra) {
          return report(normalizeUnknownError(err), extra);
        },
      ];
    };
  };

  var JS_ERROR_MONITOR_PLUGIN_NAME = 'jsError';
  var defaultConfig$5 = {
    ignoreErrors: [],
    onerror: true,
    onunhandledrejection: true,
  };
  function JsErrorMonitorPlugin(client) {
    client.on('init', function () {
      var config = getPluginConfig(
        client,
        JS_ERROR_MONITOR_PLUGIN_NAME,
        defaultConfig$5,
      );
      if (!config) {
        return;
      }
      var _a = __read(
          applyMonitor(JsErrorMonitor, config, function (ev) {
            if (client.getBreadcrumbs) {
              ev.payload.breadcrumbs = client.getBreadcrumbs();
            }
            client.report(ev);
          }),
          1,
        ),
        ReportJsError = _a[0];
      // 暂停监听
      window.removeEventListener('error', client.pcErr, true);
      window.removeEventListener('unhandledrejection', client.pcRej, true);
      client.provide('captureException', ReportJsError);
    });
  }

  /* eslint-disable @typescript-eslint/prefer-optional-chain */
  var getDefaultExtractor = function (routeMode) {
    return function (url) {
      var _a;
      if (routeMode === 'hash') {
        return (
          ((_a = parseUrl(url).hash) === null || _a === void 0
            ? void 0
            : _a.replace(/^#/, '')) || '/'
        );
      } else {
        return parseUrl(url).path;
      }
    };
  };
  var applyOnPidChange = function (cb, initPid, onPidUpdate) {
    var pid = initPid;
    var onPidChange = function (source, newPid) {
      if (newPid !== pid) {
        pid = newPid;
        onPidUpdate && onPidUpdate(pid); // update pid in common
        cb(source, pid);
      }
    };
    return [onPidChange];
  };
  var applyOnUrlChange = function (cb, initUrl) {
    var url = initUrl;
    var onUrlChange = function (source, newUrl) {
      if (newUrl !== url) {
        url = newUrl;
        cb(source, url);
      }
    };
    return [onUrlChange];
  };

  var PAGEVIEW_EV_TYPE = 'pageview';
  var PageviewMonitor = function (window, location, history) {
    if (window === void 0) {
      window = getDefaultBrowser();
    }
    if (location === void 0) {
      location = getDefaultLocation();
    }
    if (history === void 0) {
      history = getDefaultHistory();
    }
    if (!window || !location) {
      return;
    }
    return function (props, cb) {
      var sendInit = props.sendInit,
        initPid = props.initPid,
        routeMode = props.routeMode,
        extractPid = props.extractPid,
        onPidUpdate = props.onPidUpdate;
      var restoreFns = [];
      var report = function (source, pid) {
        cb &&
          cb({
            ev_type: PAGEVIEW_EV_TYPE,
            payload: {
              pid: pid,
              source: source,
            },
          });
      };
      var _a = __read(applyOnPidChange(report, '', onPidUpdate), 1),
        onPidChange = _a[0];
      var sendPageview = onPidChange.bind(null, 'user_set' /* user_set */);
      var extractPidFromUrl =
        extractPid ||
        (routeMode === 'manual'
          ? function () {
              return '';
            }
          : getDefaultExtractor(routeMode));
      if (routeMode !== 'manual') {
        var _b = __read(
            applyOnUrlChange(function (sources, url) {
              return onPidChange(sources, extractPidFromUrl(url));
            }, ''),
            1,
          ),
          onUrlChange_1 = _b[0];
        var historyChangeListener_1 = function () {
          return onUrlChange_1('history' /* history */, location.href);
        };
        if (history) {
          var hookStateChange = function (origin) {
            return function () {
              var params = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
              }
              try {
                origin.apply(history, params);
              } finally {
                historyChangeListener_1();
              }
            };
          };
          restoreFns.push(
            hookObjectProperty(history, 'pushState', hookStateChange)(),
            hookObjectProperty(history, 'replaceState', hookStateChange)(),
          );
        }
        if (routeMode === 'hash') {
          var hashChangeListener_1 = function () {
            return onUrlChange_1('hash' /* hash */, location.href);
          };
          window.addEventListener('hashchange', hashChangeListener_1, true);
          restoreFns.push(function () {
            return window.removeEventListener(
              'hashchange',
              hashChangeListener_1,
              true,
            );
          });
        } else {
          window.addEventListener('popstate', historyChangeListener_1, true);
          restoreFns.push(function () {
            return window.removeEventListener(
              'popstate',
              historyChangeListener_1,
              true,
            );
          });
        }
      }
      var tearDown = function () {
        restoreFns.forEach(function (fn) {
          return fn();
        });
      };
      if (sendInit) {
        onPidChange(
          'init' /* init */,
          initPid || extractPidFromUrl(location.href),
        );
      } else if (!initPid) {
        onPidUpdate && onPidUpdate(extractPidFromUrl(location.href));
      }
      return [sendPageview, tearDown];
    };
  };

  var PAGEVIEW_MONITOR_PLUGIN_NAME = 'pageview';
  var defaultConfig$4 = {
    sendInit: true,
    routeMode: 'history',
  };
  function PageviewMonitorPlugin(client) {
    client.on('init', function () {
      var _a;
      var config = getPluginConfig(
        client,
        PAGEVIEW_MONITOR_PLUGIN_NAME,
        defaultConfig$4,
      );
      if (!config) {
        return;
      }
      var _b = __read(
          applyMonitor(
            PageviewMonitor,
            __assign(__assign({}, config), {
              initPid:
                (_a = client.config()) === null || _a === void 0
                  ? void 0
                  : _a.pid,
              onPidUpdate: function (pid) {
                client.set({ pid: pid });
              },
            }),
            client.report.bind(client),
          ),
          2,
        ),
        sendPageview = _b[0],
        tearDown = _b[1];
      client.on('config', function () {
        sendPageview(client.config().pid);
      });
      client.on('beforeDestroy', tearDown);
      client.provide('sendPageview', sendPageview);
    });
  }

  var RESOURCE_EV_TYPE = 'resource';
  var RESOURCE_PERFORMANCE_ENTRY_TYPE = 'resource';
  var RESOURCE_IGNORE_TYPES = ['xmlhttprequest', 'fetch', 'beacon'];
  var ResourceMonitor = function (
    performance,
    performanceObserver,
    performanceTiming,
  ) {
    if (performance === void 0) {
      performance = getDefaultPerformance();
    }
    if (performanceObserver === void 0) {
      performanceObserver = getDefaultPerformanceObserver();
    }
    if (performanceTiming === void 0) {
      performanceTiming = getDefaultPerformanceTiming();
    }
    if (!performance) {
      return;
    }
    return function (props, cb) {
      var ignoreUrls = props.ignoreUrls,
        slowSessionThreshold = props.slowSessionThreshold,
        ignoreTypes = props.ignoreTypes;
      var ignoreRegExp = getRegexp(ignoreUrls);
      var report = function (resources, isSlowSession) {
        if (isSlowSession === void 0) {
          isSlowSession = false;
        }
        resources = resources.filter(function (entry) {
          return (
            !arrayIncludes(
              ignoreTypes !== null && ignoreTypes !== void 0
                ? ignoreTypes
                : RESOURCE_IGNORE_TYPES,
              entry.initiatorType,
            ) &&
            !(ignoreRegExp === null || ignoreRegExp === void 0
              ? void 0
              : ignoreRegExp.test(entry.name))
          );
        });
        if (cb && resources.length) {
          resources.forEach(function (r) {
            cb([
              {
                ev_type: RESOURCE_EV_TYPE,
                payload: r,
              },
              isSlowSession,
            ]);
          });
        }
      };
      var checkSlowSession = function () {
        if (!performanceTiming) {
          return false;
        }
        var timing =
          performanceTiming.loadEventEnd - performanceTiming.navigationStart;
        return timing > slowSessionThreshold;
      };
      var _a = __read(applyPerformance(performance), 3),
        getEntriesByType = _a[2];
      // TODO pengli 试验是否可以通过script标签的标记来判断是block还是async 如果能拿到性能上是否有损
      var startObserve = performanceObserver
        ? function () {
            var _a = __read(
                applyPerformanceObserver(performanceObserver, function (
                  _entry,
                  i,
                  entries,
                ) {
                  return i === 0 && report(entries);
                }),
                1,
              ),
              observe = _a[0];
            observe(RESOURCE_PERFORMANCE_ENTRY_TYPE);
          }
        : noop;
      onPageLoad(function () {
        report(
          getEntriesByType(RESOURCE_PERFORMANCE_ENTRY_TYPE),
          checkSlowSession(),
        );
        startObserve();
      });
      return [];
    };
  };

  var RESOURCE_MONITOR_PLUGIN_NAME = 'resource';
  var defaultConfig$3 = {
    ignoreUrls: [],
    slowSessionThreshold: 4000,
  };
  var reportResourceOnInitCommonParams = function (client) {
    var clientConfig = client.config();
    var common = __assign(__assign({}, getLocationUrl()), {
      pid: clientConfig.pid,
      viewId: clientConfig.viewId,
    });
    return function (_a) {
      var _b = __read(_a, 2),
        ev = _b[0],
        isSlowSession = _b[1];
      var extra = isSlowSession ? { sample_rate: 1 } : {};
      client.report(
        __assign(__assign({}, ev), {
          overrides: __assign({}, common),
          extra: extra,
        }),
      );
    };
  };
  function ResourceMonitorPlugin(client) {
    client.on('init', function () {
      var config = getPluginConfig(
        client,
        RESOURCE_MONITOR_PLUGIN_NAME,
        defaultConfig$3,
      );
      if (!config) {
        return;
      }
      applyMonitor(
        ResourceMonitor,
        config,
        reportResourceOnInitCommonParams(client),
      );
    });
  }

  /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
  function isHTMLLinkElement(target) {
    return target.tagName.toLowerCase() === 'link';
  }
  function getElementAttr(target, attr) {
    if (isFunction(target.getAttribute)) {
      // returns what was in the HTML. It may be a relative URL.
      return target.getAttribute(attr) || '';
    }
    // target.src returns absoulute path
    return target[attr] || '';
  }
  var getSrc = function (target) {
    return getElementAttr(target, isHTMLLinkElement(target) ? 'href' : 'src');
  };
  var getDataFromEvent = function (e) {
    var target = e.target || e.srcElement;
    if (!target) {
      return;
    }
    var tagName = target.tagName;
    if (!tagName || !isString(tagName)) {
      return;
    }
    var src = getSrc(target);
    if (!src) {
      return;
    }
    return {
      url: src,
      tagName: tagName,
    };
  };
  var buildPayload = function (data, getEntriesByName) {
    var url = data.url,
      tagName = data.tagName;
    var parsed = parseUrl(url);
    var timing = getEntriesByName(parsed.url)[0];
    return {
      type: tagName.toLowerCase(),
      url: url,
      protocol: parsed.protocol,
      domain: parsed.domain,
      path: parsed.path,
      query: parsed.query,
      timing: timing,
    };
  };

  var RESOURCE_ERROR_EV_TYPE = 'resource_error';
  var ResourceErrorMonitor = function (window, performance, locationHref) {
    if (window === void 0) {
      window = getDefaultBrowser();
    }
    if (performance === void 0) {
      performance = getDefaultPerformance();
    }
    if (locationHref === void 0) {
      locationHref =
        location === null || location === void 0 ? void 0 : location.href;
    }
    if (!window) {
      return;
    }
    return function (props, cb) {
      var ignoreUrls = props.ignoreUrls,
        includeUrls = props.includeUrls;
      var includeRegExp = getRegexp(includeUrls);
      var ignoreRegExp = getRegexp(ignoreUrls);
      var _a = __read(applyPerformance(performance), 5),
        getEntriesByName = _a[4];
      var report = function (data) {
        if (locationHref && data.url === locationHref) {
          // empty src
          return;
        }
        if (includeRegExp && includeRegExp.test(data.url));
        else if (ignoreRegExp && ignoreRegExp.test(data.url)) {
          return;
        }
        var payload = buildPayload(data, getEntriesByName);
        if (payload) {
          cb &&
            cb({
              ev_type: RESOURCE_ERROR_EV_TYPE,
              payload: payload,
            });
        }
      };
      var onError = function (event) {
        var e = event || window.event;
        if (!e) {
          return;
        }
        var data = getDataFromEvent(e);
        if (data) {
          report(data);
        }
      };
      window.addEventListener('error', onError, true);
      var teardown = function () {
        window.removeEventListener('error', onError, true);
      };
      return [report, teardown];
    };
  };

  var RESOURCE_ERROR_MONITOR_PLUGIN_NAME = 'resourceError';
  var defaultConfig$2 = {
    includeUrls: [],
    ignoreUrls: [],
  };
  function ResourceErrorMonitorPlugin(client) {
    client.on('init', function () {
      var config = getPluginConfig(
        client,
        RESOURCE_ERROR_MONITOR_PLUGIN_NAME,
        defaultConfig$2,
      );
      if (!config) {
        return;
      }
      var _a = __read(
          applyMonitor(
            ResourceErrorMonitor,
            config,
            client.report.bind(client),
          ),
          1,
        ),
        reportResourceError = _a[0];
      client.provide('reportResourceError', reportResourceError);
    });
  }

  var defaultMetricContext = {
    isSupport: true,
    isPolyfill: false,
    isBounced: false,
    isCustom: false,
  };
  var initMetric = function (name, value) {
    return __assign(
      { name: name, value: value, type: 'perf' },
      defaultMetricContext,
    );
  };
  var buildSingleMetricPayload = function (singleMetric) {
    return {
      ev_type: 'performance',
      payload: singleMetric,
    };
  };

  var FI = 'first-input';
  var FIDMonitorMetricName = 'fid';
  var FIDMonitor = function (PerformanceObserver, performance) {
    if (PerformanceObserver === void 0) {
      PerformanceObserver = getDefaultPerformanceObserver();
    }
    if (performance === void 0) {
      performance = getDefaultPerformance();
    }
    return function (_props, cb) {
      var metric = initMetric(FIDMonitorMetricName, 0);
      var _a = __read(invokeCallbackOnce(cb), 1),
        invokeCbOnce = _a[0];
      if (!performance || !PerformanceObserver) {
        metric.isSupport = false;
        invokeCbOnce(metric);
        return;
      }
      var invokeCb = function (_a) {
        var processingStart = _a.processingStart,
          startTime = _a.startTime;
        metric.value = processingStart - startTime;
        invokeCbOnce(metric);
      };
      // 先从 performance 里拿一下 FI，拿不到则用 PerformanceObserver 监听
      var _b = __read(applyPerformance(performance), 3),
        getEntriesByType = _b[2];
      var historyEntry = getEntriesByType(FI)[0];
      if (historyEntry) {
        invokeCb(historyEntry);
      } else {
        var _c = __read(
            applyPerformanceObserver(PerformanceObserver, invokeCb, true),
            1,
          ),
          observe = _c[0];
        observe(FI);
      }
    };
  };

  var LCPMonitorMetricName = 'lcp';
  var LCP = 'largest-contentful-paint';
  var LCPListenerEventTypes = ['keydown', 'click'];
  var LCPMonitor = function (PerformanceObserver) {
    if (PerformanceObserver === void 0) {
      PerformanceObserver = getDefaultPerformanceObserver();
    }
    return function (props, cb) {
      var precollect = props.precollect;
      var metric = initMetric(LCPMonitorMetricName, 0);
      var _a = __read(invokeCallbackOnce(cb), 1),
        invokeCbOnce = _a[0];
      if (!PerformanceObserver) {
        metric.isSupport = false;
        invokeCbOnce(metric);
        return;
      }
      (precollect.entries || []).forEach(function (_a) {
        var entryType = _a.entryType,
          startTime = _a.startTime;
        if (entryType === LCP) {
          metric.value = startTime;
        }
      });
      // 监听lcp
      var invokeCb = function (_a) {
        var startTime = _a.startTime;
        metric.value = startTime;
      };
      var _b = __read(
          applyPerformanceObserver(PerformanceObserver, invokeCb),
          2,
        ),
        observe = _b[0],
        disconnect = _b[1];
      observe(LCP);
      var disconnectAndStopListening = function () {
        disconnect();
        LCPListenerEventTypes.forEach(function (type) {
          window.removeEventListener(type, invokeCbAndStopListening, true);
        });
      };
      // 结算并停止监听
      var invokeCbAndStopListening = function () {
        invokeCbOnce(metric);
        disconnectAndStopListening();
      };
      LCPListenerEventTypes.forEach(function (type) {
        window.addEventListener(type, invokeCbAndStopListening, true);
      });
      onHidden(invokeCbAndStopListening, true);
      var handlePageUnload = function () {
        metric.isBounced = true;
        invokeCbAndStopListening();
      };
      onPageUnload(handlePageUnload);
    };
  };

  var FCP_ENTRY_NAME = 'first-contentful-paint';
  var FP_ENTRY_NAME = 'first-paint';
  var Paint_Type = 'paint';
  var PaintMonitor = function (PerformanceObserver, performance) {
    if (PerformanceObserver === void 0) {
      PerformanceObserver = getDefaultPerformanceObserver();
    }
    if (performance === void 0) {
      performance = getDefaultPerformance();
    }
    return function (props, cb) {
      var metricName = props.metricName,
        entryName = props.entryName;
      var metric = initMetric(metricName, 0);
      var _a = __read(invokeCallbackOnce(cb), 1),
        invokeCbOnce = _a[0];
      if (!performance || !PerformanceObserver) {
        metric.isSupport = false;
        invokeCbOnce(metric);
        return;
      }
      var invokeCb = function (_a) {
        var startTime = _a.startTime;
        metric.value = startTime;
        invokeCbOnce(metric);
      };
      var _b = __read(applyPerformance(performance), 5),
        getEntriesByName = _b[4];
      var paint = getEntriesByName(entryName)[0];
      // 先从 performance 里拿一下，拿不到则用 PerformanceObserver 监听
      if (paint) {
        invokeCb(paint);
      } else {
        var invokeCbWithDisconnect = function (entry) {
          if (entry.name === entryName) {
            invokeCb(entry);
            disconnect_1();
          }
        };
        var _c = __read(
            applyPerformanceObserver(
              PerformanceObserver,
              invokeCbWithDisconnect,
            ),
            2,
          ),
          observe = _c[0],
          disconnect_1 = _c[1];
        observe(Paint_Type);
        // 跳出率支持
        var handlePageUnload = function () {
          metric.isBounced = true;
          invokeCbOnce(metric);
          disconnect_1();
        };
        onPageUnload(handlePageUnload);
      }
    };
  };

  var MPFIDMonitorMetricName = 'mpfid';
  var LONGTASK = 'longtask';
  var MPFIDMonitor = function (PerformanceObserver, performance) {
    if (PerformanceObserver === void 0) {
      PerformanceObserver = getDefaultPerformanceObserver();
    }
    if (performance === void 0) {
      performance = getDefaultPerformance();
    }
    return function (props, cb) {
      var metric = initMetric(MPFIDMonitorMetricName, 0);
      var _a = __read(invokeCallbackOnce(cb), 1),
        invokeCbOnce = _a[0];
      if (!PerformanceObserver) {
        metric.isSupport = false;
        invokeCbOnce(metric);
        return [noop];
      }
      var list = [];
      var precollect = props.precollect;
      // 处理预收集数据
      if (precollect) {
        (precollect.entries || []).forEach(function (entry) {
          entry.entryType === LONGTASK && list.push(entry);
        });
      }
      // 持续监听并记录下 longtask
      var _b = __read(
          applyPerformanceObserver(PerformanceObserver, function (entry) {
            return list.push(entry);
          }),
          2,
        ),
        observe = _b[0],
        disconnect = _b[1];
      observe(LONGTASK);
      // MPFID 理论上是第一次交互时, 但是first-input本身有兼容性问题  后续考虑polyfill支持, 调整结算时机
      // 从记录中计算出 duration 最长的时间作为 mpfid
      var triggerMPFID = function () {
        disconnect();
        var _a = __read(applyPerformance(performance), 5),
          getEntriesByName = _a[4];
        var paint = getEntriesByName(FCP_ENTRY_NAME)[0];
        var FCPStartTime = (paint && paint.startTime) || 0;
        metric.value = list.reduce(function (res, _a) {
          var duration = _a.duration,
            startTime = _a.startTime;
          return res < duration && startTime > FCPStartTime ? duration : res;
        }, 0);
        invokeCbOnce(metric);
      };
      return [triggerMPFID];
    };
  };

  // fmp && tti 需要MutationObserver, 所以需要先开启
  var PerformanceMonitor = function (performance) {
    if (performance === void 0) {
      performance = getDefaultPerformance();
    }
    return function (props, cb) {
      var precollect = props.precollect,
        fpEnable = props.fp,
        fcpEnanble = props.fcp,
        lcpEnable = props.lcp,
        fidEnable = props.fid,
        mpfidEnable = props.mpfid;
      var invokeMetricCb = function (singleMetric) {
        cb &&
          cb({
            ev_type: 'performance',
            payload: singleMetric,
          });
      };
      // fp
      fpEnable &&
        applyMonitor(
          PaintMonitor,
          { metricName: 'fp' /* fp */, entryName: FP_ENTRY_NAME },
          invokeMetricCb,
        );
      // fcp
      fcpEnanble &&
        applyMonitor(
          PaintMonitor,
          { metricName: 'fcp' /* fcp */, entryName: FCP_ENTRY_NAME },
          invokeMetricCb,
        );
      // lcp
      lcpEnable &&
        applyMonitor(LCPMonitor, { precollect: precollect }, invokeMetricCb);
      // fid
      fidEnable && applyMonitor(FIDMonitor, 0, invokeMetricCb);
      // mpfid
      if (mpfidEnable) {
        var _a = __read(
            applyMonitor(
              MPFIDMonitor,
              { precollect: precollect },
              invokeMetricCb,
            ),
            1,
          ),
          tiggerMPFID_1 = _a[0];
        // trigger mpfid
        onPageLoad(function () {
          return setTimeout(tiggerMPFID_1, 200);
        });
      }
      // timing
      var _b = __read(applyPerformance(performance), 3),
        getEntriesByType = _b[2];
      var buildTimingAndCb = function (isBounced) {
        var timing = (performance && performance.timing) || undefined;
        var navigation = getEntriesByType('navigation')[0];
        cb &&
          cb({
            ev_type: 'performance_timing',
            payload: {
              isBounced: isBounced,
              timing: timing,
              navigation_timing: navigation,
            },
          });
      };
      var _c = __read(invokeCallbackOnce(buildTimingAndCb), 1),
        buildAndInvokeTimingCbOnce = _c[0];
      onPageLoad(function () {
        buildAndInvokeTimingCbOnce(false);
      });
      onPageUnload(function () {
        buildAndInvokeTimingCbOnce(true);
      });
    };
  };

  var CLSMonitorMetricName = 'cls';
  var LS = 'layout-shift';
  var CLSMonitor = function (PerformanceObserver) {
    if (PerformanceObserver === void 0) {
      PerformanceObserver = getDefaultPerformanceObserver();
    }
    return function (_props, cb) {
      var metric = initMetric(CLSMonitorMetricName, 0);
      // TODO pengli 处理layout-shift 预收集
      if (!PerformanceObserver) {
        metric.isSupport = false;
        return [
          function () {
            return cb && cb(metric);
          },
          noop,
        ];
      }
      var cumulativeCLS = function (_a) {
        var hadRecentInput = _a.hadRecentInput,
          value = _a.value;
        if (!hadRecentInput) {
          metric.value += value;
        }
      };
      var _a = __read(
          applyPerformanceObserver(PerformanceObserver, cumulativeCLS),
          2,
        ),
        observe = _a[0],
        disconnect = _a[1];
      observe(LS);
      return [
        function () {
          cb && cb(metric);
          metric = initMetric(CLSMonitorMetricName, 0);
        },
        disconnect,
      ];
    };
  };

  /* eslint-disable @typescript-eslint/prefer-optional-chain */
  var SPAMonitorMetricName = 'spa_load';
  var SPAMonitor = function () {
    return function (_props, cb) {
      var startTime = 0;
      var metric = initMetric(SPAMonitorMetricName, 0);
      var invokeCb = function (load_time) {
        metric.value = load_time;
        cb && cb(metric);
      };
      var performanceInit = function () {
        startTime = Date.now();
      };
      var performanceSend = function () {
        invokeCb(Date.now() - startTime);
        startTime = 0;
      };
      // 跳出率支持
      var handlePageUnload = function () {
        if (!startTime) {
          return;
        }
        metric.isBounced = true;
        performanceSend();
      };
      onPageUnload(handlePageUnload);
      return [performanceInit, performanceSend];
    };
  };

  var PERFORMANCE_MONITOR_PLUGIN_NAME = 'performance';
  var defaultPerformancePrecollect = {
    entries: [],
    observer: undefined,
  };
  var defaultConfig$1 = {
    fp: true,
    fcp: true,
    fid: true,
    mpfid: true,
    lcp: true,
    cls: true,
  };
  function PerformanceMonitorPlugin(client) {
    client.on('init', function () {
      var _a;
      var config = getPluginConfig(
        client,
        PERFORMANCE_MONITOR_PLUGIN_NAME,
        defaultConfig$1,
      );
      if (!config) {
        return;
      }
      var precollect = client.pp || defaultPerformancePrecollect;
      applyMonitor(
        PerformanceMonitor,
        __assign(__assign({}, config), { precollect: precollect }),
        reportOnInitCommonParams(client),
      );
      var sendPrefMetric = function (metric) {
        client.report({ ev_type: 'performance', payload: metric });
      };
      // spa_load
      var _b = __read(applyMonitor(SPAMonitor, 0, sendPrefMetric), 2),
        performanceInit = _b[0],
        performanceSend = _b[1];
      if (config.cls) {
        var _c = __read(applyMonitor(CLSMonitor, {}, sendPrefMetric), 2),
          countAndClear_1 = _c[0],
          teardown_1 = _c[1];
        client.on('beforeConfig', function (newConfig) {
          var _a;
          if (
            newConfig.pid &&
            newConfig.pid !==
              ((_a = client.config()) === null || _a === void 0
                ? void 0
                : _a.pid)
          ) {
            countAndClear_1();
          }
        });
        onPageUnload(function () {
          countAndClear_1();
          teardown_1();
        });
      }
      // 清理性能预收集数据
      precollect.entries.length = 0;
      (_a = precollect.observer) === null || _a === void 0
        ? void 0
        : _a.disconnect();
      var invokeCustomMetricCb = function (customMetric) {
        var payload = __assign(
          __assign(__assign({}, defaultMetricContext), customMetric),
          { isCustom: true },
        );
        sendPrefMetric(payload);
      };
      client.provide('sendCustomPerfMetric', invokeCustomMetricCb);
      client.provide('performanceInit', performanceInit);
      client.provide('performanceSend', performanceSend);
    });
  }

  /**
   * start 方法开启一个调度器，传入回调和调度时间
   * reschedule 重新以一个更长的时间调度
   * stop 停止调度
   */
  var applyScheduler = function (now) {
    var timerActiveTime = -Infinity;
    var timerId = undefined;
    var callback;
    var clearTime = function () {
      return window.clearTimeout(timerId);
    };
    var reschedule = function (earliestTime) {
      if (timerActiveTime > earliestTime || !callback) {
        return;
      }
      clearTime();
      timerId = window.setTimeout(callback, earliestTime - now());
      timerActiveTime = earliestTime;
    };
    var start = function (cb, earliestTime) {
      callback = cb;
      reschedule(earliestTime);
    };
    var stop = function () {
      clearTime();
      callback = undefined;
    };
    return [start, stop, reschedule];
  };
  /**
   * Computes the time (in milliseconds since requestStart) that the network was
   * last known to have >2 requests in-flight.
   */
  var calcLastNet2Busy = function (undoneReqStarts, observedResReqs, now) {
    var e_1, _a, e_2, _b;
    if (undoneReqStarts.length > 2) {
      return now();
    }
    var endpoints = [];
    try {
      for (
        var observedResReqs_1 = __values(observedResReqs),
          observedResReqs_1_1 = observedResReqs_1.next();
        !observedResReqs_1_1.done;
        observedResReqs_1_1 = observedResReqs_1.next()
      ) {
        var req = observedResReqs_1_1.value;
        endpoints.push([req.start, 0 /* S */], [req.end, 1 /* E */]);
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (
          observedResReqs_1_1 &&
          !observedResReqs_1_1.done &&
          (_a = observedResReqs_1.return)
        )
          _a.call(observedResReqs_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    try {
      for (
        var undoneReqStarts_1 = __values(undoneReqStarts),
          undoneReqStarts_1_1 = undoneReqStarts_1.next();
        !undoneReqStarts_1_1.done;
        undoneReqStarts_1_1 = undoneReqStarts_1.next()
      ) {
        var ts = undoneReqStarts_1_1.value;
        endpoints.push([ts, 0 /* S */]);
      }
    } catch (e_2_1) {
      e_2 = { error: e_2_1 };
    } finally {
      try {
        if (
          undoneReqStarts_1_1 &&
          !undoneReqStarts_1_1.done &&
          (_b = undoneReqStarts_1.return)
        )
          _b.call(undoneReqStarts_1);
      } finally {
        if (e_2) throw e_2.error;
      }
    }
    endpoints.sort(function (a, b) {
      return a[0] - b[0];
    });
    var currentActive = undoneReqStarts.length;
    for (var i = endpoints.length - 1; i >= 0; i--) {
      var _c = __read(endpoints[i], 2),
        timestamp = _c[0],
        type = _c[1];
      switch (type) {
        case 0 /* S */:
          currentActive--;
          break;
        case 1 /* E */:
          currentActive++;
          if (currentActive > 2) {
            return timestamp;
          }
          break;
      }
    }
    // If we reach here, we were never network 2-busy.
    return 0;
  };
  var getRequestTimes = function (requestTimes) {
    var keys = Object.keys(requestTimes);
    var result = [];
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (var i = 0; i < keys.length; i++) {
      var val = requestTimes[keys[i]];
      if (typeof val === 'number') {
        result.push(val);
      }
    }
    return result;
  };
  /**
   * 监听包含 ['img', 'script', 'iframe', 'link', 'audio', 'video', 'source'] 标签的 dom 变更
   */
  var observeResFetchMutations = function (MutationObserver, callback) {
    var requestCreatingNodeNames = [
      'img',
      'script',
      'iframe',
      'link',
      'audio',
      'video',
      'source',
    ];
    function subtreeContainsNodeName(nodes, nodeNames) {
      var e_3, _a;
      try {
        for (
          var nodes_1 = __values(nodes), nodes_1_1 = nodes_1.next();
          !nodes_1_1.done;
          nodes_1_1 = nodes_1.next()
        ) {
          var node = nodes_1_1.value;
          if (
            arrayIncludes(nodeNames, node.nodeName.toLowerCase()) ||
            (node.children && subtreeContainsNodeName(node.children, nodeNames))
          ) {
            return true;
          }
        }
      } catch (e_3_1) {
        e_3 = { error: e_3_1 };
      } finally {
        try {
          if (nodes_1_1 && !nodes_1_1.done && (_a = nodes_1.return))
            _a.call(nodes_1);
        } finally {
          if (e_3) throw e_3.error;
        }
      }
      return false;
    }
    var _a = __read(
        applyMutationObserver(MutationObserver, function (mutations) {
          var e_4, _a;
          try {
            for (
              var mutations_1 = __values(mutations),
                mutations_1_1 = mutations_1.next();
              !mutations_1_1.done;
              mutations_1_1 = mutations_1.next()
            ) {
              var mutation = mutations_1_1.value;
              if (
                (mutation.type === 'childList' &&
                  subtreeContainsNodeName(
                    mutation.addedNodes,
                    requestCreatingNodeNames,
                  )) ||
                (mutation.type === 'attributes' &&
                  arrayIncludes(
                    requestCreatingNodeNames,
                    mutation.target.nodeName.toLowerCase(),
                  ))
              ) {
                callback(mutation);
              }
            }
          } catch (e_4_1) {
            e_4 = { error: e_4_1 };
          } finally {
            try {
              if (
                mutations_1_1 &&
                !mutations_1_1.done &&
                (_a = mutations_1.return)
              )
                _a.call(mutations_1);
            } finally {
              if (e_4) throw e_4.error;
            }
          }
        }),
        2,
      ),
      observe = _a[0],
      disconnect = _a[1];
    return [
      function () {
        return observe(document, {
          attributes: true,
          childList: true,
          subtree: true,
          attributeFilter: ['href', 'src'],
        });
      },
      disconnect,
    ];
  };
  /**
   * Returns either a manually set min value or the time since
   * domContentLoadedEventEnd and navigationStart. If the
   * domContentLoadedEventEnd data isn't available, `null` is returned.
   * @return {number|null}
   */
  var getMinValue = function (timing) {
    var _a = timing || {},
      domContentLoadedEventEnd = _a.domContentLoadedEventEnd,
      _b = _a.navigationStart,
      navigationStart = _b === void 0 ? 0 : _b;
    return domContentLoadedEventEnd
      ? domContentLoadedEventEnd - navigationStart
      : null;
  };
  /**
   * Computes the TTI value...
   * @param {number} searchStart
   * @param {number} minValue
   * @param {number} lastKnownNetwork2Busy
   * @param {number} currentTime
   * @param {!Array<{start: (number), end: (number)}>} longTasks
   * @return {number|null}
   */
  var computeTTI = function (
    searchStart,
    minValue,
    lastKnownNetwork2Busy,
    currentTime,
    longTasks,
  ) {
    // Have not reached network 2-quiet yet.
    if (currentTime - lastKnownNetwork2Busy < 5000) {
      return null;
    }
    var maybeFCI =
      longTasks.length === 0
        ? searchStart
        : longTasks[longTasks.length - 1].end;
    // Main thread has not been quiet for long enough.
    if (currentTime - maybeFCI < 5000) {
      return null;
    }
    return Math.max(maybeFCI, minValue);
  };
  /**
   * 劫持 XHR.open 方法, 记录 method
   */
  var hookXHROpen = function (open) {
    return function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      this._method = args[0];
      return open.apply(this, args);
    };
  };
  /**
   * 劫持 XHR.send 方法，回调 uniqId 为偶数
   */
  var hookXHRSend = function (send, before, after) {
    var uniqId = 0;
    return function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      if (this._method !== 'GET') {
        return send.apply(this, args);
      }
      // No arrow function.
      var requestId = (uniqId += 2);
      before(requestId, Date.now());
      hookObjectProperty(this, 'onreadystatechange', function (
        onreadystatechange,
      ) {
        return function (e) {
          onreadystatechange && onreadystatechange.call(this, e);
          this.readyState === 4 && after(requestId);
        };
      })();
      return send.apply(this, args);
    };
  };
  /**
   * 劫持 fetch，回调 uniqId 为奇数
   */
  var hookFetch = function (_fetch, before, after) {
    var uniqId = 1;
    return function () {
      var _a, _b;
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      var fetchMethod =
        ((_a = args[0]) === null || _a === void 0 ? void 0 : _a.method) ||
        ((_b = args[1]) === null || _b === void 0 ? void 0 : _b.method) ||
        'GET';
      if (fetchMethod !== 'GET') {
        return _fetch.apply(void 0, __spreadArray([], __read(args)));
      }
      return new Promise(function (resolve, reject) {
        var requestId = (uniqId += 2);
        before(requestId, Date.now());
        _fetch.apply(void 0, __spreadArray([], __read(args))).then(
          function (value) {
            after(requestId);
            resolve(value);
          },
          function (err) {
            after(requestId, err);
            reject(err);
          },
        );
      });
    };
  };
  /**
   * 返回的 iterEntries 方法用于迭代监听到的 longtask 和 resource entries，
   * 将缓存监听到的 longTasks 和 network
   */
  var gatherLongTaskAndNetworks = function () {
    var longTasks = [];
    var networkRequests = [];
    var iterEntries = function (longTaskCb, resourceCb) {
      return function (entry) {
        var _a = entry,
          startTime = _a.startTime,
          duration = _a.duration,
          fetchStart = _a.fetchStart,
          responseEnd = _a.responseEnd,
          entryType = _a.entryType;
        if (entryType === 'longtask') {
          entry.start = startTime;
          entry.end = startTime + duration;
          longTasks.push(entry);
          longTaskCb && longTaskCb(entry);
        } else if (entryType === 'resource') {
          networkRequests.push({
            start: fetchStart,
            end: responseEnd,
          });
          resourceCb && resourceCb(entry);
        }
      };
    };
    return [longTasks, networkRequests, iterEntries];
  };

  var TTIMonitorMetricName = 'tti';
  /**
   * 劫持 XHR 和 fetch，监听当前页面未完成的 GET 请求数量
   */
  var applyIncompleteReq = function (global, XMLHttpRequest) {
    var _a = __read(applyRecord(), 3),
      incompleteInitReqStartTimes = _a[0],
      before = _a[1],
      after = _a[2];
    var restoreXHROpen =
      XMLHttpRequest &&
      hookObjectProperty(XMLHttpRequest.prototype, 'open', hookXHROpen)();
    var restoreXHRSend =
      XMLHttpRequest &&
      hookObjectProperty(
        XMLHttpRequest.prototype,
        'send',
        hookXHRSend,
      )(before, after);
    var restoreFetch =
      global && hookObjectProperty(global, 'fetch', hookFetch)(before, after);
    var restore = function () {
      restoreXHROpen && restoreXHROpen(true);
      restoreXHRSend && restoreXHRSend(true);
      restoreFetch && restoreFetch(true);
    };
    return [incompleteInitReqStartTimes, restore];
  };
  /**
   * 监听 longtask resource 和 网络请求
   * 返回 longtasks 数组、停止监听的函数、拿到最近一次请求大于2的时间的函数
   */
  var observeLongTaskAndNetAndResource = function (
    global,
    XMLHttpRequest,
    PerformanceObserver,
    MutationObserver,
  ) {
    return function (
      precollect,
      scheduler, // checkTTI 调度器
      now,
    ) {
      var _a = __read(gatherLongTaskAndNetworks(), 3),
        longTasks = _a[0],
        networkRequests = _a[1],
        iterEntries = _a[2];
      var _b = __read(applyIncompleteReq(global, XMLHttpRequest), 2),
        incompleteInitReqStartTimes = _b[0],
        restoreHook = _b[1];
      // 如果有资源节点新增，那么五秒后尝试 checkTTI
      var _c = __read(
          (MutationObserver &&
            observeResFetchMutations(MutationObserver, function () {
              return scheduler(now() + 5000);
            })) ||
            [],
          2,
        ),
        observeRes = _c[0],
        stopObserveRes = _c[1];
      observeRes && observeRes();
      var getLastBusy = function () {
        return calcLastNet2Busy(
          getRequestTimes(incompleteInitReqStartTimes),
          networkRequests,
          now,
        );
      };
      var _d = __read(
          applyPerformanceObserver(
            PerformanceObserver,
            iterEntries(
              // 遇到 longTask 则在 longTask 5秒后 checkTTI
              function (_a) {
                var startTime = _a.startTime,
                  duration = _a.duration;
                return scheduler(startTime + duration + 5000);
              },
              // 遇到 resource 加载，则在最后一次 busy 5 秒后 checkTTI
              function () {
                return scheduler(getLastBusy() + 5000);
              },
            ),
            false,
            function () {
              return (longTasks.notSupport = true);
            },
          ),
          2,
        ),
        observe = _d[0],
        stopLongTaskAndNetwork = _d[1];
      var teardown = function () {
        restoreHook();
        stopLongTaskAndNetwork();
        stopObserveRes && stopObserveRes();
      };
      observe('longtask', 'resource');
      precollect.forEach(iterEntries());
      return [longTasks, teardown, getLastBusy];
    };
  };
  var TTIMonitor = function (
    XMLHttpRequest,
    window,
    PerformanceObserver,
    MutationObserver,
    performance,
  ) {
    if (XMLHttpRequest === void 0) {
      XMLHttpRequest = getDefaultXMLHttpRequest();
    }
    if (window === void 0) {
      window = getDefaultFetch() && getDefaultBrowser();
    }
    if (PerformanceObserver === void 0) {
      PerformanceObserver = getDefaultPerformanceObserver();
    }
    if (MutationObserver === void 0) {
      MutationObserver = getDefaultMutationObserver();
    }
    if (performance === void 0) {
      performance = getDefaultPerformance();
    }
    return function (props, cb, tearDown, polyfill) {
      var metric = initMetric(TTIMonitorMetricName, 0);
      var buildTTIAndCb = function (_metric) {
        var payload = buildSingleMetricPayload(_metric);
        cb && cb(payload);
      };
      var _a = __read(invokeCallbackOnce(buildTTIAndCb), 1),
        buildAndInvokeCbOnce = _a[0];
      if (!XMLHttpRequest || !window || !PerformanceObserver || !performance) {
        metric.isSupport = false;
        buildAndInvokeCbOnce(metric);
        return [
          function () {
            return 0;
          },
        ];
      }
      // If minValue is null, by default it is DOMContentLoadedEnd.
      var precollect = props.precollect,
        _b = props.isAsync,
        isAsync = _b === void 0 ? 0 : _b,
        _c = props.minValue,
        minValue = _c === void 0 ? null : _c;
      var _d = precollect || {},
        _e = _d.entries,
        entries = _e === void 0 ? [] : _e,
        snippetObserver = _d.observer;
      var _f = __read(applyPerformance(performance), 5),
        timing = _f[0],
        now = _f[1],
        getEntriesByName = _f[4];
      var _g = __read(applyScheduler(now), 3),
        startSchedule = _g[0],
        stopSchedule = _g[1],
        reschedule = _g[2];
      var _h = __read(
          observeLongTaskAndNetAndResource(
            window,
            XMLHttpRequest,
            PerformanceObserver,
            MutationObserver,
          )(!isAsync ? entries : [], reschedule, now),
          3,
        ),
        longTasks = _h[0],
        stopObserve = _h[1],
        getLastBusy = _h[2];
      var disable = function () {
        stopSchedule();
        stopObserve();
        tearDown && tearDown();
        snippetObserver && snippetObserver.disconnect();
        entries.length = 0;
      };
      var checkTTI = function (checkCb) {
        var firstContentfulPaint = getEntriesByName(
          'first-contentful-paint',
        )[0];
        var maybeFCI = computeTTI(
          (firstContentfulPaint
            ? firstContentfulPaint.startTime
            : getMinValue(timing)) || 0,
          minValue || getMinValue(timing) || 0,
          getLastBusy(),
          now() + (checkCb ? 0 : 5000), // 同步模式下加 5 秒保证静默窗口
          longTasks,
        );
        if (!checkCb) {
          // 同步模式下立即返回
          disable();
          return maybeFCI;
        }
        if (!maybeFCI) return reschedule(now() + 1000);
        disable();
        checkCb(maybeFCI);
      };
      polyfill && polyfill(longTasks, reschedule, metric);
      if (longTasks.notSupport) {
        metric.isSupport = false;
        buildAndInvokeCbOnce(metric);
        return [
          function () {
            return 0;
          },
        ];
      }
      // 补充上报tti之前的longtask
      var buildLongTaskAndCb = function (longtaskTillTTI) {
        cb &&
          cb({
            ev_type: 'performance_longtask',
            payload: {
              type: 'perf',
              longtasks: longtaskTillTTI,
            },
          });
      };
      var _j = __read(invokeCallbackOnce(buildLongTaskAndCb), 1),
        buildLongTaskAndInvokeCbOnce = _j[0];
      var invokeCb = function (value) {
        metric.value = value;
        buildAndInvokeCbOnce(metric);
        buildLongTaskAndInvokeCbOnce(longTasks);
      };
      var lastLongTask = longTasks[longTasks.length - 1];
      startSchedule(function () {
        return checkTTI(invokeCb);
      }, Math.max(getLastBusy() + 5000, lastLongTask ? lastLongTask.end : 0));
      var getTTISync = function () {
        return checkTTI() || 0;
      };
      return [getTTISync];
    };
  };

  var TTI_MONITOR_PLUGIN_NAME = 'tti';
  function TTIMonitorPlugin(client) {
    client.on('init', function () {
      var config = getPluginConfig(client, TTI_MONITOR_PLUGIN_NAME, {});
      if (!config) {
        return;
      }
      var precollect = client.pp || defaultPerformancePrecollect;
      // TODO：如果新增SPA方法，需要重置 reportOnInitCommonParams
      applyMonitor(
        TTIMonitor,
        __assign(__assign({}, config), { precollect: precollect }),
        reportOnInitCommonParams(client),
      );
    });
  }

  var FMPMonitorMetricName = 'fmp';
  var RENDER_TYPR_SSR = 'SSR';
  var DEFAULT_IGNORE_TAGS = ['SCRIPT', 'STYLE', 'META', 'HEAD'];
  var getScore = function (element, depth, exist, ignoreTags) {
    if (!element || ignoreTags.indexOf(element.tagName) > -1) {
      return 0;
    }
    var _a = element.children,
      children = _a === void 0 ? [] : _a;
    var score = [].slice.call(children).reduceRight(function (sum, child) {
      return sum + getScore(child, depth + 1, sum > 0, ignoreTags);
    }, 0);
    if (score <= 0 && !exist) {
      if (!isFunction(element.getBoundingClientRect)) {
        return 0;
      }
      var _b = element.getBoundingClientRect() || {},
        top_1 = _b.top,
        height = _b.height;
      if (top_1 > window.innerHeight || height <= 0) {
        return 0;
      }
    }
    return score + 1 + 0.5 * depth;
  };
  var getFMPInternal = function (_a) {
    var _b = _a === void 0 ? [] : _a,
      _c = __read(_b),
      first = _c[0],
      rest = _c.slice(1);
    return (
      (rest &&
        rest.reduce(
          function (_a, cur) {
            var _b = __read(_a, 2),
              prev = _b[0],
              target = _b[1];
            var diff = cur.score - prev.score;
            return [
              cur,
              cur.time >= prev.time && target.rate < diff
                ? { time: cur.time, rate: diff }
                : target,
            ];
          },
          [
            first,
            {
              time: first === null || first === void 0 ? void 0 : first.time,
              rate: 0,
            },
          ],
        )[1].time) ||
      0
    );
  };
  var FMPMonitor = function (
    document,
    MutationObserver,
    navigationStart,
    raf,
    caf,
  ) {
    var _a;
    if (document === void 0) {
      document = getDefaultDocument();
    }
    if (MutationObserver === void 0) {
      MutationObserver = getDefaultMutationObserver();
    }
    if (navigationStart === void 0) {
      navigationStart =
        (_a = getDefaultPerformanceTiming()) === null || _a === void 0
          ? void 0
          : _a.navigationStart;
    }
    if (raf === void 0) {
      raf = getDefaultRaf();
    }
    if (caf === void 0) {
      caf = getDefaultCaf();
    }
    return function (props, cb) {
      var renderType = props.renderType;
      var metric = initMetric(FMPMonitorMetricName, 0);
      var buildFMPAndCb = function (_metric) {
        var payload = buildSingleMetricPayload(_metric);
        cb && cb(payload);
      };
      if (renderType === RENDER_TYPR_SSR) {
        applyMonitor(
          PaintMonitor,
          { metricName: FMPMonitorMetricName, entryName: FCP_ENTRY_NAME },
          buildFMPAndCb,
        );
        return [noop];
      }
      var _a = __read(invokeCallbackOnce(buildFMPAndCb), 1),
        buildAndInvokeCbOnce = _a[0];
      if (!document || !MutationObserver || !navigationStart) {
        metric.isSupport = false;
        buildAndInvokeCbOnce(metric);
        return [noop];
      }
      var startTime = Date.now();
      var list = [];
      var record = function () {
        return list.push({
          time: Date.now() - startTime,
          score: getScore(
            document && document.body,
            1,
            false,
            DEFAULT_IGNORE_TAGS,
          ),
        });
      };
      var _b = __read(applyAnimationFrame(document, raf, caf, true), 1),
        scheduleAF = _b[0];
      // 持续监听 dom 变化，记录下时间和得分
      // 这边放在 animationFrame 中计算一是为了避免强制回流
      // 二是因为 Mutation callback 是作为 microTask 触发，在下一帧之前的任何 dom 变更不会立刻渲染在视图上，而真正渲染是在 animationFrame 中，
      var _c = __read(
          applyMutationObserver(MutationObserver, function () {
            return scheduleAF(record);
          }),
          2,
        ),
        observe = _c[0],
        disconnect = _c[1];
      /**
       * 停止监听，并从当前记录下的数据中计算出得分变化最大的时间点，作为 fmp
       * 此方法在 performance monitor 的 perfLog 中调用
       */
      var tirggerFMP = function (timeGap) {
        if (timeGap === void 0) {
          timeGap = 0;
        }
        disconnect();
        var fmp = getFMPInternal(list);
        metric.value = fmp ? fmp + timeGap : 0;
        buildAndInvokeCbOnce(metric);
      };
      var timeGap = startTime - (navigationStart || 0);
      observe(document, { subtree: true, childList: true });
      return [tirggerFMP.bind(null, timeGap)];
    };
  };

  var FMP_MONITOR_PLUGIN_NAME = 'fmp';
  var defaultConfig = {
    renderType: 'CSR',
  };
  function FMPMonitorPlugin(client) {
    client.on('init', function () {
      var config = getPluginConfig(
        client,
        FMP_MONITOR_PLUGIN_NAME,
        defaultConfig,
      );
      if (!config) {
        return;
      }
      // TODO：如果新增SPA方法，需要重置 reportOnInitCommonParams
      var _a = __read(
          applyMonitor(FMPMonitor, config, reportOnInitCommonParams(client)),
          1,
        ),
        tirggerFMP = _a[0];
      // trigger fmp
      onPageLoad(function () {
        return setTimeout(tirggerFMP, 200);
      });
    });
  }

  var CUSTOM_LOG_LEVELS = ['debug', 'info', 'warn', 'error'];
  var CUSTOM_EV_TYPE = 'custom';
  var CUSTOM_EVENT_TYPE = 'event';
  var CUSTOM_LOG_TYPE = 'log';
  var normalizeCustomEventData = function (raw) {
    if (!raw || !isObject(raw)) {
      return;
    }
    // name is required
    if (!raw['name'] || !isString(raw['name'])) {
      return;
    }
    var res = {
      name: raw['name'],
      type: CUSTOM_EVENT_TYPE,
    };
    if ('metrics' in raw && isObject(raw['metrics'])) {
      var rMetrics = raw['metrics'];
      var metrics = {};
      for (var k in rMetrics) {
        if (isNumber(rMetrics[k])) {
          metrics[k] = rMetrics[k];
        }
      }
      res.metrics = metrics;
    }
    if ('categories' in raw && isObject(raw['categories'])) {
      var rCategories = raw['categories'];
      var categories = {};
      for (var k in rCategories) {
        categories[k] = isString(rCategories[k])
          ? rCategories[k]
          : safeStringify(rCategories[k]);
      }
      res.categories = categories;
    }
    return res;
  };
  var normalizeCustomLogData = function (raw) {
    if (!raw || !isObject(raw)) {
      return;
    }
    // content is required
    if (!raw['content'] || !isString(raw['content'])) {
      return;
    }
    var rContent = raw['content'];
    var res = {
      content: isString(rContent) ? rContent : safeStringify(rContent),
      type: CUSTOM_LOG_TYPE,
      level: 'info',
    };
    if ('level' in raw && arrayIncludes(CUSTOM_LOG_LEVELS, raw['level'])) {
      res.level = raw['level'];
    }
    if ('extra' in raw && isObject(raw['extra'])) {
      var rExtra = raw['extra'];
      var metrics = {};
      var categories = {};
      for (var k in rExtra) {
        if (isNumber(rExtra[k])) {
          metrics[k] = rExtra[k];
        } else {
          categories[k] = isString(rExtra[k])
            ? rExtra[k]
            : safeStringify(rExtra[k]);
        }
      }
      res.metrics = metrics;
      res.categories = categories;
    }
    return res;
  };
  var CustomPlugin = function (client) {
    var sendEvent = function (data) {
      var normalized = normalizeCustomEventData(data);
      if (normalized) {
        client.report({
          ev_type: CUSTOM_EV_TYPE,
          payload: normalized,
          extra: {
            timestamp: Date.now(),
          },
        });
      }
    };
    var sendLog = function (data) {
      var normalized = normalizeCustomLogData(data);
      if (normalized) {
        client.report({
          ev_type: CUSTOM_EV_TYPE,
          payload: normalized,
          extra: {
            timestamp: Date.now(),
          },
        });
      }
    };
    client.provide('sendEvent', sendEvent);
    client.provide('sendLog', sendLog);
  };

  var addConfigToReportEvent = function (ev, config) {
    var extra = {};
    extra.bid = config.bid;
    extra.pid = config.pid;
    extra.view_id = config.viewId;
    extra.user_id = config.userId;
    extra.device_id = config.deviceId;
    extra.session_id = config.sessionId;
    extra.release = config.release;
    extra.env = config.env;
    return __assign(__assign({}, ev), {
      extra: __assign(__assign({}, extra), ev.extra || {}),
    });
  };
  var InjectConfigPlugin = function (client) {
    client.on('beforeBuild', function (ev) {
      return addConfigToReportEvent(ev, client.config());
    });
  };

  function getNetworkType(netInfo) {
    return (
      (netInfo === null || netInfo === void 0
        ? void 0
        : netInfo.effectiveType) ||
      (netInfo === null || netInfo === void 0 ? void 0 : netInfo.type) ||
      ''
    );
  }
  var InjectNetworkTypePlugin = function (client) {
    var netInfo = getDefaultNetworkInformation();
    var network_type = getNetworkType(netInfo);
    if (netInfo) {
      netInfo.onchange = function () {
        network_type = getNetworkType(netInfo);
      };
    }
    client.on('report', function (ev) {
      return __assign(__assign({}, ev), {
        extra: __assign(__assign({}, ev.extra || {}), {
          network_type: network_type,
        }),
      });
    });
  };

  var withSampleRate = function (ev, sampleRate) {
    var extra = ev.extra || {};
    extra.sample_rate = sampleRate;
    ev.extra = extra;
    return ev;
  };
  var hitFn = function (sampleRate, preCalc, isHitBySampleRate) {
    return preCalc
      ? (function (h) {
          return function () {
            return h;
          };
        })(isHitBySampleRate(sampleRate))
      : function () {
          return isHitBySampleRate(sampleRate);
        };
  };
  var parseValues = function (values, type) {
    return values.map(function (v) {
      switch (type) {
        case 'number':
          return Number(v);
        case 'boolean':
          return v === '1';
        case 'string': // default to string
        default:
          return String(v);
      }
    });
  };
  var checkVal = function (val, values, op) {
    switch (op) {
      case 'eq':
        return arrayIncludes(values, val);
      case 'neq':
        return !arrayIncludes(values, val);
      case 'gt':
        return val > values[0];
      case 'gte':
        return val >= values[0];
      case 'lt':
        return val < values[0];
      case 'lte':
        return val <= values[0];
      case 'regex':
        return Boolean(val.match(new RegExp(values[0])));
      case 'not_regex':
        return !val.match(new RegExp(values[0]));
      default: {
        // unknown op
        return false;
      }
    }
  };
  var checkFilter = function (ev, field, op, values) {
    var val = safeVisit(ev, field, function (t, p) {
      return t[p];
    });
    if (val === undefined) {
      return false;
    }
    var field_type = isBoolean(val)
      ? 'bool'
      : isNumber(val)
      ? 'number'
      : 'string';
    return checkVal(val, parseValues(values, field_type), op);
  };
  var matchFilter = function (ev, filter) {
    try {
      return filter.type === 'rule'
        ? checkFilter(ev, filter.field, filter.op, filter.values)
        : filter.type === 'and'
        ? filter.children.every(function (f) {
            return matchFilter(ev, f);
          })
        : filter.children.some(function (f) {
            return matchFilter(ev, f);
          });
    } catch (_err) {
      return false;
    }
  };
  var getHitMap = function (rules, preCalcHit, baseRate, isHitBySampleRate) {
    var hitMap = {};
    Object.keys(rules).forEach(function (name) {
      var _a = rules[name],
        enable = _a.enable,
        sample_rate = _a.sample_rate,
        conditional_sample_rules = _a.conditional_sample_rules;
      if (enable) {
        hitMap[name] = {
          enable: enable,
          sample_rate: sample_rate,
          effectiveSampleRate: sample_rate * baseRate,
          hit: hitFn(sample_rate, preCalcHit, isHitBySampleRate),
        };
        if (conditional_sample_rules) {
          hitMap[name].conditional_hit_rules = conditional_sample_rules.map(
            function (_a) {
              var sample_rate = _a.sample_rate,
                filter = _a.filter;
              return {
                sample_rate: sample_rate,
                hit: hitFn(sample_rate, preCalcHit, isHitBySampleRate),
                effectiveSampleRate: sample_rate * baseRate,
                filter: filter,
              };
            },
          );
        }
      } else {
        hitMap[name] = {
          enable: enable,
          hit: function () {
            /* istanbul ignore next */
            return false;
          },
          sample_rate: 0,
          effectiveSampleRate: 0,
        };
      }
    });
    return hitMap;
  };
  var getSampler = function (userId, config, isHitBySampleRate) {
    if (!config) return id;
    var baseRate = config.sample_rate,
      include_users = config.include_users,
      sample_granularity = config.sample_granularity,
      rules = config.rules;
    // 用户名单采样
    var userHit = arrayIncludes(include_users, userId);
    if (userHit) {
      return function (ev) {
        return withSampleRate(ev, 1);
      };
    }
    var preCalcHit = sample_granularity === 'session';
    var baseHit = preCalcHit
      ? (function (v) {
          return function () {
            return v;
          };
        })(isHitBySampleRate(baseRate))
      : function () {
          return isHitBySampleRate(baseRate);
        };
    var hitMap = getHitMap(rules, preCalcHit, baseRate, isHitBySampleRate);
    return function (ev) {
      var e_1, _a;
      var _b;
      // 总采样必须命中才有后续
      if (!baseHit()) {
        return false;
      }
      // 未配置的事件类型
      if (!(ev.ev_type in hitMap)) {
        return withSampleRate(ev, baseRate);
      }
      // 忽略未开启的事件类型
      if (!hitMap[ev.ev_type].enable) {
        return false;
      }
      // 跳过采样配置
      if ((_b = ev.extra) === null || _b === void 0 ? void 0 : _b.sample_rate) {
        return ev;
      }
      var hitConfig = hitMap[ev.ev_type];
      if (hitConfig.conditional_hit_rules) {
        try {
          // 先判断条件采样
          for (
            var _c = __values(hitConfig.conditional_hit_rules), _d = _c.next();
            !_d.done;
            _d = _c.next()
          ) {
            var rule = _d.value;
            if (matchFilter(ev, rule.filter)) {
              if (rule.hit()) {
                return withSampleRate(ev, rule.effectiveSampleRate);
              }
              // 条件匹配后不再搜索
              return false;
            }
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
      }
      // 事件类型采样
      if (!hitConfig.hit()) {
        return false;
      }
      // 事件类型默认采样已经命中
      return withSampleRate(ev, hitConfig.effectiveSampleRate);
    };
  };
  var SamplePlugin = function (client) {
    client.on('start', function () {
      var _a = client.config(),
        userId = _a.userId,
        sample = _a.sample;
      var sampler = getSampler(userId, sample, isHitBySampleRate);
      client.on('beforeBuild', sampler);
    });
  };

  /* eslint-disable @typescript-eslint/prefer-optional-chain */
  var getBeaconTransport = function () {
    var window = getDefaultBrowser();
    return window && window.navigator.sendBeacon
      ? {
          get: function () {},
          post: function (url, data) {
            window.navigator.sendBeacon(url, data);
          },
        }
      : {
          get: noop,
          post: noop,
        };
  };

  var request = function (method, options, XMLHttpRequest) {
    var url = options.url,
      data = options.data,
      _a = options.success,
      success = _a === void 0 ? noop : _a,
      _b = options.fail,
      fail = _b === void 0 ? noop : _b,
      _c = options.getResponseText,
      getResponseText = _c === void 0 ? noop : _c,
      _d = options.withCredentials,
      withCredentials = _d === void 0 ? false : _d;
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = withCredentials;
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
      getResponseText === null || getResponseText === void 0
        ? void 0
        : getResponseText(this.responseText);
      try {
        if (this.responseText) {
          var result = JSON.parse(this.responseText);
          success(result);
        } else {
          success({});
        }
      } catch (e) {
        fail(e);
      }
    };
    xhr.onerror = function () {
      fail(new Error('Network request failed'));
    };
    xhr.onabort = function () {
      /* istanbul ignore next */
      fail(new Error('Network request aborted'));
    };
    xhr.send(data);
  };
  var getXhrTransport = function () {
    var XMLHttpRequest = getDefaultXMLHttpRequest();
    return XMLHttpRequest
      ? {
          get: function (options) {
            request('GET', options, XMLHttpRequest);
          },
          post: function (options) {
            request('POST', options, XMLHttpRequest);
          },
        }
      : {
          get: noop,
          post: noop,
        };
  };

  // createSender has side effects(register onClose behaviour)
  // so it must be create lazily
  function createBrowserSender(config) {
    var sender = createBatchSender(config);
    var beaconTransport = getBeaconTransport();
    onPageUnload(function () {
      var data = sender.getBatchData();
      if (data) {
        beaconTransport.post(sender.getEndpoint(), data);
        sender.clear();
      }
    });
    var sendOnClose = function (data) {
      beaconTransport.post(sender.getEndpoint(), data);
    };
    return __assign(__assign({}, sender), { sendOnClose: sendOnClose });
  }

  function normalizeInitConfig(config) {
    var plugins = config.plugins || {};
    for (var k in plugins) {
      if (plugins[k] && !isObject(plugins[k])) {
        plugins[k] = {};
      }
    }
    return __assign(__assign({}, config), { plugins: plugins });
  }
  function validateInitConfig(config) {
    return isObject(config) && 'bid' in config;
  }
  function normalizeUserConfig(config) {
    return __assign({}, config);
  }
  function parseServerConfig(serverConfig) {
    if (!serverConfig) {
      return {};
    }
    var sample = serverConfig.sample,
      user_id = serverConfig.user_id;
    if (!sample) {
      return {
        userId: user_id,
      };
    }
    var sample_rate = sample.sample_rate,
      sample_granularity = sample.sample_granularity,
      include_users = sample.include_users,
      rules = sample.rules;
    //TODO: handle jsError, http and heatmap
    return {
      userId: user_id,
      sample: {
        include_users: include_users,
        sample_rate: sample_rate,
        sample_granularity: sample_granularity,
        rules: rules.reduce(function (prev, cur) {
          var name = cur.name,
            enable = cur.enable,
            sample_rate = cur.sample_rate,
            conditional_sample_rules = cur.conditional_sample_rules;
          prev[name] = {
            enable: enable,
            sample_rate: sample_rate,
            conditional_sample_rules: conditional_sample_rules,
          };
          return prev;
        }, {}),
      },
    };
  }

  var REPORT_DOMAIN = 'mon.snssdk.com';
  var PLUGINS_LOAD_PREFIX = 'http:' + '//' + 'localhost:8080' + '/cn/plugins';
  var SDK_VERSION = '0.0.0';
  var SDK_NAME = 'SDK_SLARDAR_WEB';
  var SETTINGS_PATH = '/monitor_web/settings/browser-settings';
  var BATCH_REPORT_PATH = '/monitor_browser/collect/batch/';
  var USER_ID_COOKIE_NAME = 'MONITOR_WEB_ID';
  var DEVICE_ID_COOKIE_NAME = 'MONITOR_DEVICE_ID';
  var DEFAULT_IGNORE_PATHS = ['/log/sentry/', BATCH_REPORT_PATH];
  var DEFAULT_SAMPLE_CONFIG = {
    sample_rate: 1,
    include_users: [],
    sample_granularity: 'session',
    rules: {},
  };
  var DEFAULT_SENDER_SIZE = 20;

  /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
  var getReportUrl = function (domain, path) {
    if (path === void 0) {
      path = BATCH_REPORT_PATH;
    }
    var location = getDefaultLocation();
    return (
      '' +
      (domain && domain.indexOf('//') >= 0
        ? ''
        : (location === null || location === void 0
            ? void 0
            : location.protocol) + '//') +
      domain +
      path
    );
  };
  var getSettingsUrl = function (domain, path) {
    if (path === void 0) {
      path = SETTINGS_PATH;
    }
    var location = getDefaultLocation();
    return (
      '' +
      (domain && domain.indexOf('//') >= 0
        ? ''
        : (location === null || location === void 0
            ? void 0
            : location.protocol) + '//') +
      domain +
      path
    );
  };
  var getDefaultUserId = function () {
    var uid = getCookieId(USER_ID_COOKIE_NAME);
    if (!uid) {
      uid = uuid();
      setCookie(USER_ID_COOKIE_NAME, uid);
    }
    return uid;
  };
  var getDefaultDeviceId = function () {
    var did = getCookieId(DEVICE_ID_COOKIE_NAME);
    if (!did) {
      did = uuid();
      setCookie(DEVICE_ID_COOKIE_NAME, did);
    }
    return did;
  };
  var getDefaultSessionId = function () {
    return uuid();
  };
  var toObservableArray = function (arr) {
    var observers = [];
    arr.observe = function (o) {
      observers.push(o);
    };
    arr.push = function () {
      var _a;
      var vs = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        vs[_i] = arguments[_i];
      }
      vs.forEach(function (v) {
        observers.forEach(function (o) {
          return o(v);
        });
      });
      return (_a = [].push).call.apply(_a, __spreadArray([arr], __read(vs)));
    };
    return arr;
  };
  var getGlobalName = function () {
    var _a, _b, _c;
    var window = getDefaultBrowser();
    var document = getDefaultDocument();
    if (window && document) {
      return (
        ((_c =
          (_b =
            (_a = document.currentScript) === null || _a === void 0
              ? void 0
              : _a.getAttribute('src')) === null || _b === void 0
            ? void 0
            : _b.match(/globalName=(.+)$/)) === null || _c === void 0
          ? void 0
          : _c[1]) || 'Slardar'
      );
    }
  };
  var getGlobalInstance = function () {
    var window = getDefaultBrowser();
    var globalName = getGlobalName();
    if (window && globalName) {
      return window[globalName];
    }
  };

  var configHolder = {
    get: function () {
      return this.__SLARDAR__REPALCE__HOLDER__;
    },
  };
  var createBrowserConfigManager = function (defaultConfig) {
    // the merged config
    var config = defaultConfig;
    // save it so we know when initConfig is set
    var initConfig;
    // save UserConfig so we can merge with priority
    var userConfig = {};
    // save the original server config, from sdk-server or from get_setting response
    var serverConfig = configHolder.get();
    // cache the parsed ServerConfig, used in merge
    var parsedServerConfig;
    // call when ready to start(with initConfig and serverConfig)
    var onReady = noop;
    // call when config changed
    var onChange = noop;
    return {
      getConfig: function () {
        return config;
      },
      setConfig: function (c) {
        if (c && c.pid && c.pid !== userConfig.pid) {
          c.viewId = c.pid + '_' + Date.now();
        }
        userConfig = __assign(__assign({}, userConfig), c || {});
        updateConfig();
        if (!initConfig) {
          // handle init
          initConfig = c;
          if (config.useLocalConfig || !config.bid) {
            // when useLocalConfig is true, ignore serverConfig
            parsedServerConfig = {};
            onReady();
          } else if (serverConfig) {
            // check injected serverConfig
            handleServerConfig();
          } else {
            // get serverConfig from server
            getServerConfig(config.domain, config.bid, function (res) {
              serverConfig = res;
              handleServerConfig();
            });
          }
        }
        return config;
      },
      onChange: function (fn) {
        onChange = fn;
      },
      onReady: function (fn) {
        onReady = fn;
        if (parsedServerConfig) {
          onReady();
        }
      },
    };
    function updateConfig() {
      // merge priority: UserConfig > ServerConfig > CurrentConfig(including default config)
      var newConfig = __assign(
        __assign(__assign({}, defaultConfig), parsedServerConfig || {}),
        userConfig,
      );
      newConfig.plugins = mergeDeepConcatArray(
        defaultConfig.plugins,
        userConfig.plugins || {},
      );
      newConfig.sample = mergeSampleConfig(
        mergeSampleConfig(
          defaultConfig.sample,
          parsedServerConfig === null || parsedServerConfig === void 0
            ? void 0
            : parsedServerConfig.sample,
        ),
        userConfig.sample,
      );
      config = newConfig;
      onChange();
    }
    function handleServerConfig() {
      parsedServerConfig = parseServerConfig(serverConfig);
      updateConfig();
      onReady();
    }
  };
  function getServerConfig(domain, bid, cb) {
    getXhrTransport().get({
      withCredentials: true,
      url: getSettingsUrl(domain) + '?bid=' + bid,
      success: function (res) {
        cb(res.data || {});
      },
      fail: function () {
        cb();
      },
    });
  }
  function mergeSampleConfig(a, b) {
    if (!a || !b) return a || b;
    var res = __assign(__assign({}, a), b);
    res.include_users = __spreadArray(
      __spreadArray([], __read(a.include_users || [])),
      __read(b.include_users || []),
    );
    res.rules = __spreadArray(
      __spreadArray([], __read(Object.keys(a.rules || {}))),
      __read(Object.keys(b.rules || {})),
    ).reduce(function (obj, key) {
      var _a, _b;
      if (!(key in obj)) {
        if (key in (a.rules || {}) && key in (b.rules || {})) {
          obj[key] = __assign(__assign({}, a.rules[key]), b.rules[key]);
          obj[key].conditional_sample_rules = __spreadArray(
            __spreadArray(
              [],
              __read(a.rules[key].conditional_sample_rules || []),
            ),
            __read(b.rules[key].conditional_sample_rules || []),
          );
        } else {
          obj[key] =
            ((_a = a.rules) === null || _a === void 0 ? void 0 : _a[key]) ||
            ((_b = b.rules) === null || _b === void 0 ? void 0 : _b[key]);
        }
      }
      return obj;
    }, {});
    return res;
  }

  var browserBuilder = {
    build: function (e) {
      return {
        ev_type: e.ev_type,
        payload: e.payload,
        common: __assign(__assign({}, e.extra || {}), e.overrides || {}),
      };
    },
  };

  /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
  var isDebug = '';
  function loadPluginsOnPageLoad(client, registry, lp) {
    if (lp === void 0) {
      lp = loadPlugins;
    }
    onPageLoad(function () {
      client.on('init', function () {
        lp(client, registry);
      });
    });
  }
  function loadPlugins(client, registry, ld) {
    if (ld === void 0) {
      ld = loadNow;
    }
    var _a = client.config(),
      plugins = _a.plugins,
      pluginBundle = _a.pluginBundle;
    Object.keys(plugins).forEach(function (name) {
      // check if plugin is enabled, plugins[name]: false means it's disabled
      if (plugins[name]) {
        // check if we have a bundle containing this plugin
        if (pluginBundle && arrayIncludes(pluginBundle.plugins, name)) {
          ld(client, pluginBundle, registry);
        } else {
          // or just load the plugin
          ld(client, { name: name, config: plugins[name] }, registry);
        }
      }
    });
  }
  function loadNow(client, _a, registry, ls) {
    var name = _a.name,
      plugins = _a.plugins,
      config = _a.config;
    if (ls === void 0) {
      ls = loadScript;
    }
    if (loadingOrLoaded(client, name)) {
      return;
    }
    client.loading.push(name);
    var path = getPluginPath(client, name, config);
    ls(path, function () {
      if (arrayIncludes(client.loaded, name)) {
        return;
      }
      if (plugins) {
        plugins.forEach(function (name) {
          if (!arrayIncludes(client.loaded, name)) {
            applyPlugin(client, name, registry);
          }
        });
      } else {
        applyPlugin(client, name, registry);
      }
    });
  }
  function loadingOrLoaded(client, name) {
    return (
      arrayIncludes(client.loaded, name) || arrayIncludes(client.loading, name)
    );
  }
  function getPluginPath(client, name, config) {
    var _a;
    return (_a =
      config === null || config === void 0 ? void 0 : config.path) !== null &&
      _a !== void 0
      ? _a
      : client.config().pluginPathPrefix +
          '/' +
          camelToKebab(name) +
          '.' +
          SDK_VERSION +
          '.' +
          isDebug +
          'js';
  }
  function applyPlugin(client, name, registry) {
    if (registry === void 0) {
      registry = getGlobalRegistry(getDefaultBrowser());
    }
    if (!registry) return;
    var plugin = getPluginFromRegistry(registry, name);
    if (!plugin) {
      warn('[loader].applyPlugin not found', name);
      return;
    }
    try {
      plugin.apply(client);
      client.loaded.push(name);
    } catch (err) {
      warn('[loader].applyPlugin failed', name, err);
    }
  }
  function getPluginFromRegistry(registry, name) {
    return registry.plugins.filter(function (l) {
      return l.name === name && l.version === SDK_VERSION;
    })[0];
  }
  // 获取全局注册表
  function getGlobalRegistry(global) {
    if (!global) return;
    if (!global.__SLARDAR_REGISTRY__) {
      global.__SLARDAR_REGISTRY__ = {
        Slardar: {
          plugins: [],
        },
      };
    }
    return global.__SLARDAR_REGISTRY__.Slardar;
  }

  var addEnvToSendEvent = function (ev) {
    var extra = __assign(__assign({}, getLocationUrl()), {
      timestamp: Date.now(),
      sdk_version: SDK_VERSION,
      sdk_name: SDK_NAME,
    });
    return __assign(__assign({}, ev), {
      extra: __assign(__assign({}, extra), ev.extra || {}),
    });
  };
  var InjectEnvPlugin = function (client) {
    client.on('report', function (ev) {
      return addEnvToSendEvent(ev);
    });
  };

  var EV_METHOD_MAP = {
    sri: 'reportSri',
    st: 'reportResourceError',
    err: 'captureException',
  };
  var createStore = function (evMap) {
    return Object.keys(evMap).reduce(function (prev, cur) {
      prev[cur] = [];
      return prev;
    }, {});
  };
  var reverseMap = function (map) {
    return Object.keys(map).reduce(function (prev, cur) {
      prev[map[cur]] = cur;
      return prev;
    }, {});
  };
  var getStoreOrConsume = function (client, store, evMap) {
    return function (type, data, timestamp, url) {
      var _a;
      var capturedContext = __assign(
        __assign(
          __assign({}, captureCurrentContext(client)),
          omit(parseUrl(url), 'hash'),
        ),
        { timestamp: timestamp },
      );
      if (store[type]) {
        if (client[evMap[type]]) {
          syncReportWithCapturedContext(
            client,
            capturedContext,
          )(function () {
            client[evMap[type]](data);
          });
        } else {
          (_a = store[type]) === null || _a === void 0
            ? void 0
            : _a.push([data, capturedContext]);
        }
      }
    };
  };
  var getConsumeStored = function (client, store, evMethods) {
    return function (name) {
      var _a;
      if (name in evMethods) {
        (_a = store[evMethods[name]]) === null || _a === void 0
          ? void 0
          : _a.forEach(function (_a) {
              var _b = __read(_a, 2),
                event = _b[0],
                capturedContext = _b[1];
              syncReportWithCapturedContext(
                client,
                capturedContext,
              )(function () {
                client[name](event);
              });
            });
        // 置空，不再消费
        store[evMethods[name]] = null;
      }
    };
  };
  // 只有 staticError, jsError, unhandledreject, sri 会被预收集
  var PrecollectPlugin = function (client, evMap) {
    var _a;
    if (evMap === void 0) {
      evMap = EV_METHOD_MAP;
    }
    var store = createStore(evMap);
    var evMethods = reverseMap(evMap);
    var storeOrConsume = getStoreOrConsume(client, store, evMap);
    // 继续消费后续预收集数据
    if (
      ((_a = client.p) === null || _a === void 0 ? void 0 : _a.a) &&
      'observe' in client.p.a
    ) {
      // 注册预收集消费回调
      client.p.a.observe(function (_a) {
        var _b = __read(_a, 5);
        _b[0];
        var type = _b[1],
          data = _b[2],
          timestamp = _b[3],
          url = _b[4];
        storeOrConsume(type, data, timestamp, url);
      });
    }
    client.on('init', function () {
      var _a;
      // 消费已经收集的预收集数据
      (_a = client.p) === null || _a === void 0
        ? void 0
        : _a.a.forEach(function (_a) {
            var _b = __read(_a, 5);
            _b[0];
            var type = _b[1],
              data = _b[2],
              timestamp = _b[3],
              url = _b[4];
            storeOrConsume(type, data, timestamp, url);
          });
      // 由于已经消费，置空所有预收集的数据
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      client.p && client.p.a && (client.p.a.length = 0);
    });
    // 消费预收集并通知其他实例
    client.provide('precollect', storeOrConsume);
    // consume stored data when provided
    client.on('provide', getConsumeStored(client, store, evMethods));
  };

  var getDefaultConfig = function (_c) {
    return {
      bid: '',
      pid: '',
      viewId: '_' + Date.now(),
      userId: getDefaultUserId(),
      deviceId: getDefaultDeviceId(),
      sessionId: getDefaultSessionId(),
      domain: REPORT_DOMAIN,
      pluginPathPrefix: PLUGINS_LOAD_PREFIX,
      plugins: {
        ajax: { ignoreUrls: DEFAULT_IGNORE_PATHS },
        fetch: { ignoreUrls: DEFAULT_IGNORE_PATHS },
        breadcrumb: {},
        pageview: {},
        jsError: {},
        resource: {},
        resourceError: {},
        sri: {},
        performance: {},
        tti: {},
        fmp: {},
        blankScreen: false,
      },
      release: '',
      env: 'production',
      sample: DEFAULT_SAMPLE_CONFIG,
    };
  };
  var createMinimalBrowserClient = function (_a) {
    var _b = _a === void 0 ? {} : _a,
      _d = _b.createSender,
      createSender =
        _d === void 0
          ? function (config) {
              return createBrowserSender({
                size: DEFAULT_SENDER_SIZE,
                endpoint: getReportUrl(config.domain),
                transport: getXhrTransport(),
              });
            }
          : _d,
      _e = _b.builder,
      builder = _e === void 0 ? browserBuilder : _e,
      _f = _b.createDefaultConfig,
      createDefaultConfig = _f === void 0 ? getDefaultConfig : _f;
    var client = createClient({
      validateInitConfig: validateInitConfig,
      initConfigNormalizer: normalizeInitConfig,
      userConfigNormalizer: normalizeUserConfig,
      createSender: createSender,
      builder: builder,
      createDefaultConfig: createDefaultConfig,
      createConfigManager: createBrowserConfigManager,
    });
    client.loaded = [];
    client.loading = [];
    ContextPlugin(client);
    InjectConfigPlugin(client);
    InjectEnvPlugin(client);
    InjectNetworkTypePlugin(client);
    loadPluginsOnPageLoad(client);
    return withCommandArray(client, captureCurrentContext, function (
      c,
      ctx,
      args,
    ) {
      return syncReportWithCapturedContext(
        c,
        ctx,
      )(function () {
        var _a = __read(args),
          method = _a[0],
          others = _a.slice(1);
        client[method].apply(client, __spreadArray([], __read(others)));
      });
    });
  };
  var createBrowserClient = function (config) {
    if (config === void 0) {
      config = {};
    }
    var client = createMinimalBrowserClient(config);
    SamplePlugin(client);
    PrecollectPlugin(client);
    CustomPlugin(client);
    // bundled collectors
    PageviewMonitorPlugin(client);
    client.loaded.push(PAGEVIEW_MONITOR_PLUGIN_NAME);
    AjaxMonitorPlugin(client);
    client.loaded.push(AJAX_MONITOR_PLUGIN_NAME);
    FetchMonitorPlugin(client);
    client.loaded.push(FETCH_MONITOR_PLUGIN_NAME);
    TTIMonitorPlugin(client);
    client.loaded.push(TTI_MONITOR_PLUGIN_NAME);
    FMPMonitorPlugin(client);
    client.loaded.push(FMP_MONITOR_PLUGIN_NAME);
    ResourceMonitorPlugin(client);
    client.loaded.push(RESOURCE_MONITOR_PLUGIN_NAME);
    ResourceErrorMonitorPlugin(client);
    client.loaded.push(RESOURCE_ERROR_MONITOR_PLUGIN_NAME);
    JsErrorMonitorPlugin(client);
    client.loaded.push(JS_ERROR_MONITOR_PLUGIN_NAME);
    BreadcrumbMonitorPlugin(client);
    client.loaded.push(BREADCRUMB_MONITOR_PLUGIN_NAME);
    PerformanceMonitorPlugin(client);
    client.loaded.push(PERFORMANCE_MONITOR_PLUGIN_NAME);
    return client;
  };

  var browserClient = createBrowserClient();
  var globalInstance$1 = getGlobalInstance();
  if (globalInstance$1) {
    ['p', 'pp', 'pcErr', 'pcRej'].forEach(function (name) {
      browserClient.provide(name, globalInstance$1[name]);
    });
  }

  var window$1 = getDefaultBrowser();
  var globalName = getGlobalName();
  if (window$1 && globalName) {
    var globalInstance = window$1[globalName];
    // 消费命令参数列表，只消费一次
    var commandQueue =
      (globalInstance === null || globalInstance === void 0
        ? void 0
        : globalInstance.q) || [];
    commandQueue.forEach(function (args) {
      return browserClient.apply(void 0, __spreadArray([], __read(args)));
    });
    commandQueue.length = 0;
    // 全局实例（同名下只能有一个）继续维护预收集数据队列
    if (browserClient.p) {
      if ('observe' in browserClient.p.a) {
        console.warn('global precollect queue already updated');
      }
      browserClient.p.a = toObservableArray(browserClient.p.a);
      var precollect_1 = browserClient.precollect;
      if (precollect_1) {
        browserClient.provide('precollect', function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          log.apply(
            void 0,
            __spreadArray(
              ['[script] keep pushing precollected data for other instances'],
              __read(args),
            ),
          );
          browserClient.p.a.push(__spreadArray(['precollect'], __read(args)));
          return precollect_1.apply(void 0, __spreadArray([], __read(args)));
        });
      }
    }
    window$1[globalName] = browserClient;
  }

  return browserClient;
})();
