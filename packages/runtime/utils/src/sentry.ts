// copy from https://github.com/getsentry/sentry-javascript/blob/6.4.0/packages/browser/src/tracekit.ts

import { makeMap } from './utils';

export interface StackFrame {
  url: string;
  func: string;
  args: string[];
  line: number | null;
  column: number | null;
}

export interface StackTrace {
  name: string;
  message: string;
  mechanism?: string;
  stack: StackFrame[];
  failed?: boolean;
}
const chrome = /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
// gecko regex: `(?:bundle|\d+\.js)`: `bundle` is for react native, `\d+\.js` also but specifically for ram bundles because it
// generates filenames without a prefix like `file://` the filenames in the stacktrace are just 42.js
// We need this specific case for now because we want no other regex to match.
const gecko = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:file|https?|blob|chrome|webpack|resource|moz-extension|capacitor).*?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i;
const winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
const geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
const chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/;
// Based on our own mapping pattern - https://github.com/getsentry/sentry/blob/9f08305e09866c8bd6d0c24f5b0aabdd7dd6c59c/src/sentry/lang/javascript/errormapping.py#L83-L108
const reactMinifiedRegexp = /Minified React error #\d+;/i;

const UNKNOWN_FUNCTION = '?';
function extractMessage(ex: any): string {
  const message = ex && ex.message;
  if (!message) {
    return 'No error message';
  }
  if (message.error && typeof message.error.message === 'string') {
    return message.error.message;
  }
  return message;
}

export function computeStackTraceFromStackProp(ex: any): StackTrace | null {
  if (!ex || !ex.stack) {
    return null;
  }

  const stack = [];
  const lines = ex.stack.split('\n');
  let isEval;
  let submatch;
  let parts;
  let element;

  for (let i = 0; i < lines.length; ++i) {
    if ((parts = chrome.exec(lines[i]))) {
      const isNative = parts[2] && parts[2].indexOf('native') === 0; // start of line
      isEval = parts[2] && parts[2].indexOf('eval') === 0; // start of line
      if (isEval && (submatch = chromeEval.exec(parts[2]))) {
        // throw out eval line/column and use top-most line/column number
        parts[2] = submatch[1]; // url
      }

      // Arpad: Working with the regexp above is super painful. it is quite a hack, but just stripping the `address at `
      // prefix here seems like the quickest solution for now.
      let url =
        parts[2] && parts[2].indexOf('address at ') === 0
          ? parts[2].substr('address at '.length)
          : parts[2];

      // Kamil: One more hack won't hurt us right? Understanding and adding more rules on top of these regexps right now
      // would be way too time consuming. (TODO: Rewrite whole RegExp to be more readable)
      let func = parts[1] || UNKNOWN_FUNCTION;
      const isSafariExtension = func.indexOf('safari-extension') !== -1;
      const isSafariWebExtension = func.indexOf('safari-web-extension') !== -1;
      if (isSafariExtension || isSafariWebExtension) {
        func = func.indexOf('@') !== -1 ? func.split('@')[0] : UNKNOWN_FUNCTION;
        url = isSafariExtension
          ? `safari-extension:${url}`
          : `safari-web-extension:${url}`;
      }

      element = {
        url,
        func,
        args: isNative ? [parts[2]] : [],
        line: parts[3] ? +parts[3] : null,
        column: parts[4] ? +parts[4] : null,
      };
    } else if ((parts = winjs.exec(lines[i]))) {
      element = {
        url: parts[2],
        func: parts[1] || UNKNOWN_FUNCTION,
        args: [],
        line: +parts[3],
        column: parts[4] ? +parts[4] : null,
      };
    } else if ((parts = gecko.exec(lines[i]))) {
      isEval = parts[3] && parts[3].indexOf(' > eval') > -1;
      if (isEval && (submatch = geckoEval.exec(parts[3]))) {
        // throw out eval line/column and use top-most line number
        parts[1] = parts[1] || 'eval';
        parts[3] = submatch[1];
        parts[4] = submatch[2];
        parts[5] = ''; // no column when eval
      } else if (i === 0 && !parts[5] && ex.columnNumber !== void 0) {
        // FireFox uses this awesome columnNumber property for its top frame
        // Also note, Firefox's column number is 0-based and everything else expects 1-based,
        // so adding 1
        // NOTE: this hack doesn't work if top-most frame is eval
        stack[0].column = (ex.columnNumber as number) + 1;
      }
      element = {
        url: parts[3],
        func: parts[1] || UNKNOWN_FUNCTION,
        args: parts[2] ? parts[2].split(',') : [],
        line: parts[4] ? +parts[4] : null,
        column: parts[5] ? +parts[5] : null,
      };
    } else {
      continue;
    }

    if (!element.func && element.line) {
      element.func = UNKNOWN_FUNCTION;
    }

    stack.push(element);
  }

  if (!stack.length) {
    return null;
  }

  return {
    message: extractMessage(ex),
    name: ex.name,
    stack,
  };
}

export const sourceListTags = [
  'link',
  'style',
  'script',
  'img',
  'video',
  'audio',
];
export const sourceNode = makeMap(sourceListTags);

// Calculate the error object file within the address
export function computeErrorUrl(ex: any) {
  if (ex && ex.filename) return ex.filename;
  const res = computeStackTraceFromStackProp(ex);
  if (res) {
    const urls = res.stack.map((item) => {
      return item.url;
    });
    return urls[0] || null;
  } else if (ex && ex.target && ex.target.tagName) {
    const tagName = ex.target.tagName.toLowerCase();
    if (sourceNode(tagName)) {
      return ex.target.src || ex.target.href;
    }
  }

  return null;
}

// Filter is not a goal resources from the mistake
export function filterAndWrapEventListener(
  type: string,
  listener: EventListenerOrEventListenerObject,
  sourceList: Array<string>,
) {
  const errorHandler = function (e) {
    // Conform to the file list type trigger collection of events
    if (typeof listener === 'function') {
      // Through error stack source file, and the source of the static resources determine whether the current error belongs to the current application
      // if belong to the current application environment monitoring error
      if (sourceList) {
        console.log('**********', computeErrorUrl(e));
        const res = sourceList.find((item) => {
          return item.indexOf(computeErrorUrl(e)) !== -1;
        });
        if (res) {
          // e.stopPropagation();
          listener(e);
        }
      } else {
        listener(e);
      }
    }
  };

  const unhandledrejection = function (event) {
    event.promise.catch((e) => {
      if (e instanceof Error) {
        errorHandler(e);
      } else {
        if (typeof listener === 'function') listener(event);
      }
    });
  };

  const filterError: EventListenerOrEventListenerObject = function (event) {
    // Due to the current Garfish rendering process is asynchronous behavior leading to originally 'error' trigger events were 'unhandledrejection' to catch
    // Filtering error does not belong to the current application resources, has reached the area target application exception
    // Need a sandbox can effectively capture and create resources increase all child application content
    if (typeof listener === 'function') {
      if (type === 'unhandledrejection') {
        unhandledrejection(event);
      } else if (type === 'error') {
        errorHandler(event);
      } else {
        listener(event);
      }
    }
  };
  return filterError;
}
