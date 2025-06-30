import React, { useState, useCallback } from 'react';
import { Activity, BarChart3 } from 'lucide-react';
import { ConfigPanel } from './components/ConfigPanel';
import { DataSourcePanel } from './components/DataSourcePanel';
import { Chart } from './components/Chart';
import { MetricsPanel } from './components/MetricsPanel';
import { OptimizationPanel } from './components/OptimizationPanel';
import { OptimizationResults } from './components/OptimizationResults';
import { Candle, BollingerBands, BacktestResult, TradingConfig, OptimizationResult, OptimizationProgress, OptimizationFilters } from './types/trading';
import { calculateBollingerBands } from './utils/bollingerBands';
import { Backtester } from './utils/backtester';
import { StrategyOptimizer } from './utils/optimizer';
import { generateSampleCSV, parseCSVToCandles } from './utils/csvParser';

function App() {
  // State management
  const [candles, setCandles] = useState<Candle[]>([]);
  const [dataSource, setDataSource] = useState<string>('No data loaded');
  const [config, setConfig] = useState<TradingConfig>({
    period: 20,
    stdDev: 2,
    offset: 0,
    maxLeverage: 10,
    initialCapital: 10000,
    enableLongPositions: true,
    enableShortPositions: true
  });
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([]);
  const [optimizationProgress, setOptimizationProgress] = useState<OptimizationProgress | null>(null);
  const [isRunningBacktest, setIsRunningBacktest] = useState(false);
  const [bands, setBands] = useState<BollingerBands[]>([]);

  // Load initial data
  React.useEffect(() => {
    const csvContent = generateSampleCSV();
    const result = parseCSVToCandles(csvContent);
    if (result.success && result.data) {
      setCandles(result.data);
      setDataSource('Generated sample data (hourly)');
    }
  }, []);

  // Handle data loading
  const handleDataLoaded = useCallback((newCandles: Candle[], source: string) => {
    setCandles(newCandles);
    setDataSource(source);
    setBacktestResult(null);
    setOptimizationResults([]);
  }, []);

  // Run backtest
  const handleRunBacktest = useCallback(async () => {
    if (candles.length === 0) return;

    setIsRunningBacktest(true);
    
    try {
      // Calculate Bollinger Bands
      const calculatedBands = calculateBollingerBands(
        candles,
        config.period,
        config.stdDev,
        config.offset
      );
      setBands(calculatedBands);

      // Run backtest
      const backtester = new Backtester(config);
      const result = backtester.backtest(candles, calculatedBands);
      
      setBacktestResult(result);
    } catch (error) {
      console.error('Backtest failed:', error);
    } finally {
      setIsRunningBacktest(false);
    }
  }, [candles, config]);

  // Handle optimization
  const handleStartOptimization = useCallback(async (filters?: OptimizationFilters): Promise<OptimizationResult[]> => {
    if (candles.length === 0) return [];

    const optimizer = new StrategyOptimizer(
      candles,
      config,
      (progress) => setOptimizationProgress(progress)
    );

    const results = await optimizer.optimizeAllCombinations(filters);
    setOptimizationResults(results);
    
    return results;
  }, [candles, config]);

  // Handle optimization complete
  const handleOptimizationComplete = useCallback((bestConfig: TradingConfig, results: OptimizationResult[]) => {
    setConfig(bestConfig);
    setOptimizationResults(results);
    
    // Run backtest with best config
    handleRunBacktest();
  }, [handleRunBacktest]);

  // Handle selecting optimization result
  const handleSelectOptimizationResult = useCallback((result: OptimizationResult) => {
    const newConfig: TradingConfig = {
      ...config,
      period: result.period,
      stdDev: result.stdDev,
      offset: result.offset,
      maxLeverage: result.leverage
    };
    setConfig(newConfig);
    
    // Auto-run backtest with selected config
    setTimeout(() => {
      handleRunBacktest();
    }, 100);
  }, [config, handleRunBacktest]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bollinger Bands Trading Bot Suite
              </h1>
              <p className="text-sm text-gray-600">Advanced backtesting and optimization platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Data Source Panel */}
          <div className="lg:col-span-1">
            <DataSourcePanel
              onDataLoaded={handleDataLoaded}
              currentDataSource={dataSource}
              candleCount={candles.length}
            />
          </div>

          {/* Config Panel */}
          <div className="lg:col-span-1">
            <ConfigPanel
              config={config}
              onConfigChange={setConfig}
              onRunBacktest={handleRunBacktest}
              isRunning={isRunningBacktest}
            />
          </div>

          {/* Optimization Panel */}
          <div className="lg:col-span-1">
            <OptimizationPanel
              config={config}
              onOptimizationComplete={handleOptimizationComplete}
              onStartOptimization={handleStartOptimization}
              progress={optimizationProgress}
            />
          </div>
        </div>

        {/* Chart and Metrics */}
        {candles.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="mr-2 h-6 w-6 text-blue-600" />
                Price Chart with Bollinger Bands
              </h3>
              <Chart
                candles={candles}
                bands={bands}
                trades={backtestResult?.trades || []}
                width={600}
                height={400}
              />
            </div>

            {/* Metrics Panel */}
            {backtestResult && (
              <MetricsPanel
                results={backtestResult}
                isRunning={isRunningBacktest}
                initialCapital={config.initialCapital}
              />
            )}
          </div>
        )}

        {/* Optimization Results */}
        {optimizationResults.length > 0 && (
          <OptimizationResults
            results={optimizationResults}
            onSelectConfiguration={handleSelectOptimizationResult}
          />
        )}

        {/* Info Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">How to Use This Platform</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">1. Load Your Data</h4>
              <p className="text-sm text-gray-600">
                Upload a CSV file with price data or use the sample data. The system automatically detects
                timeframes from seconds to daily data.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">2. Configure & Backtest</h4>
              <p className="text-sm text-gray-600">
                Adjust Bollinger Bands parameters and leverage. Enable long/short positions and run backtests
                to see performance metrics.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">3. Optimize Parameters</h4>
              <p className="text-sm text-gray-600">
                Use the auto-optimization to test thousands of parameter combinations and find the best
                performing strategies for your data.
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Disclaimer:</strong> This is a backtesting tool for educational purposes. Past performance
              does not guarantee future results. Trading involves risk and may result in losses.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;