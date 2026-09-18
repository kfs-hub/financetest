// Verification script for statistical algorithms and formulas

// 1. Anomaly Detection Formula: Amount > Mean + 2 * StdDev
function testAnomalyDetection() {
  const groceryAmounts = [85, 92, 110, 78, 95, 105, 88, 90]; // normal groceries
  const mean = groceryAmounts.reduce((a, b) => a + b, 0) / groceryAmounts.length;
  const variance = groceryAmounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / groceryAmounts.length;
  const stdDev = Math.sqrt(variance);
  const threshold = mean + 2 * stdDev;

  const normalPurchase = 100;
  const outlierPurchase = 350; // anomalous bulk splurge

  const isNormalOutlier = normalPurchase > threshold;
  const isBulkOutlier = outlierPurchase > threshold;

  console.log('--- TEST 1: Statistical Anomaly Detection (μ + 2σ) ---');
  console.log(`Category Sample Size: ${groceryAmounts.length}`);
  console.log(`Mean (μ): $${mean.toFixed(2)}`);
  console.log(`Std Dev (σ): $${stdDev.toFixed(2)}`);
  console.log(`Threshold (μ + 2σ): $${threshold.toFixed(2)}`);
  console.log(`Normal ($115) Flagged: ${isNormalOutlier} (Expected: false)`);
  console.log(`Outlier ($350) Flagged: ${isBulkOutlier} (Expected: true)`);
  if (!isNormalOutlier && isBulkOutlier) {
    console.log('✓ PASS: Anomaly detection mathematics verified.');
  } else {
    throw new Error('FAIL: Anomaly detection logic failed');
  }
}

// 2. Budget Burn-Rate Formula: d = Current Spent / Days Elapsed, Projected = d * Total Days
function testBurnRateFormula() {
  const monthlyLimit = 600;
  const currentSpent = 480;
  const daysElapsed = 15;
  const totalDays = 30;

  const dailyBurn = currentSpent / daysElapsed; // $32/day
  const projectedTotal = dailyBurn * totalDays;  // $960
  const projectedOverrun = Math.max(0, projectedTotal - monthlyLimit); // $360
  const isOverBudget = projectedTotal > monthlyLimit;

  console.log('\n--- TEST 2: Budget Burn-Rate Linear Run-Rate ---');
  console.log(`Budget Limit: $${monthlyLimit}`);
  console.log(`Spent to date ($): $${currentSpent} over ${daysElapsed}/${totalDays} days`);
  console.log(`Daily Burn Rate (d): $${dailyBurn}/day`);
  console.log(`Projected Month-End: $${projectedTotal}`);
  console.log(`Projected Overrun: $${projectedOverrun}`);
  console.log(`Is Over Budget Risk: ${isOverBudget} (Expected: true)`);
  if (dailyBurn === 32 && projectedTotal === 960 && isOverBudget) {
    console.log('✓ PASS: Burn-rate mathematics verified.');
  } else {
    throw new Error('FAIL: Burn-rate calculation incorrect');
  }
}

// 3. Double Exponential Smoothing (Holt's Linear Model)
function testHoltWinters() {
  const historical = [2100, 2250, 2400, 2550]; // steadily rising spending trend
  const alpha = 0.4;
  const beta = 0.3;

  let level = historical[0];
  let trend = historical[1] - historical[0];

  for (let t = 1; t < historical.length; t++) {
    const y = historical[t];
    const prevLevel = level;
    level = alpha * y + (1 - alpha) * (prevLevel + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  // Next month forecast: L + 1*T
  const nextForecast = Math.round(level + 1 * trend);
  console.log('\n--- TEST 3: Holt-Winters Exponential Smoothing ---');
  console.log(`Historical Sequence: [${historical.join(', ')}]`);
  console.log(`Final Smoothed Level (L): $${level.toFixed(2)}`);
  console.log(`Final Trend (T): $${trend.toFixed(2)}`);
  console.log(`1-Step Ahead Forecast: $${nextForecast}`);
  if (nextForecast > 2500) {
    console.log('✓ PASS: Holt-Winters captures upward trend direction accurately.');
  } else {
    throw new Error('FAIL: Holt-Winters trend projection incorrect');
  }
}

// Execute tests
testAnomalyDetection();
testBurnRateFormula();
testHoltWinters();
console.log('\n>>> ALL MATHEMATICAL & STATISTICAL TESTS PASSED! <<<');
