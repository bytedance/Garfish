import { filterAndWrapEventListener } from '@garfish/utils';
import { Sandbox } from '../sandbox';

type Opts = boolean | AddEventListenerOptions;
type Listener = EventListenerOrEventListenerObject;

export function listenerModule(_sandbox: Sandbox) {
  const listeners = new Map<string, Listener[]>();
  const rawAddEventListener = window.addEventListener;
  const rawRemoveEventListener = window.removeEventListener;

  function addListener(type: string, listener: Listener, options?: Opts) {
    const curListeners = listeners.get(type) || [];
    listeners.set(type, [...curListeners, listener]);

    // This has been revised
    rawAddEventListener.call(
      this,
      type,
      // filterAndWrapEventListener(type, listener, sandbox.options.sourceList),
      listener,
      options,
    );
  }

  function removeListener(
    type: string,
    listener: Listener,
    options?: boolean | EventListenerOptions,
  ) {
    const curListeners = listeners.get(type) || [];
    const idx = curListeners.indexOf(listener);
    if (idx !== -1) {
      curListeners.splice(idx, 1);
    }
    listeners.set(type, [...curListeners]);
    rawRemoveEventListener.call(this, type, listener, options);
  }

  const recover = () => {
    listeners.forEach((listener, key) => {
      listener.forEach((fn) => {
        rawRemoveEventListener.call(window, key, fn);
      });
    });
    listeners.clear();
  };

  return {
    recover,
    override: {
      addEventListener: addListener.bind(window),
      removeEventListener: removeListener.bind(window),
    },
    created(global: Sandbox['global']) {
      const fakeDocument = global.document;
      if (fakeDocument) {
        fakeDocument.addEventListener = addListener.bind(document);
        fakeDocument.removeEventListener = removeListener.bind(document);
      }
    },
  };
}
