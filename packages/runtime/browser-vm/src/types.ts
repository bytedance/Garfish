import { Sandbox } from './sandbox';
import { LoaderOptions } from '@garfish/loader';

export type FakeWindow = Window & Record<PropertyKey, any>;
export type Module = (sandbox: Sandbox) => OverridesData;
export interface OverridesData {
  recover?: () => void;
  prepare?: () => void;
  created?: (context: Sandbox['global']) => void;
  override?: Record<PropertyKey, any>;
}
export interface ReplaceGlobalVariables {
  recoverList: Array<OverridesData['recover']>;
  prepareList: Array<OverridesData['prepare']>;
  createdList: Array<OverridesData['created']>;
  overrideList: Record<PropertyKey, any>;
}

export interface SandboxOptions {
  namespace: string;
  baseUrl?: string;
  useStrict?: boolean;
  openSandbox?: boolean;
  strictIsolation?: boolean;
  modules?: Array<Module>;
  sourceList?: Array<{ tagName: string; url: string }>;
  loaderOptions?: LoaderOptions;
  el?: () => Element | ShadowRoot | null;
  protectVariable?: () => Array<PropertyKey>;
  insulationVariable?: () => Array<PropertyKey>;
}

export interface ExecScriptOptions {
  async?: boolean;
  noEntry?: boolean;
}

// interface InvokeBeforeRefs {
//   url: string;
//   code: string;
//   context: FakeWindow;
// }

// hooks
// type onclose = (sandbox: Sandbox) => void;
// type onstart = (sandbox: Sandbox) => void;
// type onerror = (err: Error | string) => void;
// type onClearEffect = (sandbox: Sandbox) => void;
// type onCreateContext = (sandbox: Sandbox) => void;
// type onInvokeAfter = (sandbox: Sandbox, refs: InvokeBeforeRefs) => void;
// type onInvokeBefore = (sandbox: Sandbox, refs: InvokeBeforeRefs) => void;
// type onAppendNode = (
//   sandbox: Sandbox,
//   rootEl: Element,
//   newEl: Element,
//   tag: string,
//   oldEl: Element,
// ) => void;

// export interface Hooks {
//   onstart?: onstart | Array<onstart>;
//   onclose?: onclose | Array<onclose>;
//   onerror?: onerror | Array<onerror>;
//   onAppendNode?: onAppendNode | Array<onAppendNode>;
//   onClearEffect?: onClearEffect | Array<onClearEffect>;
//   onInvokeAfter?: onInvokeAfter | Array<onInvokeAfter>;
//   onInvokeBefore?: onInvokeBefore | Array<onInvokeBefore>;
//   onCreateContext?: onCreateContext | Array<onCreateContext>;
// }
