//
// 子应用性能监控工具类
//

interface IPerformanceData {
  resourceLoadTime: number;
  blankScreenTime: number;
  firstScreenTime: number;
  isFirstRender: boolean;
  entry: string;
  action: string;
}

interface ICallbackFunction {
  (performanceData: IPerformanceData): void;
}

interface IConfig {
  attributes: boolean;
  childList: boolean;
  subtree: boolean;
}

interface IOptions {
  subAppRootSelector: Element | string;
  domObserverMaxTime?: number;
  waitSubAppNotifyMaxTime?: number;
  observeConfig?: IConfig;
}

class SubAppObserver {
  private observer: MutationObserver;
  private timeLag: number;
  private reportTimeLag: number;
  private observeTimer: number;
  private dataTimer: number;
  private entry: string;
  private subAppBeforeLoadTime: number;
  private subAppBeforeMountTime: number;
  private subAppStartPageShowTime: number;
  private subAppPageShowTime: number;
  private domQuerySelector: Element | string;
  private finishAction: string;
  private config: IConfig;
  private isRecordFinish: boolean;
  private isCallBackFinish: boolean;
  private isStartShowFlag: boolean;
  private isSubAppNotifyFinish: boolean;
  private targetSubscriber: ICallbackFunction[];
  private cbEntryList: string[];
  private performanceData: IPerformanceData;

  constructor(options: IOptions) {
    // 创建一个观察器实例并传入回调函数
    this.observer = new MutationObserver(
      this._mutationObserverCallback.bind(this),
    );
    this.subAppBeforeLoadTime = 0;
    this.subAppBeforeMountTime = 0;
    this.subAppStartPageShowTime = 0;
    this.subAppPageShowTime = 0;
    this.entry = '';
    this.observeTimer = 0;
    this.dataTimer = 0;
    this.domQuerySelector = options.subAppRootSelector;
    this.config = { attributes: true, childList: true, subtree: true };
    this.targetSubscriber = [];
    this.timeLag = options.domObserverMaxTime || 3000;
    this.reportTimeLag = options.waitSubAppNotifyMaxTime || 6000;
    this.isRecordFinish = false;
    this.cbEntryList = [];
    this.isStartShowFlag = true;
    this.isCallBackFinish = false;
    this.isSubAppNotifyFinish = false;
    this.finishAction = '';
    this.performanceData = {
      resourceLoadTime: 0,
      blankScreenTime: 0,
      firstScreenTime: 0,
      isFirstRender: true,
      entry: '',
      action: '',
    };
  }

  subscribePerformanceData(callback: ICallbackFunction): void {
    // console.warn('subscribe');
    try {
      this.targetSubscriber.push(callback);
    } catch (error) {
      console.error(error);
    }
  }

  unsubscribePerformanceData(callback: ICallbackFunction): void {
    // console.warn('subscribe');
    try {
      this.targetSubscriber = this.targetSubscriber.filter((sub) => {
        if (sub === callback) return false;
        return true;
      });
    } catch (error) {
      console.error(error);
    }
  }

  subAppBeforeLoad(entry: string): void {
    // console.warn('subAppBeforeLoad');
    this.entry = entry;
    this.isRecordFinish = false;
    this.isSubAppNotifyFinish = false;
    this.subAppBeforeLoadTime = performance.now();
    this.isCallBackFinish = false;
    this._handleSubscribeCallback(false);
  }

  subAppBeforeMount(_entry?: string): void {
    // console.warn('subAppBeforeMount');
    this.subAppBeforeMountTime = performance.now();
    this._subAppStartObserver();
  }

  subAppUnMount(_entry?: string): void {
    // console.warn('subAppUnMount');
    if (!this.isRecordFinish) {
      this._subAppEndObserver('SubAppUnMount');
    }
    this._handleSubscribeCallback(true);
  }

  // 子应用主动通知首屏加载完成
  afterRenderNotify(): void {
    // console.warn('afterRenderNotify');
    if (!this.isRecordFinish) {
      // 如果监测渲染还未结束,主动停止观察并处理数据
      this._subAppEndObserver('SubAppRenderNotify');
    } else if (!this.isSubAppNotifyFinish) {
      // 如果监测渲染已经结束,主动更新已处理数据
      this.isSubAppNotifyFinish = true;
      this.isRecordFinish = true;
      this.finishAction = 'SubAppRenderNotify';
      this._subAppPerformanceDataHandle();
    }
  }

