import SubAppObserver from './subAppObserver';
import { interfaces } from '../../index';

// 在 Garfish 对应的生命周期中进行关键节点注册
export function GarfishPerformance() {
  const subAppObserver = null;
  return function (_Garfish: interfaces.Garfish): interfaces.Plugin {
    const subAppMap = {};
    return {
      name: 'performance',
      async beforeLoad(appInfo: any) {
        if (!subAppMap[appInfo.name]) {
          // 运营平台子应用跟节点 id 为 'master-app'
          subAppMap[appInfo.name] = new SubAppObserver({
            subAppRootSelector: appInfo.domGetter as Element,
          });
        }

        // 运营平台使用 Slardar 自定义事件上报子应用性能数据
        // subAppObserver.subscribePerformanceData((subAppTimeData: IPerformanceData) => {
        //   // subAppTimeData: 订阅的当前子应用的性能数据，详情看 interface 定义
        //   // 子应用性能数据上报（根据业务或数据为度需求不同可自行调整）
        //   // 以下代码是运营平台对子应用性能数据的上报代码，仅作为示例！
        //   const report = name => {
        //     // window.Slardar('emit', 'timer', {
        //     //   name,
        //     //   value: subAppTimeData[name],
        //     //   tags: {
        //     //     path: subAppTimeData.path,
        //     //     subAppEntry: subAppTimeData.path,
        //     //     env: process.env.NODE_ENV,
        //     //     isTimeout: String(subAppTimeData[name] >= 5000)
        //     //   }
        //     // })
        //     console.log(name, subAppTimeData[name])
        //   };

        //   // 子应用资源加载时间 subAppTimeData.resourceLoadTime
        //   report('resourceLoadTime');
        //   // 子应用资源白屏时间 subAppTimeData.blankScreenTime
        //   report('blankScreenTime');
        //   // 子应用资源首屏时间 subAppTimeData.firstScreenTime
        //   report('firstScreenTime');
        // });
        subAppMap[appInfo.name].subAppBeforeLoad(appInfo.entry);
        return true;
      },
      afterLoad(appInfo, appInstance: any) {
        if (appInstance)
          appInstance.appPerformance = subAppMap[appInfo.name] as any;
      },
      beforeMount(appInfo: any) {
        subAppMap[appInfo.name].subAppBeforeMount(appInfo.entry);
      },
      beforeUnMount(appInfo: any) {
        subAppMap[appInfo.name].subAppUnMount(appInfo.entry);
      },
    };
  };
}
