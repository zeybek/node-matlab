const matlab = require("../lib/index");

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
