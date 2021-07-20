import { __extends, transformUrl, hookObjectProperty } from '@garfish/utils';
import { Sandbox } from '../sandbox';

// When dealing with hot updates, "ho-update.json" requires a proxy across domains
export function XMLHttpRequestModule(sandbox: Sandbox) {
  const baseUrl = sandbox.options.baseUrl;
  let restoreOpen = null;
  class XMLHttpRequestPatch extends XMLHttpRequest {
    constructor() {
      super();
    }
  }

  function fetchPatch(req, options = {}) {
    return window.fetch && window.fetch(req, options);
  }

  // Object.setPrototypeOf(XMLHttpRequestPatch, XMLHttpRequest.prototype);
  if (typeof baseUrl === 'string') {
    restoreOpen = hookObjectProperty(
      XMLHttpRequestPatch.prototype,
      'open',
      function (send) {
        return function (...args) {
          const path = args[1];
          const isHotJson =
            typeof path === 'string' && path.endsWith('hot-update.json');

          if (isHotJson && arguments[0]?.toLowerCase() === 'get') {
            args[1] = transformUrl(baseUrl, path);
          }
          return send.apply(this, args);
        };
      },
    )();
  }

  return {
    override: {
      XMLHttpRequest: XMLHttpRequestPatch as any,
      fetch: window.fetch ? fetchPatch : undefined,
      recover() {
        restoreOpen && restoreOpen();
        // window.fetch && fetchPatch();
      },
    },
  };
}
