import React, { useEffect, useState } from 'react';
import { esModule, loadModule, cacheModules } from '@garfish/remote-module';
import logo from './logo.svg';
import './App.css';
import { Modal, Button } from 'antd';
import 'antd/dist/antd.css';

console.log(cacheModules);

function App() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const fn = () => {
    window.a.b.c = 1;
  };

  // const RemoteComponent = loadModuleSync('@Component.One', {
  //   externals: {
  //     a: 1,
  //   },
  // });
  // const RemoteComponentTwo = React.lazy(() =>
  //   esModule(loadModule('@Component.Two')),
  // );

  return (
    <div className="App">
      {/* <RemoteComponent text="cool!" /> */}

      {/* <React.Suspense fallback={<div>loading</div>}>
        <div>
          <RemoteComponentTwo text="good!" />
        </div>
      </React.Suspense> */}

      <Button type="primary" onClick={showModal}>
        Open Modal
      </Button>
      <Modal
        title="Basic Modal"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button onClick={fn}>test error</button>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
// console.log(document.createElement('div').contains(document.body));
// console.log(window.a.a.b);
// class MyComponent extends React.Component {
//   constructor(props) {
//     super(props);
//     this.myRef = React.createRef();
//   }
//   componentDidMount() {
//     setTimeout(()=>{
//       // console.log(this.myRef.current);
//       console.log(this.myRef.current.contains(document.createElement('div')))
//     }, 2000)
//   }
//   render() {
//     return <div id="woshi" ref={this.myRef} >
//       hello
//     </div>;
//   }
// }
// export default MyComponent;
export default App;
