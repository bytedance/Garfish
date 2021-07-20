import { Loader } from '@garfish/loader';
import {
  warn,
  hasOwn,
  makeMap,
  isObject,
  deepMerge,
  evalWithEnv,
  isPlainObject,
  setDocCurrentScript,
} from '@garfish/utils';
import {
  Module,
  SandboxOptions,
  ExecScriptOptions,
  ReplaceGlobalVariables,
} from './types';
import { historyModule } from './modules/history';
import { documentModule } from './modules/document';
import { XMLHttpRequestModule } from './modules/xhr';
import { localStorageModule } from './modules/storage';
import { listenerModule } from './modules/eventListener';
import { timeoutModule, intervalModule } from './modules/timer';
import { makeElInjector } from './dynamicNode';
import { optimizeMethods, createFakeObject } from './utils';
import { __garfishGlobal__, GARFISH_OPTIMIZE_NAME } from './symbolTypes';
import {
  createHas,
  createGetter,
  createSetter,
  createDefineProperty,
  createDeleteProperty,
} from './proxyInterceptor/global';
import { UiEventOverride } from './modules/uiEvent';

let id = 0;
const defaultModules: Array<Module> = [
  timeoutModule,
  intervalModule,
  historyModule,
  documentModule,
  listenerModule,
  localStorageModule,
  UiEventOverride,
];

// Deal with hmr problem
if (__DEV__) {
  defaultModules.push(XMLHttpRequestModule);
}

const isModule = (module: Window) => {
  return isObject(module)
    ? module[__garfishGlobal__ as any] !== undefined
    : false;
};

const addProxyWindowType = (module: Window, parentModule: Window) => {
  if (!isModule(module)) {
    module[__garfishGlobal__ as any] = parentModule;
  }
  return module;
};

export class Sandbox {
  public version = __VERSION__;
  public id = id++;
  public type = 'vm';
  public closed = true;
  public loader: Loader;
  public initComplete = false;
  public global?: Window;
  public options: SandboxOptions;
  public tempEnvVariables: Array<PropertyKey> = [];
  public replaceGlobalVariables: ReplaceGlobalVariables;
  public isExternalGlobalVariable: Set<PropertyKey> = new Set();
  public isProtectVariable: (p: PropertyKey) => boolean;
  public isInsulationVariable: (P: PropertyKey) => boolean;

  private optimizeCode = ''; // To optimize the with statement

  constructor(options: SandboxOptions) {
    // Default sandbox config
    const defaultOptions = {
      baseUrl: '',
      namespace: '',
      modules: [],
      sourceList: [],
      useStrict: false,
      openSandbox: true,
      strictIsolation: false,
      el: () => null,
      protectVariable: () => [],
      insulationVariable: () => [],
    };
    this.options = isPlainObject(options)
      ? deepMerge(defaultOptions, options)
      : defaultOptions;
    // sourceUrl Using a reference type, make its can be changed
    options.sourceList && (this.options.sourceList = options.sourceList);

    const { loaderOptions, protectVariable, insulationVariable } = this.options;
    this.loader = new Loader(loaderOptions);
    this.isProtectVariable = makeMap(protectVariable?.() || []);
    this.isInsulationVariable = makeMap(insulationVariable?.() || []);

    this.replaceGlobalVariables = {
      createdList: [],
      prepareList: [],
      recoverList: [],
      overrideList: {},
    };
    // inject Global capture
    makeElInjector();
    // The default startup sandbox
    this.start();
  }

  start() {
    this.closed = false;
    this.replaceGlobalVariables = this.getModuleData();
    const { createdList, overrideList } = this.replaceGlobalVariables;
    this.global = this.createProxyWindow(Object.keys(overrideList));

    if (overrideList) {
      for (const key in overrideList) {
        this.global[key] = overrideList[key];
      }
    }
    if (createdList) {
      createdList.forEach((fn) => fn(this.global));
    }
    if (!this.options.useStrict) {
      this.optimizeCode = this.optimizeGlobalMethod();
    }
    this.initComplete = true;
  }

  close() {
    if (this.closed) return;
    this.clearEffects();
    this.closed = true;
    this.global = null;
    this.optimizeCode = '';
    this.initComplete = false;
    this.tempEnvVariables = [];
    this.replaceGlobalVariables.createdList = [];
    this.replaceGlobalVariables.prepareList = [];
    this.replaceGlobalVariables.recoverList = [];
    this.replaceGlobalVariables.overrideList = [];
  }

  reset() {
    this.close();
    this.start();
  }

