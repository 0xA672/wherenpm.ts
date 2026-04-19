# wherenpm.ts
where my npm?

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](.)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](.)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![npm version](https://img.shields.io/npm/v/wherenpm?color=cb3837&logo=npm)](https://www.npmjs.com/package/wherenpm)
[![npm downloads](https://img.shields.io/npm/dm/wherenpm?color=cb3837&logo=npm)](https://www.npmjs.com/package/wherenpm)
[![package size](https://img.shields.io/bundlephobia/minzip/wherenpm?label=size)](https://bundlephobia.com/package/wherenpm)

### Install
* Using npm:
```shell
npm install wherenpm
```
* Using Github repo url:
```shell
npm install github:0xA672/wherenpm.ts #latest main
```
* or
```shell
npm install github:0xA672/wherenpm.ts#main
```
* or
```shell
bun install github:0xA672/wherenpm.ts
```

### Usage
```typescript
import { getNpmPrefix } from 'wherenpm';
console.log(getNpmPrefix());// => '/usr/local' or 'C:\Users\...\AppData\Roaming\npm'
```

