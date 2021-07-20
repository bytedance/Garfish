import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import GarfishPluginForSlardar from './garfishPlugin.js';
// import { setModuleConfig } from '@garfish/remote-module';

// setModuleConfig({
//   externals: { React },
// });

// setModuleAlias({
//   testModule: 'http://localhost:3000/remoteComponent.js',
// });

// console.log(
//   window.HTMLIFrameElement._native ===
//     window.Gar.getGlobalObject().HTMLIFrameElement,
//   'HTMLIFrameElement',
// );
// console.log(document.head instanceof window.HTMLIFrameElement, 'document.head');
// console.dir(window.HTMLIFrameElement._native);

// // 动态插入节点
// setTimeout(() => {
//   const script = document.createElement('script');
//   // script.innerHTML = 'console.log("window", window)';
//   script.src =
//     'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.3.0/lodash.js';
//   script.onload = function (e) {
//     console.log(e);
//     console.log(script);
//   };
//   script.onerror = function (e) {
//     console.log(e);
//   };
//   document.body.appendChild(script);
// }, 2000);

// const a = document.createElement('div');
// a.innerHTML = 'taotaotest';
// a.id = 'tt';
// console.log(document.body, a);
// document.body.appendChild(a);

// const aa = document.body.querySelector('#tt');
// document.body.removeChild(aa);

// console.log(new ArrayBuffer(11));
const render = ({ dom }) => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    dom.querySelector('#root'),
  );
};

export const provider = (opts) => {
  return {
    render(...args) {
      window.Slardar('init', {
        bid: 'garfish_test',
        plugins: {
          resource: {
            ignoreTypes: [],
          },
        },
      });
      window.Slardar('on', 'send', (ev) => console.log(ev.ev_type, ev));

      GarfishPluginForSlardar(window.Slardar, 'react');
      window.Slardar('start');

      // // let onloadEvent = new Event("load", {"bubbles":false, "cancelable":false});

      setTimeout(() => {
        const xhr = new XMLHttpRequest();
        xhr.open('get', 'http://localhost:3000/subApp', true);
        xhr.onreadystatechange = function () {
          if (xhr.readyState !== 4) {
            return;
          }
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('subApp xhr');
          }
        };
        xhr.send(null);
        fetch('http://localhost:3000/fetch/subApp').then((res) => {});
        throw Error('subApp: unhandledrejection error');
      }, 2000);

      // preload('http://localhost:3000/remoteComponent.js').then(() => {
      render(...args);
      // });
    },
    destroy({ isUnmount }) {
      if (isUnmount) {
        ReactDOM.unmountComponentAtNode(opts.dom.querySelector('#root'));
      }
    },
  };
};

// 这能够让子应用独立运行起来
if (!window.__GARFISH__) {
  render({
    dom: document.body,
  });
}

// let st = document.createElement('style');
// console.log(document.head.appendChild(st));

// let st1 = document.createElement('style');
// console.log(document.activeElement.appendChild(st1));
// let st2 = document.createElement('style');
// console.log(document.body.appendChild(st2));
// // document.cookie = 'fdsfs';
// console.log(document.cookie, 'document.cookie');

// const config = { attributes: true, childList: true, subtree: true };
// let ob = new MutationObserver(() => {
//   console.log('change');
// });

// ob.observe(document.body, config);

// window.onload = function (e) {
//   console.log(this, 'window.onload');
// };

// setTimeout(() => {
//   const ns = [];
//   console.log(Document);
//   const en = Document.prototype.createElement;
//   Document.prototype.createElement = function () {
//     ns.push(1);
//     return en.apply(this, arguments);
//   };
//   document.createElement('div');
//   console.log(ns); // [1]

//   const doc = new Document();
//   console.log(document instanceof Document); // true
//   console.log(doc instanceof Document); // true
//   console.log(doc.__proto__ === Document.prototype); // false, 一个代理，一个是基对象
//   // console.log(
//   //   window.Gar.getGlobalObject().document.createElement !==
//   //     Document.prototype.createElement,
//   // ); // true
//   console.log(doc.body, document.body); // null,  body
//   doc.a = 1;
//   document.b = 2;
//   console.log(document.a === undefined, doc.a === 1); // true, true
//   console.log(document.b === 2, doc.b === undefined); // true, true
// }, 2000);

// History.prototype.a = 1;
// console.log(window.history instanceof History); // true
// console.log(window.history.a === 1); // true
// console.log(Object.getPrototypeOf(window.history) === History.prototype); // true
