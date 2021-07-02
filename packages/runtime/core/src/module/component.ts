import { evalWithEnv } from '@garfish/utils';
import { Garfish } from '../garfish';
import { interfaces } from '../interface';

export class Component {
  public name: string;
  public cjsModules: Record<string, any>;
  public module: { exports: any };
  public componentInfo: interfaces.ComponentInfo;
  public esModule: boolean = false;
  public manager: interfaces.ComponentManagerInterface;
  private context: Garfish;
  public global: any = window;

  constructor(
    context: Garfish,
    componentInfo: interfaces.ComponentInfo,
    manager: interfaces.ComponentManagerInterface,
  ) {
    this.context = context;
    this.name = componentInfo.name;
    this.componentInfo = componentInfo;
    this.manager = manager;
    this.module = {
      exports: {},
    };
    this.cjsModules = {
      exports: this.module.exports,
      module: this.module,
      require: (_key) => context.externals[_key],
    };
    this.init();
  }

  init() {
    const { url, componentCode } = this.manager;
    //Execute script
    try {
      this.execScript(componentCode, {}, url, {
        parser: this.componentInfo.parser,
      });
    } catch (err) {
      console.error(err);
    }
  }

  execScript(
    code: string,
    env: Record<string, any>,
    url?: string,
    options?: { parser: interfaces.ComponentParser },
  ) {
    env = this.getExecScriptEnv() || {};
    const sourceUrl = url ? `//# sourceURL=${url}\n` : '';

    try {
      if (options?.parser) {
        options.parser(code, env, url);
        return;
      }
      evalWithEnv(`;${code}\n${sourceUrl}`, env);
    } catch (e) {
      // this.context.hooks.lifecycle.errorExecCode.call(this.componentInfo, e);
      throw e;
    }
  }

  getComponent() {
    return this.cjsModules.exports.default || this.cjsModules.exports;
  }

  getExecScriptEnv() {
    // The legacy of commonJS function support
    return this.esModule ? {} : this.cjsModules;
  }
}
