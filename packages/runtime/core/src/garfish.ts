import { EventEmitter } from 'events';
import { Loader, TemplateManager, JavaScriptManager } from '@garfish/loader';
import {
  warn,
  error,
  assert,
  hasOwn,
  deepMerge,
  transformUrl,
  isPlainObject,
  __GARFISH_FLAG__,
  getRenderNode,
} from '@garfish/utils';
import { Hooks } from './hooks';
import { App } from './module/app';
import { interfaces } from './interface';
import { getDefaultOptions } from './config';
import { fetchStaticResources } from './utils';
import { GarfishHMRPlugin } from './plugins/fixHMR';
import { GarfishOptionsLife } from './plugins/lifecycle';
import { GarfishPreloadPlugin } from './plugins/preload';
import { GarfishPerformance } from './plugins/performance';

export class Garfish implements interfaces.Garfish {
  public hooks: Hooks;
  public loader: Loader;
  public running = false;
  public version = __VERSION__;
  public flag = __GARFISH_FLAG__; // A unique identifier
  public channel = new EventEmitter();
  public options = getDefaultOptions();
  public externals: Record<string, any> = {};
  public plugins: Array<interfaces.Plugin> = [];
  public activeApps: Array<interfaces.App> = [];
  public cacheApps: Record<string, interfaces.App> = {};
  public appInfos: Record<string, interfaces.AppInfo> = {};
  private loading: Record<string, Promise<any> | null> = {};

  constructor(options: interfaces.Options) {
    this.hooks = new Hooks(false);
    this.loader = new Loader();

    // init Garfish options
    this.setOptions(options);
    // register plugins
    options?.plugins.forEach((pluginCb) => {
      this.usePlugin(this.hooks, pluginCb, this);
    });
    this.hooks.lifecycle.initialize.call(this.options);
  }

  private injectOptionalPlugin(options?: interfaces.Options) {
    const defaultPlugin = [
      GarfishHMRPlugin(),
      GarfishOptionsLife(options),
      GarfishPerformance(),
    ];
    // Preload plugin
    if (!options.disablePreloadApp) defaultPlugin.push(GarfishPreloadPlugin());

    defaultPlugin.forEach((pluginCb) => {
      this.usePlugin(this.hooks, pluginCb, this);
    });
  }

  public usePlugin(
    hooks,
    plugin: (context: Garfish) => interfaces.Plugin,
    ...args: Array<any>
  ) {
    assert(typeof plugin === 'function', 'Plugin must be a function.');
    if ((plugin as any)._registered) {
      __DEV__ && warn('Please do not register the plugin repeatedly.');
      return this;
    }
    (plugin as any)._registered = true;
    const res = plugin.apply(this, [this, ...args]);
    this.plugins.push(res);
    return hooks.usePlugins(res);
  }

  setOptions(options: Partial<interfaces.Options>) {
    assert(!this.running, 'Garfish is running, can`t set options');
    if (isPlainObject(options)) {
      this.options = deepMerge(this.options, options);
      // Index object can't deep copy otherwise unable to communicate
      if (hasOwn(options, 'props')) {
        this.options.props = options.props;
      }
    }
    return this;
  }

  run(options?: interfaces.Options) {
    if (this.running) {
      // Nested scene can be repeated registration application, and basic information for the basename、domGetter、lifeCycle
      if (options.nested) {
        const hooks = new Hooks(true);
        this.usePlugin(hooks, GarfishOptionsLife(options));
        [
          'autoRefreshApp',
          'disableStatistics',
          'disablePreloadApp',
          'sandbox',
        ].forEach((key) => {
          if (key in options)
            __DEV__ &&
              error(`Nested scene does not support the configuration ${key}`);
        });

        this.registerApp(
          options.apps?.map((app) => {
            return {
              ...app,
              hooks: hooks,
              props: options?.props || this.options.props,
              sandbox: options?.sandbox || this.options.sandbox,
              basename: options?.basename || this.options.basename,
              domGetter: options?.domGetter || this.options.domGetter,
            };
          }),
        );
        return this;
      }
      __DEV__ &&
        warn('Garfish is already running now, Cannot run Garfish repeatedly.');
    }

    // register plugins
    options?.plugins?.forEach((pluginCb) => {
      this.usePlugin(this.hooks, pluginCb, this);
    });

    this.hooks.lifecycle.beforeBootstrap.call(this.options);

    this.setOptions(options);
    this.injectOptionalPlugin(this.options);
    // register apps
    this.registerApp(options.apps || []);

    this.running = true;
    this.hooks.lifecycle.bootstrap.call(this.options);
    return this;
  }

