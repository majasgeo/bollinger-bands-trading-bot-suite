import axios from 'axios';
import crypto from 'crypto';

export interface MEXCConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  isTestnet?: boolean;
}

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
}

export interface Order {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  quantity: number;
  price?: number;
  leverage?: number;
}

export interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  leverage: number;
}

export class MEXCConnector {
  private config: MEXCConfig;
  private baseUrl: string;

  constructor(config: MEXCConfig) {
    this.config = config;
    this.baseUrl = config.isTestnet 
      ? 'https://contract.mexc.com/api/v1' 
      : 'https://contract.mexc.com/api/v1';
  }

  private generateSignature(params: string): string {
    return crypto
      .createHmac('sha256', this.config.apiSecret)
      .update(params)
      .digest('hex');
  }

  private async makeRequest(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    params: any = {}
  ): Promise<any> {
    const timestamp = Date.now();
    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    const signatureString = `${timestamp}${this.config.apiKey}${queryString}`;
    const signature = this.generateSignature(signatureString);

    const headers = {
      'Content-Type': 'application/json',
      'ApiKey': this.config.apiKey,
      'Request-Time': timestamp.toString(),
      'Signature': signature
    };

    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers,
        params: method === 'GET' ? params : undefined,
        data: method !== 'GET' ? params : undefined
      });

      return response.data;
    } catch (error: any) {
      console.error('MEXC API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Market Data Methods
  async getKlines(symbol: string, interval: string, limit: number = 100): Promise<any[]> {
    return await this.makeRequest('GET', '/contract/kline', {
      symbol,
      interval,
      limit
    });
  }

  async getTickerPrice(symbol: string): Promise<number> {
    const response = await this.makeRequest('GET', '/contract/ticker', {
      symbol
    });
    return parseFloat(response.data.lastPrice);
  }

  async getOrderBook(symbol: string, limit: number = 20): Promise<any> {
    return await this.makeRequest('GET', '/contract/depth', {
      symbol,
      limit
    });
  }

  // Account Methods
  async getAccountInfo(): Promise<any> {
    return await this.makeRequest('GET', '/private/account/assets');
  }

  async getPosition(symbol: string): Promise<Position | null> {
    const response = await this.makeRequest('GET', '/private/position', {
      symbol
    });
    
    if (!response.data || response.data.length === 0) {
      return null;
    }

    const pos = response.data[0];
    return {
      symbol: pos.symbol,
      side: pos.positionSide,
      size: parseFloat(pos.positionSize),
      entryPrice: parseFloat(pos.entryPrice),
      markPrice: parseFloat(pos.markPrice),
      pnl: parseFloat(pos.unrealizedPnl),
      leverage: pos.leverage
    };
  }

  // Trading Methods
  async setLeverage(symbol: string, leverage: number): Promise<void> {
    await this.makeRequest('POST', '/private/position/change_leverage', {
      symbol,
      leverage
    });
  }

  async placeOrder(order: Order): Promise<any> {
    const params: any = {
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      vol: order.quantity
    };

    if (order.type === 'LIMIT' && order.price) {
      params.price = order.price;
    }

    if (order.leverage) {
      await this.setLeverage(order.symbol, order.leverage);
    }

    return await this.makeRequest('POST', '/private/order/submit', params);
  }

  async cancelOrder(symbol: string, orderId: string): Promise<void> {
    await this.makeRequest('DELETE', '/private/order/cancel', {
      symbol,
      orderId
    });
  }

  async closePosition(symbol: string): Promise<any> {
    const position = await this.getPosition(symbol);
    if (!position) {
      throw new Error('No position to close');
    }

    const order: Order = {
      symbol,
      side: position.side === 'LONG' ? 'SELL' : 'BUY',
      type: 'MARKET',
      quantity: position.size
    };

    return await this.placeOrder(order);
  }

  // WebSocket Methods for Real-time Data
  connectWebSocket(onMessage: (data: any) => void): WebSocket {
    const wsUrl = this.config.isTestnet 
      ? 'wss://contract.mexc.com/ws' 
      : 'wss://contract.mexc.com/ws';

    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      console.log('MEXC WebSocket connected');
      // Subscribe to BTCUSDT.P ticker
      ws.send(JSON.stringify({
        method: 'sub.ticker',
        param: {
          symbol: 'BTCUSDT'
        }
      }));
    });

    ws.on('message', (data: string) => {
      const message = JSON.parse(data);
      onMessage(message);
    });

    ws.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
      console.log('WebSocket disconnected');
      // Implement reconnection logic here
    });

    return ws;
  }
}