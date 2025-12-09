/**
 * Data Visualization Dashboard
 *
 * This real-world example demonstrates:
 * - Creating comprehensive data visualizations
 * - Multiple plot types
 * - Statistical analysis
 * - Report generation
 *
 * Run: npx tsx 09-real-world/data-visualization.ts
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Matlab, MatlabSession } from 'node-matlab';

async function main() {
  console.log('📊 Data Visualization Dashboard\n');

  const outputDir = join(import.meta.dirname, 'output/dashboard');
  await mkdir(outputDir, { recursive: true });

  const session = new MatlabSession({ timeout: 60000 });

  try {
    await session.start();
    console.log('MATLAB session started\n');

    // Step 1: Generate sample business data
    console.log('1️⃣ Generating Sample Business Data');
    console.log('─'.repeat(50));

    await session.run(`
      rng(42);  % For reproducibility
      
      % Time period
      months = datetime(2024, 1:12, 1);
      month_names = {'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', ...
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'};
      
      % Sales data
      base_sales = [150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 320];
      sales_variance = randn(1, 12) * 20;
      monthly_sales = base_sales + sales_variance;
      
      % Product categories
      categories = {'Electronics', 'Clothing', 'Home', 'Sports', 'Books'};
      category_sales = [450, 320, 280, 210, 140];
      
      % Regional data
      regions = {'North', 'South', 'East', 'West'};
      regional_sales = [380, 290, 350, 280];
      
      % Customer satisfaction scores
      satisfaction_scores = 3 + 1.5*rand(500, 1);
      
      fprintf('Generated data for 2024:\\n');
      fprintf('  Monthly sales data: 12 months\\n');
      fprintf('  Product categories: %d\\n', length(categories));
      fprintf('  Regions: %d\\n', length(regions));
      fprintf('  Customer responses: %d\\n', length(satisfaction_scores));
    `);
    console.log();

    // Step 2: Calculate key metrics
    console.log('2️⃣ Calculating Key Metrics');
    console.log('─'.repeat(50));

    const metricsResult = await session.run(`
      % Sales metrics
      total_revenue = sum(monthly_sales) * 1000;
      avg_monthly = mean(monthly_sales) * 1000;
      growth_rate = (monthly_sales(end) - monthly_sales(1)) / monthly_sales(1) * 100;
      best_month = month_names{find(monthly_sales == max(monthly_sales))};
      worst_month = month_names{find(monthly_sales == min(monthly_sales))};
      
      % Customer metrics
      avg_satisfaction = mean(satisfaction_scores);
      satisfaction_std = std(satisfaction_scores);
      pct_satisfied = sum(satisfaction_scores >= 4) / length(satisfaction_scores) * 100;
      
      fprintf('KEY METRICS:\\n');
      fprintf('═══════════════════════════════════════\\n');
      fprintf('💰 Total Revenue: $%.2fK\\n', total_revenue/1000);
      fprintf('📈 Monthly Average: $%.2fK\\n', avg_monthly/1000);
      fprintf('📊 YoY Growth: %.1f%%\\n', growth_rate);
      fprintf('🌟 Best Month: %s\\n', best_month);
      fprintf('📉 Worst Month: %s\\n', worst_month);
      fprintf('\\n');
      fprintf('😊 Avg Satisfaction: %.2f/5\\n', avg_satisfaction);
      fprintf('📊 Satisfaction Std: %.2f\\n', satisfaction_std);
      fprintf('✅ %% Satisfied (≥4): %.1f%%\\n', pct_satisfied);
    `);
    console.log(metricsResult.output);

    // Step 3: Generate dashboard plots
    console.log('3️⃣ Generating Dashboard Plots');
    console.log('─'.repeat(50));

    // Sales trend chart
    const salesTrend = join(outputDir, 'sales_trend.png');
    await Matlab.saveFigure(
      `
      rng(42);
      base_sales = [150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 320];
      monthly_sales = base_sales + randn(1, 12) * 20;
      months = 1:12;
      month_names = {'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', ...
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'};
      
      figure('Position', [100, 100, 900, 500]);
      
      % Plot with area fill
      fill([months fliplr(months)], [monthly_sales*0.9 fliplr(monthly_sales*1.1)], ...
           [0.8 0.9 1], 'EdgeColor', 'none', 'FaceAlpha', 0.3);
      hold on;
      plot(months, monthly_sales, 'b-o', 'LineWidth', 2, 'MarkerSize', 8, ...
           'MarkerFaceColor', 'b');
      
      % Trend line
      p = polyfit(months, monthly_sales, 1);
      trend = polyval(p, months);
      plot(months, trend, 'r--', 'LineWidth', 2);
      
      hold off;
      
      xlabel('Month', 'FontSize', 12);
      ylabel('Sales ($K)', 'FontSize', 12);
      title('Monthly Sales Trend - 2024', 'FontSize', 14, 'FontWeight', 'bold');
      set(gca, 'XTick', months, 'XTickLabel', month_names);
      legend('Confidence Band', 'Actual Sales', 'Trend', 'Location', 'northwest');
      grid on;
      ylim([100, 380]);
    `,
      salesTrend,
      { format: 'png', resolution: 200, width: 900, height: 500 }
    );
    console.log(`✅ Sales trend: ${salesTrend}`);

    // Category breakdown pie chart
    const categoryPie = join(outputDir, 'category_breakdown.png');
    await Matlab.saveFigure(
      `
      categories = {'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'};
      category_sales = [450, 320, 280, 210, 140];
      colors = [0.2 0.6 0.9; 0.9 0.4 0.4; 0.4 0.8 0.4; 0.9 0.7 0.3; 0.7 0.5 0.8];
      
      figure('Position', [100, 100, 700, 500]);
      
      explode = [1, 0, 0, 0, 0];  % Explode Electronics
      p = pie(category_sales, explode);
      
      % Customize colors
      for i = 1:length(category_sales)
        p(2*i-1).FaceColor = colors(i,:);
        p(2*i-1).EdgeColor = 'white';
        p(2*i-1).LineWidth = 2;
      end
      
      % Custom legend with percentages
      total = sum(category_sales);
      legend_labels = cellfun(@(c, v) sprintf('%s (%.1f%%)', c, v/total*100), ...
                              categories, num2cell(category_sales), 'UniformOutput', false);
      legend(legend_labels, 'Location', 'eastoutside', 'FontSize', 10);
      
      title('Sales by Category - 2024', 'FontSize', 14, 'FontWeight', 'bold');
    `,
      categoryPie,
      { format: 'png', resolution: 200, width: 700, height: 500 }
    );
    console.log(`✅ Category breakdown: ${categoryPie}`);

    // Regional comparison bar chart
    const regionalBar = join(outputDir, 'regional_comparison.png');
    await Matlab.saveFigure(
      `
      regions = {'North', 'South', 'East', 'West'};
      regional_sales = [380, 290, 350, 280];
      targets = [350, 320, 330, 300];  % Target values
      
      figure('Position', [100, 100, 800, 500]);
      
      x = 1:length(regions);
      width = 0.35;
      
      bar(x - width/2, regional_sales, width, 'FaceColor', [0.2 0.6 0.8], 'EdgeColor', 'none');
      hold on;
      bar(x + width/2, targets, width, 'FaceColor', [0.8 0.4 0.4], 'EdgeColor', 'none');
      
      % Add value labels
      for i = 1:length(regions)
        text(x(i) - width/2, regional_sales(i) + 10, sprintf('$%dK', regional_sales(i)), ...
             'HorizontalAlignment', 'center', 'FontWeight', 'bold');
      end
      
      hold off;
      
      xlabel('Region', 'FontSize', 12);
      ylabel('Sales ($K)', 'FontSize', 12);
      title('Regional Sales vs Targets', 'FontSize', 14, 'FontWeight', 'bold');
      set(gca, 'XTick', x, 'XTickLabel', regions);
      legend('Actual', 'Target', 'Location', 'northeast');
      grid on;
    `,
      regionalBar,
      { format: 'png', resolution: 200, width: 800, height: 500 }
    );
    console.log(`✅ Regional comparison: ${regionalBar}`);

    // Customer satisfaction histogram
    const satisfactionHist = join(outputDir, 'satisfaction_distribution.png');
    await Matlab.saveFigure(
      `
      rng(42);
      satisfaction_scores = 3 + 1.5*rand(500, 1);
      
      figure('Position', [100, 100, 800, 500]);
      
      histogram(satisfaction_scores, 20, 'FaceColor', [0.4 0.7 0.4], ...
                'EdgeColor', 'white', 'LineWidth', 1.5);
      
      hold on;
      
      % Add mean line
      avg = mean(satisfaction_scores);
      yl = ylim;
      plot([avg avg], yl, 'r-', 'LineWidth', 2);
      text(avg + 0.05, yl(2)*0.9, sprintf('Mean: %.2f', avg), ...
           'Color', 'r', 'FontWeight', 'bold', 'FontSize', 11);
      
      % Add threshold line
      plot([4 4], yl, 'b--', 'LineWidth', 1.5);
      text(4.05, yl(2)*0.8, 'Satisfied threshold', 'Color', 'b', 'FontSize', 10);
      
      hold off;
      
      xlabel('Satisfaction Score', 'FontSize', 12);
      ylabel('Number of Customers', 'FontSize', 12);
      title('Customer Satisfaction Distribution', 'FontSize', 14, 'FontWeight', 'bold');
      xlim([1 5]);
      grid on;
    `,
      satisfactionHist,
      { format: 'png', resolution: 200, width: 800, height: 500 }
    );
    console.log(`✅ Satisfaction distribution: ${satisfactionHist}`);

    // Dashboard summary (combined)
    const dashboardSummary = join(outputDir, 'dashboard_summary.png');
    await Matlab.saveFigure(
      `
      rng(42);
      base_sales = [150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 320];
      monthly_sales = base_sales + randn(1, 12) * 20;
      category_sales = [450, 320, 280, 210, 140];
      regional_sales = [380, 290, 350, 280];
      satisfaction_scores = 3 + 1.5*rand(500, 1);
      
      figure('Position', [100, 100, 1400, 900]);
      
      % Sales Trend
      subplot(2, 2, 1);
      months = 1:12;
      plot(months, monthly_sales, 'b-o', 'LineWidth', 2, 'MarkerFaceColor', 'b');
      hold on;
      p = polyfit(months, monthly_sales, 1);
      plot(months, polyval(p, months), 'r--', 'LineWidth', 1.5);
      hold off;
      xlabel('Month'); ylabel('Sales ($K)');
      title('Monthly Sales Trend', 'FontWeight', 'bold');
      grid on;
      
      % Category Pie
      subplot(2, 2, 2);
      pie(category_sales);
      title('Sales by Category', 'FontWeight', 'bold');
      legend({'Electronics', 'Clothing', 'Home', 'Sports', 'Books'}, 'Location', 'eastoutside');
      
      % Regional Bar
      subplot(2, 2, 3);
      bar(regional_sales, 'FaceColor', [0.3 0.6 0.8]);
      set(gca, 'XTickLabel', {'North', 'South', 'East', 'West'});
      xlabel('Region'); ylabel('Sales ($K)');
      title('Regional Sales', 'FontWeight', 'bold');
      grid on;
      
      % Satisfaction Histogram
      subplot(2, 2, 4);
      histogram(satisfaction_scores, 15, 'FaceColor', [0.5 0.7 0.5]);
      hold on;
      plot([mean(satisfaction_scores) mean(satisfaction_scores)], ylim, 'r-', 'LineWidth', 2);
      hold off;
      xlabel('Score'); ylabel('Count');
      title('Customer Satisfaction', 'FontWeight', 'bold');
      grid on;
      
      sgtitle('Business Analytics Dashboard - 2024', 'FontSize', 16, 'FontWeight', 'bold');
    `,
      dashboardSummary,
      { format: 'png', resolution: 200, width: 1400, height: 900 }
    );
    console.log(`✅ Dashboard summary: ${dashboardSummary}`);

    // Step 4: Export data
    console.log('\n4️⃣ Exporting Dashboard Data');
    console.log('─'.repeat(50));

    const dataPath = join(outputDir, 'dashboard_data.json');
    await Matlab.exportToJSON(
      `
      rng(42);
      base_sales = [150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 320];
      monthly_sales = base_sales + randn(1, 12) * 20;
      
      dashboard.period = '2024';
      dashboard.generated_at = datestr(now, 'yyyy-mm-dd HH:MM:SS');
      
      dashboard.sales.monthly = monthly_sales;
      dashboard.sales.total = sum(monthly_sales);
      dashboard.sales.average = mean(monthly_sales);
      dashboard.sales.growth_pct = (monthly_sales(end) - monthly_sales(1)) / monthly_sales(1) * 100;
      
      dashboard.categories.names = {'Electronics', 'Clothing', 'Home', 'Sports', 'Books'};
      dashboard.categories.values = [450, 320, 280, 210, 140];
      
      dashboard.regions.names = {'North', 'South', 'East', 'West'};
      dashboard.regions.values = [380, 290, 350, 280];
      
      satisfaction_scores = 3 + 1.5*rand(500, 1);
      dashboard.satisfaction.mean = mean(satisfaction_scores);
      dashboard.satisfaction.std = std(satisfaction_scores);
      dashboard.satisfaction.pct_satisfied = sum(satisfaction_scores >= 4) / length(satisfaction_scores) * 100;
    `,
      dataPath,
      ['dashboard']
    );
    console.log(`✅ Dashboard data: ${dataPath}`);

    // Generate HTML report
    const htmlReport = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Analytics Dashboard - 2024</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; }
        h1 { color: #333; text-align: center; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .card { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
        .card img { width: 100%; height: auto; }
        .full-width { grid-column: span 2; }
        .footer { text-align: center; margin-top: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Business Analytics Dashboard - 2024</h1>
        
        <div class="grid">
            <div class="card full-width">
                <img src="dashboard_summary.png" alt="Dashboard Summary">
            </div>
            <div class="card">
                <img src="sales_trend.png" alt="Sales Trend">
            </div>
            <div class="card">
                <img src="category_breakdown.png" alt="Category Breakdown">
            </div>
            <div class="card">
                <img src="regional_comparison.png" alt="Regional Comparison">
            </div>
            <div class="card">
                <img src="satisfaction_distribution.png" alt="Customer Satisfaction">
            </div>
        </div>
        
        <div class="footer">
            <p>Generated by node-matlab | ${new Date().toISOString()}</p>
        </div>
    </div>
</body>
</html>`;

    await writeFile(join(outputDir, 'dashboard.html'), htmlReport);
    console.log(`✅ HTML report: ${join(outputDir, 'dashboard.html')}`);

    console.log(`\n📁 All outputs saved to: ${outputDir}`);
  } finally {
    if (session.isRunning) {
      await session.stop();
    }
  }

  console.log('\n✅ Data visualization dashboard completed!');
}

main();
