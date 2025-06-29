import React from 'react';
import { Activity } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Bollinger Bands Trading Bot Suite
            </h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome to Your Trading Bot Suite</h2>
          <p className="text-gray-600 mb-4">
            This application includes 6 different trading strategies with advanced backtesting 
            and optimization capabilities.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">✅ Bollinger Bands Bot</h3>
              <p className="text-sm text-gray-600">Classic breakout strategy</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">✅ Day Trading Bot</h3>
              <p className="text-sm text-gray-600">Multi-signal strategy</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">⚠️ Fibonacci Scalping Bot</h3>
              <p className="text-sm text-gray-600">Pure price action scalping</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">✅ Ultra-Fast Scalping Bot</h3>
              <p className="text-sm text-gray-600">Lightning-fast micro-scalping</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">✅ Enhanced Bollinger Bot</h3>
              <p className="text-sm text-gray-600">Advanced Bollinger with enhancements</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">❌ Bollinger + Fibonacci Hybrid</h3>
              <p className="text-sm text-gray-600">Hybrid strategy (needs fixes)</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is a starter template. Add your strategy implementations 
              in the src/utils folder and components in src/components folder.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;