  createProxyWindow(moduleKeys: Array<string> = []) {
    const fakeWindow = createFakeObject(
      window,
      this.isInsulationVariable,
      makeMap(moduleKeys),
    );

    const baseHandlers = {
      get: createGetter(this),
      set: createSetter(this),
      defineProperty: createDefineProperty(this),
      deleteProperty: createDeleteProperty(this),
    };

    const parentHandlers = {
      ...baseHandlers,
      has: createHas(this),
    };

    // In fact, they are all proxy windows, but the problem of `var a = xx` can be solved through has
    const proxy = new Proxy(fakeWindow, parentHandlers);
    const subProxy = new Proxy(fakeWindow, baseHandlers);

    proxy.self = subProxy;
    proxy.window = subProxy;
    proxy.globalThis = subProxy;
    proxy.unstable_sandbox = this; // This attribute is used for debugger
    proxy.top = window.top === window ? subProxy : window.top;
    proxy.parent = window.parent === window ? subProxy : window.top;
    addProxyWindowType(proxy, window);
    return proxy;
  }

  getModuleData() {
    const recoverList = [];
    const createdList = [];
    const prepareList = [];
    const overrideList = {};
    const { modules, openSandbox } = this.options;
    const allModules = openSandbox ? defaultModules.concat(modules) : modules;

    for (const module of allModules) {
      if (typeof module === 'function') {
        const { recover, override, created, prepare } = module(this);
        if (recover) recoverList.push(recover);
        if (created) createdList.push(created);
        if (prepare) prepareList.push(prepare);
        if (override) {
          // The latter will overwrite the previous variable
          for (const key in override) {
            if (__DEV__ && overrideList[key]) {
              warn(`"${key}" global variables are overwritten.`);
            }
            overrideList[key] = override[key];
          }
        }
      }
    }
    return { recoverList, createdList, overrideList, prepareList };
  }

  clearEffects() {
    this.replaceGlobalVariables.recoverList.forEach((fn) => fn && fn());
  }

  optimizeGlobalMethod() {
    let code = '';
    const methods = optimizeMethods.filter((p) => {
      return (
        // If the method does not exist in the current environment, do not care
        p && !this.isProtectVariable(p) && hasOwn(this.global, p)
      );
    });
    if (methods.length === 0) return code;

    code = methods.reduce((prevCode, name) => {
      // You can only use let, if you use var,
      // declaring the characteristics in advance will cause you to fetch from with,
      // resulting in a recursive loop
      return `${prevCode} let ${name} = window.${name};`;
    }, code);
    // Used to update the variables synchronously after `window.x = xx` is updated
    this.global[`${GARFISH_OPTIMIZE_NAME}Methods`] = methods;
    this.global[`${GARFISH_OPTIMIZE_NAME}UpdateStack`] = [];
    code += `window.${GARFISH_OPTIMIZE_NAME}UpdateStack.push(function(k,v){eval(k+"=v")});`;
    return code;
  }

  execScript(code: string, env = {}, url = '', options?: ExecScriptOptions) {
    const { async } = options || {};
    const { useStrict, openSandbox } = this.options;
    const { prepareList, overrideList } = this.replaceGlobalVariables;
    if (prepareList) prepareList.forEach((fn) => fn && fn());

    const revertCurrentScript = setDocCurrentScript(
      this.global.document,
      code,
      false,
      url,
      async,
    );

    try {
      code += `\n${url ? `//# sourceURL=${url}\n` : ''}`;
      code = !useStrict ? `with(window) {;${this.optimizeCode + code}}` : code;
      this.tempEnvVariables = Object.keys(env);

      if (openSandbox) {
        evalWithEnv(code, {
          window: this.global,
          ...overrideList,
          ...env,
        });
      } else {
        evalWithEnv(code, env);
      }
    } catch (e) {
      // dispatch `window.onerror`
      const source = url || this.options.baseUrl;
      const message = e instanceof Error ? e.message : String(e);
      if (typeof this.global.onerror === 'function') {
        // @ts-ignore
        const errorFn = this.global.onerror._native || this.global.onerror;
        errorFn.call(window, message, source, null, null, e);
      }
      throw e;
    } finally {
      revertCurrentScript();
      this.tempEnvVariables = [];
    }
  }

  static getNativeWindow() {
    let module = window;
    while (isModule(module)) {
      module = module[__garfishGlobal__ as any] as Window & typeof globalThis;
    }
    return module;
  }

  static canSupport() {
    let support = true;
    if (
      !window.Proxy ||
      !Array.prototype.includes ||
      !String.prototype.includes
    ) {
      support = false;
    }
    // let statement
    if (support) {
      try {
        new Function('let a = 666;');
      } catch {
        support = false;
      }
    }
    if (!support) {
      warn(
        'The current environment does not support "vm sandbox",' +
          'Please use the "snapshot sandbox" instead.',
      );
    }
    return support;
  }
}
