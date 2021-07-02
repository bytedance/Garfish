# `garfish`

> A helper lib for garfish in react

## Usage

```js
import { useModuleComponents } from '@garfish/react';

function App() {
  const [MyComp1, MyComp2] = useModuleComponents([
    {
      name: 'MyComp1',
      url: 'https://hostname/libs/my-comp1/index.js',
    },
    {
      name: 'MyComp2',
      url: 'https://hostname/libs/my-comp2/index.js',
    },
  ]);
  // ...
}
```