  private _mutationObserverCallback() {
    // console.warn('mutationObserverCallback');
    // 子应用容器内开始渲染元素记录打点
    if (this.isStartShowFlag) {
      this.subAppStartPageShowTime = performance.now();
      this.isStartShowFlag = false;
    }

    // 子应用容器内渲染元素一定时间内不再发生变化记录打点
    clearTimeout(this.observeTimer);
    this.observeTimer = (setTimeout(() => {
      clearTimeout(this.observeTimer);
      if (!this.isRecordFinish) {
        this._subAppEndObserver('MutationObserver');
      }
    }, this.timeLag) as unknown) as number;
  }

  private _subAppEndObserver(finishAction: string) {
    // console.warn('subAppEndObserver');
    this.isRecordFinish = true;
    this.finishAction = finishAction;
    this.subAppPageShowTime = performance.now();
    this.observer.disconnect();
    this._subAppPerformanceDataHandle();
    this.isStartShowFlag = true;
  }

  private _subAppStartObserver() {
    // console.warn('subAppStartObserver');
    try {
      const targetNode =
        typeof this.domQuerySelector === 'string'
          ? (document.querySelector(this.domQuerySelector) as HTMLElement)
          : (this.domQuerySelector as HTMLElement);
      this.observer.observe(targetNode, this.config);
      this._subAppClickEventObserver(targetNode);
    } catch (err) {
      console.error(err);
    }
  }

  private _subAppPerformanceDataHandle() {
    // console.warn('subAppPerformanceDataHandle');
    const timeDifference =
      this.finishAction === 'MutationObserver' ? this.timeLag : 0;
    this.performanceData = {
      resourceLoadTime: this.subAppBeforeMountTime - this.subAppBeforeLoadTime,
      blankScreenTime: this.subAppStartPageShowTime - this.subAppBeforeLoadTime,
      firstScreenTime:
        this.subAppPageShowTime - this.subAppBeforeLoadTime - timeDifference,
      isFirstRender: this.cbEntryList.indexOf(this.entry) === -1,
      entry: this.entry,
      action: this.finishAction,
    };
  }

  private _subAppClickEventObserver(targetNode: HTMLElement) {
    // console.warn('subAppClickEventObserver');
    const eventCallback = (_e: MouseEvent | KeyboardEvent) => {
      clearTimeout(this.observeTimer);
      if (!this.isRecordFinish) {
        this._subAppEndObserver('UserEvent');
      }
    };
    targetNode.addEventListener('click', eventCallback);
    targetNode.addEventListener('keyup', eventCallback);
    targetNode.addEventListener('keydown', eventCallback);
    targetNode.addEventListener('keypress', eventCallback);
  }

  private _handleCallback() {
    // console.warn('handleCallback');
    try {
      this.isCallBackFinish = true;
      this.targetSubscriber.forEach((callback) => {
        const {
          firstScreenTime,
          blankScreenTime,
          resourceLoadTime,
          action,
          entry,
        } = this.performanceData;
        if (
          firstScreenTime > 0 &&
          blankScreenTime > 0 &&
          resourceLoadTime > 0 &&
          action &&
          entry
        ) {
          console.warn('SUCCESS -> 子应用性能数据输出：', this.performanceData);
          this.cbEntryList.push(this.entry);
          callback(this.performanceData);
        } else {
          console.warn('ERROR -> 子应用性能数据输出：', this.performanceData);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  private _handleSubscribeCallback(isImmediately: boolean) {
    // console.warn('handleSubscribeCallback');
    try {
      clearTimeout(this.dataTimer);
      if (isImmediately && !this.isCallBackFinish) {
        this._handleCallback();
      } else {
        this.dataTimer = (setTimeout(() => {
          this._handleCallback();
        }, this.reportTimeLag) as unknown) as number;
      }
    } catch (error) {
      console.error(error);
    }
  }
}
export default SubAppObserver;
