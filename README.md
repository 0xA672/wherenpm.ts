# wherenpm.ts
where my npm?

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](.)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](.)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

### Install
* Using Github repo url:
```shell
npm install github:0xA672/wherenpm.ts #latest main
```
or
```shell
npm install github:0xA672/wherenpm.ts#main
```
or
```shell
bun install github:0xA672/wherenpm.ts
```

### Usage
```typescript
import { getNpmPrefix } from 'wherenpm';
console.log(getNpmPrefix());// => '/usr/local' or 'C:\Users\...\AppData\Roaming\npm'
```

