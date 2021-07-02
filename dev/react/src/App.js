import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Modal, Button } from 'antd';
import { useModuleComponents, garfish } from '@garfish/react';
import 'antd/dist/antd.css';

garfish.setExternal({
  react: require('react'),
  'react-dom': require('react-dom'),
});

function App() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [MicroComp] = useModuleComponents([
    {
      name: 'react-comp',
      url: 'https://unpkg.com/garfish-react-components@1.0.3/dist/bundle.js',
    },
  ]);

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

  return (
    <div className="App">
      <Button type="primary" onClick={showModal}>
        Open Modal
      </Button>
      <MicroComp />
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

export default App;
