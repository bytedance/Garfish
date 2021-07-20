function computeStackTraceFromStackProp(ex) {
  if (!ex || !ex.stack) {
    return null;
  }

  const stack = [];
  const lines = ex.stack.split('\n');
  let isEval;
  let submatch;
  let parts;
  let element;
  const chrome = /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
  const gecko = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:file|https?|blob|chrome|webpack|resource|moz-extension|capacitor).*?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i;
  const winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
  const geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;

  for (let i = 0; i < lines.length; ++i) {
    if ((parts = chrome.exec(lines[i]))) {
      // Arpad: Working with the regexp above is super painful. it is quite a hack, but just stripping the `address at `
      // prefix here seems like the quickest solution for now.
      let url =
        parts[2] && parts[2].indexOf('address at ') === 0
          ? parts[2].substr('address at '.length)
          : parts[2];
      element = {
        url,
      };
    } else if ((parts = winjs.exec(lines[i]))) {
      element = {
        url: parts[2],
      };
    } else if ((parts = gecko.exec(lines[i]))) {
      isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
      if (isEval && (submatch = geckoEval.exec(parts[3]))) {
        // throw out eval line/column and use top-most line number
        parts[3] = submatch[1];
      }
      element = {
        url: parts[3],
      };
    } else {
      continue;
    }
    stack.push(element);
  }

  if (!stack.length) {
    return null;
  }

  return {
    name: ex.name,
    stack,
  };
}

function computeErrorUrls(ex) {
  if (ex && ex.filename) return ex.filename;
  const res = computeStackTraceFromStackProp(ex);
  let urls = [];
  if (res) {
    urls = res.stack.map((item) => {
      return item.url;
    });
  } else if (ex && ex.target && ex.target.tagName) {
    const tagName = ex.target.tagName.toLowerCase();
    if (
      ['link', 'style', 'script', 'img', 'video', 'audio'].indexOf(tagName) !==
      -1
    ) {
      urls = [ex.target.src || ex.target.href];
    }
  }
  return urls;
}

export default function GarfishPluginForSlardar(SlardarInstance, appName) {
  if (
    !window.__GARFISH__ ||
    (window.Garfish.options.sandbox && !window.Garfish.options.sandbox.open)
  ) {
    SlardarInstance('start');
    return false;
  }

  function getAppInstance() {
    // let apps = window.Garfish.activeApps.filter((app)=>app.appInfo.name === appName);
    // return apps[0];
    let app = window.Garfish.apps[appName];
    return app;
  }

  // Statistical performance indicators
  let appInstance = getAppInstance();

  const reportTimeData = (subAppTimeData) => {
    console.log(subAppTimeData);
  };

  if (
    appInstance &&
    appInstance.appPerformance &&
    appInstance.provider &&
    typeof appInstance.provider.destroy === 'function'
  ) {
    appInstance.appPerformance.subscribePerformanceData(reportTimeData);
    let originDestory = appInstance.provider.destroy;
    appInstance.provider.destroy = function (...args) {
      SlardarInstance && SlardarInstance('destroy');
      originDestory.apply(this, args);
      appInstance.provider.destroy = originDestory;
    };
  }

  SlardarInstance('on', 'beforeConfig', (config) => {
    config.plugins = {
      ...(config.plugins || {}),
      resource: {
        ignoreTypes: ['beacon'],
      },
    };
  });

  SlardarInstance('on', 'beforeSend', (ev) => {
    let app = getAppInstance();

    function getUrl(url) {
      for (let i = 0; i < app.sourceList.length; i++) {
        if (app.sourceList[i].url === url) {
          return app.sourceList[i];
        }
      }
      return false;
    }

    // The filtering error
    if (ev.ev_type === 'js_error' && app && app.sourceList && ev.payload) {
      let urls = computeErrorUrls(ev.payload.error);
      if (urls.length === 0) return false;

      for (let j = 0; j < urls; j++) {
        // Not the current application of error block
        if (!getUrl(urls[j])) {
          return false;
        } else {
          return ev;
        }
      }
    }

    // Filter static resource
    if (ev.ev_type === 'resource' && app && app.sourceList && ev.payload) {
      let source = getUrl(ev.payload.name);
      if (!source) return false;
      if (
        ev.payload.initiatorType === 'fetch' ||
        ev.payload.initiatorType === 'xmlhttprequest'
      ) {
        Object.defineProperty(ev.payload, 'initiatorType', {
          value: source.tagName.toLowerCase(),
        });
      }
    }

    return ev;
  });

  SlardarInstance('on', 'beforeDestroy', () => {
    if (appInstance && appInstance.appPerformance) {
      appInstance.appPerformance.unsubscribePerformanceData(reportTimeData);
    }
  });
  SlardarInstance('start');
}
