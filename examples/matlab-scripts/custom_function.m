function [result, stats] = custom_function(data, operation)
% CUSTOM_FUNCTION Perform operations on input data
%   [result, stats] = custom_function(data, operation)
%
%   Inputs:
%       data      - Input array or matrix
%       operation - String: 'square', 'sqrt', 'normalize', 'fft'
%
%   Outputs:
%       result - Transformed data
%       stats  - Structure with statistics
%
%   Example:
%       [r, s] = custom_function([1 2 3 4 5], 'square')

    % Validate inputs
    if nargin < 2
        operation = 'square';
    end
    
    % Perform operation
    switch lower(operation)
        case 'square'
            result = data.^2;
        case 'sqrt'
            result = sqrt(data);
        case 'normalize'
            result = (data - min(data)) / (max(data) - min(data));
        case 'fft'
            result = abs(fft(data));
        otherwise
            error('Unknown operation: %s', operation);
    end
    
    % Calculate statistics
    stats.min = min(result(:));
    stats.max = max(result(:));
    stats.mean = mean(result(:));
    stats.std = std(result(:));
    stats.operation = operation;
end