  setExternal(nameOrExtObj: string | Record<string, any>, value?: any) {
    assert(nameOrExtObj, 'Invalid parameter.');
    if (typeof nameOrExtObj === 'object') {
      for (const key in nameOrExtObj) {
        if (__DEV__) {
          this.externals[key] &&
            warn(`The "${key}" will be overwritten in external.`);
        }
        this.externals[key] = nameOrExtObj[key];
      }
    } else {
      this.externals[nameOrExtObj] = value;
    }
  }

  registerApp(list: interfaces.AppInfo | Array<interfaces.AppInfo>) {
    this.hooks.lifecycle.beforeRegisterApp.call(list);
    const adds = {};
    if (!Array.isArray(list)) {
      list = [list];
    }
    for (const info of list) {
      assert(info.name, 'Miss app.name.');
      if (this.appInfos[info.name]) {
        __DEV__ && warn(`The "${info.name}" app is already registered.`);
      } else {
        assert(
          info.entry,
          `${info.name} application entry is not url: ${info.entry}`,
        );
        adds[info.name] = info;
        this.appInfos[info.name] = info;
      }
    }
    this.hooks.lifecycle.registerApp.call(this.appInfos);
    return this;
  }

  async loadApp(
    appName: string,
    options: Partial<interfaces.LoadAppOptions> | string,
  ): Promise<interfaces.App | null> {
    let appInfo = this.appInfos[appName];

    if (isPlainObject(options)) {
      // Does not support does not have remote resources and no registered application
      assert(
        !(!appInfo && !appInfo.entry),
        `Can't load unexpected module "${appName}".` +
          'Please provide the entry parameters or registered in advance of the app',
      );
      // Deep clone app options
      const tempInfo = appInfo;
      const originOpts = { ...(options as Partial<interfaces.LoadAppOptions>) };
      delete (options as Partial<interfaces.LoadAppOptions>).props;

      appInfo = deepMerge(tempInfo, options);
      appInfo.props = hasOwn(originOpts, 'props')
        ? originOpts.props
        : this.options.props;
    } else if (typeof options === 'string') {
      // `Garfish.loadApp('appName', 'https://xx.html');`
      appInfo = {
        name: appName,
        entry: options,
        basename: this.options.basename || '/',
        props: this.options.props,
        domGetter:
          this.options.domGetter || (() => document.createElement('div')),
      };
    }

    // Initialize the mount point, support domGetter as promise, is advantageous for the compatibility
    if (appInfo.domGetter)
      appInfo.domGetter = await getRenderNode(appInfo.domGetter);

    const asyncLoadProcess = async () => {
      // Return not undefined type data directly to end loading
      const stopLoad = await this.hooks.lifecycle.beforeLoad.promise(appInfo);
      if (stopLoad === false) {
        warn(`Load ${appName} application is terminated by beforeLoad.`);
        return null;
      }
      // Existing cache caching logic
      let appInstance = null;
      const cacheApp = this.cacheApps[appName];
      if (appInfo.cache && cacheApp) {
        appInstance = cacheApp;
      } else {
        try {
          let isHtmlMode, fakeEntryManager;
          const resources = { js: [], link: [], modules: [] }; // Default resources
          const { resourceManager: entryManager } = await this.loader.load(
            appName,
            transformUrl(location.href, appInfo.entry),
          );

          // Html entry
          if (entryManager instanceof TemplateManager) {
            isHtmlMode = true;
            const [js, link, modules] = await fetchStaticResources(
              appName,
              this.loader,
              entryManager,
            );
            resources.js = js;
            resources.link = link;
            resources.modules = modules;
          } else if (entryManager instanceof JavaScriptManager) {
            // Js entry
            isHtmlMode = false;
            const mockTemplateCode = `<script src="${entryManager.url}"></script>`;
            fakeEntryManager = new TemplateManager(
              mockTemplateCode,
              entryManager.url,
            );
            entryManager.setDep(fakeEntryManager.findAllJsNodes()[0]);
            resources.js = [entryManager];
          } else {
            // No other types of entrances are currently supported
            error(`Entrance wrong type of resource of "${appName}"`);
          }

          const manager = fakeEntryManager || entryManager;
          // Call lifecycle
          this.hooks.lifecycle.processResource.call(
            appInfo,
            manager,
            resources,
          );
          appInstance = new App(
            this,
            appInfo,
            manager,
            resources,
            isHtmlMode,
            this.options.customLoader,
          );
          this.cacheApps[appName] = appInstance;
        } catch (e) {
          __DEV__ && error(e);
          this.hooks.lifecycle.errorLoadApp.call(e, appInfo);
        } finally {
          this.loading[appName] = null;
        }
      }
      this.hooks.lifecycle.afterLoad.call(appInfo, appInstance);
      return appInstance;
    };

    if (!appInfo.cache || !this.loading[appName]) {
      this.loading[appName] = asyncLoadProcess();
    }
    return this.loading[appName];
  }
}
