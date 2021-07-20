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

function computeErrorUrl(ex, sourceList) {
  if (ex && ex.filename) return ex.filename;
  const res = computeStackTraceFromStackProp(ex);
  let urls;
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

  if (!urls) return false;

  for (let j = 0; j < urls.length; j++) {
    if (sourceList.indexOf(urls[j]) !== -1) {
      console.log('match SubApp sourceLink :', urls[j]);
      return true;
    }
  }

  return false;
}

export function GarfishPluginForBeforeSend() {
  if (ev.ev_type === 'js_error') {
    let isSubAppSource = computeErrorUrl(
      ev.payload.error,
      window.Garfish.apps.react.sourceList,
    );
    console.log('isSubAppSource #@@@@@@@@', ev, isSubAppSource);
    if (!isSubAppSource) return ev;
  }
  return ev;
}
