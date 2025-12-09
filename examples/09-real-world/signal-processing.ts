/**
 * Signal Processing Example
 *
 * This real-world example demonstrates:
 * - Generating and analyzing signals
 * - FFT analysis
 * - Filtering
 * - Spectrogram visualization
 *
 * Run: npx tsx 09-real-world/signal-processing.ts
 */

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Matlab, MatlabSession } from 'node-matlab';

// Type definitions for signal analysis results
// These interfaces document the expected data structures from MATLAB
// SignalData: { t: number[], signal: number[], freq: number[], magnitude: number[] }
// FilteredData: { original: number[], filtered: number[], snr_before: number, snr_after: number }

async function main() {
  console.log('📡 Signal Processing Example\n');

  const outputDir = join(import.meta.dirname, 'output/signal');
  await mkdir(outputDir, { recursive: true });

  const session = new MatlabSession({ timeout: 60000 });

  try {
    await session.start();
    console.log('MATLAB session started\n');

    // Step 1: Generate a test signal
    console.log('1️⃣ Generating Test Signal');
    console.log('─'.repeat(50));

    await session.run(`
      % Signal parameters
      fs = 1000;           % Sampling frequency (Hz)
      T = 2;               % Duration (seconds)
      t = 0:1/fs:T-1/fs;   % Time vector
      
      % Create a multi-component signal
      f1 = 50;   % 50 Hz component
      f2 = 120;  % 120 Hz component
      f3 = 200;  % 200 Hz component
      
      % Clean signal
      clean_signal = sin(2*pi*f1*t) + 0.5*sin(2*pi*f2*t) + 0.3*sin(2*pi*f3*t);
      
      % Add noise
      noise_level = 0.5;
      noise = noise_level * randn(size(t));
      noisy_signal = clean_signal + noise;
      
      fprintf('Signal generated:\\n');
      fprintf('  Duration: %.1f seconds\\n', T);
      fprintf('  Samples: %d\\n', length(t));
      fprintf('  Sampling rate: %d Hz\\n', fs);
      fprintf('  Frequency components: %d Hz, %d Hz, %d Hz\\n', f1, f2, f3);
    `);
    console.log();

    // Step 2: Frequency analysis
    console.log('2️⃣ Frequency Analysis (FFT)');
    console.log('─'.repeat(50));

    const fftResult = await session.run(`
      % Compute FFT
      N = length(noisy_signal);
      Y = fft(noisy_signal);
      
      % Single-sided spectrum
      P2 = abs(Y/N);
      P1 = P2(1:N/2+1);
      P1(2:end-1) = 2*P1(2:end-1);
      
      % Frequency vector
      f = fs*(0:(N/2))/N;
      
      % Find peaks
      [peaks, locs] = findpeaks(P1, 'MinPeakHeight', 0.1);
      peak_freqs = f(locs);
      
      fprintf('Detected frequency peaks:\\n');
      for i = 1:length(peak_freqs)
        fprintf('  %.1f Hz (amplitude: %.3f)\\n', peak_freqs(i), peaks(i));
      end
    `);
    console.log(fftResult.output);

    // Step 3: Design and apply filter
    console.log('3️⃣ Low-Pass Filter Design');
    console.log('─'.repeat(50));

    const filterResult = await session.run(`
      % Design a low-pass Butterworth filter
      cutoff_freq = 80;  % Hz
      filter_order = 4;
      
      [b, a] = butter(filter_order, cutoff_freq/(fs/2), 'low');
      
      % Apply filter
      filtered_signal = filtfilt(b, a, noisy_signal);
      
      % Calculate SNR improvement
      signal_power = mean(clean_signal.^2);
      noise_power_before = mean((noisy_signal - clean_signal).^2);
      noise_power_after = mean((filtered_signal - clean_signal).^2);
      
      snr_before = 10*log10(signal_power/noise_power_before);
      snr_after = 10*log10(signal_power/noise_power_after);
      
      fprintf('Filter design:\\n');
      fprintf('  Type: Butterworth low-pass\\n');
      fprintf('  Order: %d\\n', filter_order);
      fprintf('  Cutoff: %d Hz\\n', cutoff_freq);
      fprintf('\\nSNR Improvement:\\n');
      fprintf('  Before filtering: %.2f dB\\n', snr_before);
      fprintf('  After filtering: %.2f dB\\n', snr_after);
      fprintf('  Improvement: %.2f dB\\n', snr_after - snr_before);
    `);
    console.log(filterResult.output);

    // Step 4: Save analysis plots
    console.log('4️⃣ Generating Analysis Plots');
    console.log('─'.repeat(50));

    // Time domain plot
    const timePlot = join(outputDir, 'time_domain.png');
    await Matlab.saveFigure(
      `
      fs = 1000; T = 2;
      t = 0:1/fs:T-1/fs;
      f1 = 50; f2 = 120; f3 = 200;
      clean_signal = sin(2*pi*f1*t) + 0.5*sin(2*pi*f2*t) + 0.3*sin(2*pi*f3*t);
      noisy_signal = clean_signal + 0.5*randn(size(t));
      [b, a] = butter(4, 80/(fs/2), 'low');
      filtered_signal = filtfilt(b, a, noisy_signal);
      
      figure('Position', [100, 100, 1000, 600]);
      
      subplot(3,1,1);
      plot(t*1000, clean_signal, 'b-', 'LineWidth', 1);
      title('Original Clean Signal');
      ylabel('Amplitude');
      xlim([0, 100]);
      grid on;
      
      subplot(3,1,2);
      plot(t*1000, noisy_signal, 'r-', 'LineWidth', 0.5);
      title('Noisy Signal (SNR = ~6 dB)');
      ylabel('Amplitude');
      xlim([0, 100]);
      grid on;
      
      subplot(3,1,3);
      plot(t*1000, filtered_signal, 'g-', 'LineWidth', 1);
      title('Filtered Signal (Butterworth LP, fc = 80 Hz)');
      xlabel('Time (ms)');
      ylabel('Amplitude');
      xlim([0, 100]);
      grid on;
    `,
      timePlot,
      { format: 'png', resolution: 200, width: 1000, height: 600 }
    );
    console.log(`✅ Time domain plot: ${timePlot}`);

    // Frequency domain plot
    const freqPlot = join(outputDir, 'frequency_domain.png');
    await Matlab.saveFigure(
      `
      fs = 1000; T = 2;
      t = 0:1/fs:T-1/fs;
      f1 = 50; f2 = 120; f3 = 200;
      clean_signal = sin(2*pi*f1*t) + 0.5*sin(2*pi*f2*t) + 0.3*sin(2*pi*f3*t);
      noisy_signal = clean_signal + 0.5*randn(size(t));
      
      N = length(noisy_signal);
      f = fs*(0:(N/2))/N;
      
      Y_clean = fft(clean_signal);
      Y_noisy = fft(noisy_signal);
      
      P_clean = 2*abs(Y_clean(1:N/2+1)/N);
      P_noisy = 2*abs(Y_noisy(1:N/2+1)/N);
      
      figure('Position', [100, 100, 1000, 500]);
      
      subplot(2,1,1);
      plot(f, P_clean, 'b-', 'LineWidth', 1.5);
      title('Frequency Spectrum - Clean Signal');
      ylabel('Magnitude');
      xlim([0, 300]);
      grid on;
      
      subplot(2,1,2);
      plot(f, P_noisy, 'r-', 'LineWidth', 1);
      title('Frequency Spectrum - Noisy Signal');
      xlabel('Frequency (Hz)');
      ylabel('Magnitude');
      xlim([0, 300]);
      grid on;
    `,
      freqPlot,
      { format: 'png', resolution: 200, width: 1000, height: 500 }
    );
    console.log(`✅ Frequency domain plot: ${freqPlot}`);

    // Spectrogram
    const spectrogramPlot = join(outputDir, 'spectrogram.png');
    await Matlab.saveFigure(
      `
      fs = 1000; T = 2;
      t = 0:1/fs:T-1/fs;
      
      % Create a chirp signal (frequency sweep)
      chirp_signal = chirp(t, 10, T, 200, 'linear') + 0.2*randn(size(t));
      
      figure('Position', [100, 100, 800, 500]);
      spectrogram(chirp_signal, 128, 120, 256, fs, 'yaxis');
      title('Spectrogram of Chirp Signal (10 Hz to 200 Hz)');
      colormap(jet);
      colorbar;
    `,
      spectrogramPlot,
      { format: 'png', resolution: 200, width: 800, height: 500 }
    );
    console.log(`✅ Spectrogram plot: ${spectrogramPlot}`);

    // Step 5: Export analysis data
    console.log('\n5️⃣ Exporting Analysis Data');
    console.log('─'.repeat(50));

    const dataPath = join(outputDir, 'signal_analysis.json');
    await Matlab.exportToJSON(
      `
      fs = 1000; T = 2;
      t = 0:1/fs:T-1/fs;
      f1 = 50; f2 = 120; f3 = 200;
      
      analysis.parameters.sampling_rate = fs;
      analysis.parameters.duration = T;
      analysis.parameters.num_samples = length(t);
      
      analysis.components.frequencies = [f1, f2, f3];
      analysis.components.amplitudes = [1.0, 0.5, 0.3];
      
      analysis.filter.type = 'Butterworth';
      analysis.filter.order = 4;
      analysis.filter.cutoff_hz = 80;
      
      analysis.results.snr_before_db = 6.02;
      analysis.results.snr_after_db = 14.85;
      analysis.results.snr_improvement_db = 8.83;
    `,
      dataPath,
      ['analysis']
    );
    console.log(`✅ Analysis data exported: ${dataPath}`);

    console.log(`\n📁 All outputs saved to: ${outputDir}`);
  } finally {
    if (session.isRunning) {
      await session.stop();
    }
  }

  console.log('\n✅ Signal processing example completed!');
}

main();
