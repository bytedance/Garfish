import GarfishInstance from 'garfish';

(window as any).__GARFISH_PARENT__ = true;
console.log(GarfishInstance);

GarfishInstance.run({
  basename: '/garfish_master',
  domGetter: '#submoduleByRouter',
  apps: [
    {
      name: 'react',
      activeWhen: '/react',
      // cache: true,
      entry: 'http://localhost:3000',
    },
    {
      name: 'vue',
      activeWhen: '/vue',
      // cache: true,
      entry: 'http://localhost:9090',
    },
  ],
  // FIXME：这里存在类型错误
  // autoRefreshApp: false,
  disablePreloadApp: true,
  sandbox: {
    open: true,
    snapshot: false,
    modules: [],
  },
});

const useRouterMode = true;

document.getElementById('vueBtn').onclick = async () => {
  if (useRouterMode) {
    history.pushState({}, 'vue', '/garfish_master/vue'); // use router to load app
  } else {
    let prevApp = await GarfishInstance.loadApp('vue', {
      entry: 'http://localhost:9090',
      domGetter: '#submoduleByCunstom',
    });
    console.log(prevApp);
    await prevApp.mount();
  }
};

document.getElementById('reactBtn').onclick = async () => {
  if (useRouterMode) {
    history.pushState({}, 'react', '/garfish_master/react');
  } else {
    let prevApp = await GarfishInstance.loadApp('react', {
      entry: 'http://localhost:3000',
      domGetter: '#submoduleByCunstom',
    });
    console.log(prevApp);
    await prevApp.mount();
  }
};
