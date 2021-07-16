# Contributing to Garfish

😁 Hello, 很高兴你能有兴趣参与 Garfish 项目，下面是一些本仓库开发提示相关的介绍

- 开发设置
- 项目结构
- 打包介绍
- 调试流程


Garfish 仓库使用 learn 和一些额外的构建脚本共同处理，这意味着，learn 的命令也都是可以用的

## 开发设置

如果你想参与 Garfish 的开发或贡献代码，确保你安装以下依赖和插件（vscode 插件）

- 确保你的 node 为 **，npm 版本为 **
- 安装 `Eslint` 插件
- 安装 `EditorConfig for VS Code` 插件

克隆完本仓库后

```shell
  $ npm run setup # 安装依赖
```

## 项目结构

- `dev`: 完整的 Garfish 调试模板，里面存放一个 main 模块和多个子模块

- `packages`: 存放所有的子包（包括 runtime、tools 和 private 的包）

  - `core`: rumtime 和 plugin 相关的包

    - `garfish`: garfish runtime 的入口包
    - `router`: 路由
    - `sandbox`: 沙箱
    - `statistics`: 信息收集上报的插件

  - `tool`: garfish cli 和其他工具包
    - `cli`: cli 的基础包
    - `cli-create`: 创建微前端工程模板
    - `cli-dev`: 调试微前端
    - `proxy`: whistle 相关代理 api 的封装
    - `shared`: tool 公共依赖包

- `scripts`: 与构建调试相关的相关脚本，熟悉他们会很有帮助
  - `dev.js`: 调试开发的自动化脚本，启动 dev 工程并自动 watch 源码
  - `build.js`: 使用 rollup 打包成多种格式的包
  - `createPackage.js`: 生成新的子包模板工程
  - `utils.js`: 一些工具函数
  - `verifyCommit.js`: commit 信息的校验
  - `jestTest.js`: 启动单元测试以及测试服务器

## 打包介绍

### Core

Garfish runtime 相关的包使用 rollup 来构建，每个子包使用同一份脚本来构建，当然也可以做差异化的配置，在子包下的 `package.json` 下面中增加 `buildOptions`，他有以下字段，打包的文件将生成到 `dist` 下，使用 `npm run build:core` 可以打包所有 core 下面的包

```json
  "buildOptions": {
    "name": "Garfish", // 当打包成 umd 或者 esm-browser，以此为例，将以 Garfish 的 namespace 注入到 window 中。没有指定时，默认用子包文件夹转为驼峰后的名字
    "devTemplate": "complete", // 选择需要调试的模板，complete 或 module
    "formats": [ // 制定需要打包的格式
      "umd",
      "cjs",
      "esm-browser",
      "esm-bundler"
    ]
  }
```

我们以 garfish 这个子包为例介绍打包的流程

```shell
  $ yarn build garfish -f=umd -n -s -m
```

- `-f`: formats，指定打包格式
- `-n`: nocheck，打包时不检查 ts 类型错误
- `-s`: sourcemap，打包后生成 sourcemap
- `-m`: mergetypes，打包完成后字段合并类型声明为一个文件
- `-e`: noExternal，garfish 内部所用到的包都打进一个文件中

#### 打包后的文件介绍

- `dist/garfish.cjs.js`: cjs 的包，里面包含所有的警告和提示信息
- `dist/garfish.cjs.prod.js`: cjs 的包，所有的警告信息都被删除掉了
- `dist/garfish.esm-browser.js`: esm 的包，子包用到依赖都被打进来了
- `dist/garfish.esm-bundler.js`: esm 的包，子包的依赖都没有被打进来，供使用者在类 webpack 的打包工具的帮助下的场景使用
- `dist/garfish.umd.js`: umd 的包，兼容多种格式，子包的依赖都被打进来了

### Tool

tools 的包使用 tsc 来打包，`npm run build:tool` 打包所有 tool 下面的包。打包某一个子包可以用下面这样的例子

```shell
  # 打包 @garfish/garfish-cli 这个子包
  $ lerna run build --scope @garfish/garfish-cli
```

## 调试流程

由于 Garfish 的调试需要同时调试**主工程**和多个**子工程**，靠手动去搭建项目调试是一个费时费力的流程，所以我们通过脚本来自动化构建前置的环境<br/>
子包如果需要有调试模板工程的能力，需要在当前子包的 `package.json` 中的 `buildOptions` 中指定 `devTemplate` 字段

```shell
  # 调试 所有子包
  $ lerna exec yarn link
  $ yarn build:watch
  $ yarn dev core
```

然后整个 core 里面的子包，源码的改动都会实时同步打包到 `/dev/main/dist` 下。

```shell
  # 调试 tool 下的包
  $ lerna run dev --scope @garfish/garfish-cli
```

## 常见的操作

```shell
# 调试 core/garfish 子包
$ yarn dev garfish

# 调试 core/sandbox 子包，并在浏览器中打开调试页面
$ yarn dev sandbox -o

# 单独打包 core/garfish 子包，并把相关的依赖的子包打进去，实时监听文件的变动打包
$ yarn build garfish -e -w

#  单独打包 core/garfish 子包，并把相关的依赖的子包打进去，合并打包后的 .d.ts
$ yarn build garfish -e -m

# 打包所有的 core 下面的子包
$ yarn build:core

# 调试 tool/cli 这个子包
$ lerna run dev --scope=@garfish/garfish-cli

# 单独打包 tool/cli 这个子包
$ lerna run build --scope=@garfish/garfish-cli

# 打包所有 tool 下的子包
$ yarn build:tool

# 打包 core 和 tool 下面所有的子包
$ yarn build:all

# 在 core 下创建一个新的子包工程
$ yarn pkg <pkgName>

# 在 tool 下创建一个新的子包工程
$ yarn pkg <pkgName> -t=tool

# 发布一个 latest 的包（beta，alpha 同理）
$ lerna publish --dist-tag=latest
```
