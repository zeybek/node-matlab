# node-matlab

> Runs MATLAB script and gives output

## Install

```
$ npm install node-matlab
```

## Usage

```js
const matlab = require("node-matlab");

matlab
  .run("3+4")
  .then((result) => console.log(result))
  .catch((error) => console.log(error));

// ans = 7
```
