<template>
  <div id="app">
    <cm-one :text="text"/>
    <cm-two :text="text"/>
    <img alt="Vue logo" src="./assets/logo.png">
    <div>
      <router-link to="/">Home </router-link><br />
      <router-link to="/todo">Go to Foo</router-link>
    </div>
    <router-view />
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <g fill="none" fill-rule="evenodd">
          <path d="M0 0H20V20H0z"/>
          <path fill="currentColor" d="M10 .833c5.063 0 9.167 4.104 9.167 9.167S15.063 19.167 10 19.167.833 15.063.833 10 4.937.833 10 .833zM10 2.5c-4.142 0-7.5 3.358-7.5 7.5 0 4.142 3.358 7.5 7.5 7.5 4.142 0 7.5-3.358 7.5-7.5 0-4.142-3.358-7.5-7.5-7.5zM8.14 5.69l1.768 1.768 1.767-1.768c.163-.162.427-.162.59 0l.589.59c.163.162.163.426 0 .589l-2.068 2.067h2.13c.23 0 .417.187.417.417v.833c0 .23-.186.417-.416.417h-2.084v1.064h2.084c.23 0 .416.186.416.416v.834c0 .23-.186.416-.416.416h-2.084v1.25c0 .23-.186.417-.416.417h-.834c-.23 0-.416-.187-.416-.417v-1.25H7.083c-.23 0-.416-.186-.416-.416v-.834c0-.23.186-.416.416-.416h2.084v-1.064H7.083c-.23 0-.416-.187-.416-.417v-.833c0-.23.186-.417.416-.417h1.945l-.004-.005L6.96 6.87c-.162-.163-.162-.427 0-.59l.59-.589c.162-.162.426-.162.589 0z"/>
      </g>
    </svg>
    <button @click="changeData">change data</button>
    <button @click="alertError"> alert error </button>
    <MicroApp :basename="basename" />
  </div>
</template>

<script>
import {
  loadModule,
  setModuleConfig,
} from '@garfish/remote-module';
import MicroApp from './microApp';

setModuleConfig({
  alias: {
    Component: 'http://localhost:9090/remoteModule.js',
  },
})

export default {
  name: 'App',
  props: ['basename'],
  data: () => ({
    text: 'parent text',
  }),
  methods: {
    alertError (){
      // throw Error('subApp normal error');
      window.a.a.a = true;
    },
    changeData() {
      this.text = this.text === 'parent' ? 'parent text' : 'parent'
    }
  },
  components: {
    MicroApp,
    cmOne: () => loadModule('@Component.cmOne'),
    cmTwo: () => loadModule('@Component.cmTwo'),
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
