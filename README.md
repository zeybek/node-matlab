# node-matlab

> Runs MATLAB script and gives output

## Install

```
$ npm install node-matlab
```

## Requirements

MATLAB 2019a or later must be installed on your pc, you don't need to install Python/Jupyter Notebook or MATLAB kernel

## Usage

```js
const matlab = require("node-matlab");

matlab
  .run("3+4")
  .then((result) => console.log(result))
  .catch((error) => console.log(error));

// ans = 7
```
