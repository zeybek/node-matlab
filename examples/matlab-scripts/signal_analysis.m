function [freq, magnitude, phase] = signal_analysis(signal, fs)
% SIGNAL_ANALYSIS Perform frequency analysis on a signal
%   [freq, magnitude, phase] = signal_analysis(signal, fs)
%
%   Inputs:
%       signal - Time-domain signal vector
%       fs     - Sampling frequency (Hz)
%
%   Outputs:
%       freq      - Frequency vector (Hz)
%       magnitude - Magnitude spectrum
%       phase     - Phase spectrum (radians)
%
%   Example:
%       t = 0:1/1000:1;
%       signal = sin(2*pi*50*t) + 0.5*sin(2*pi*120*t);
%       [f, mag, ph] = signal_analysis(signal, 1000);

    % Signal length
    N = length(signal);
    
    % Compute FFT
    Y = fft(signal);
    
    % Two-sided spectrum
    P2 = abs(Y/N);
    
    % Single-sided spectrum
    P1 = P2(1:floor(N/2)+1);
    P1(2:end-1) = 2*P1(2:end-1);
    
    % Frequency vector
    freq = fs*(0:floor(N/2))/N;
    
    % Magnitude and phase
    magnitude = P1;
    phase = angle(Y(1:floor(N/2)+1));
end

