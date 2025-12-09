% simple_script.m - A basic MATLAB script for demonstration
% This script creates some variables and displays output

% Create sample data
x = 1:10;
y = x.^2;

% Calculate statistics
meanY = mean(y);
sumY = sum(y);

% Display results
disp('=== Simple Script Results ===');
fprintf('x = [%s]\n', num2str(x));
fprintf('y = x^2 = [%s]\n', num2str(y));
fprintf('Mean of y: %.2f\n', meanY);
fprintf('Sum of y: %d\n', sumY);
disp('Script completed successfully!');

