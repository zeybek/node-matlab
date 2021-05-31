# node-matlab

![NPM](https://img.shields.io/npm/l/node-matlab?style=flat-square)
![npm](https://img.shields.io/npm/v/node-matlab?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/zeybek/node-matlab?style=flat-square)
![npm](https://img.shields.io/npm/dw/node-matlab?style=flat-square)
![MATLAB](https://img.shields.io/badge/MATLAB-%3E%3D%202019a-blue?style=flat-square)

Runs MATLAB script and gives output

## Install

```
$ npm install node-matlab
```

## Requirements

MATLAB 2019a or later must be installed on your pc, you don't need to install Python/Jupyter Notebook or MATLAB kernel

## Usage

```js
// One Line
const matlab = require("node-matlab");

matlab
  .run("3+4")
  .then((result) => console.log(result))
  .catch((error) => console.log(error));

// 7
```

You need to escape "\n", "\r" etc. to run multiline scripts

```js
// Multi Line
const matlab = require("node-matlab");

matlab
  .run(
    `clc;
clear;
counter = 0;

period = 0.1;
totalTime = 2;

for number = 0:period:totalTime
  counter = counter + 1;
  array(counter) = -2 * cos(2 * pi * 2 * number + deg2rad(47));
  fprintf("t(%g) = %g\\n", number, array(counter));
end
  `
  )
  .then((result) => console.log(result))
  .catch((error) => console.log(error));

/**********************
t(0) = -1.364
t(0.1) = 0.969619
t(0.2) = 1.96325
t(0.3) = 0.243739
t(0.4) = -1.81262
t(0.5) = -1.364
t(0.6) = 0.969619
t(0.7) = 1.96325
t(0.8) = 0.243739
t(0.9) = -1.81262
t(1) = -1.364
t(1.1) = 0.969619
t(1.2) = 1.96325
t(1.3) = 0.243739
t(1.4) = -1.81262
t(1.5) = -1.364
t(1.6) = 0.969619
t(1.7) = 1.96325
t(1.8) = 0.243739
t(1.9) = -1.81262
t(2) = -1.364
*********************/
```

```js
// Read From File
const matlab = require("node-matlab");

matlab
  .run("file.m")
  .then((result) => console.log(result))
  .catch((error) => console.log(error));

// t + 4*exp(-t) - 3*exp(-2*t) + 1
```
