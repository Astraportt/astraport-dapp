import axios from 'axios';
import { Portfolio, RiskScore, AIInsight } from '@/types';

const mockGet = jest.fn();

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: (...args: any[]) => mockGet(...args),
  })),
}));

// Import after jest.mock to ensure apiClient is initialized with mock
import { PortfolioService } from '@/services/portfolio';

describe('PortfolioService', () => {
  const mockPublicKey = 'GBVOL6ZZPZ6X7R2B6U2Q5M4X7Q3B6U2Q5M4X7Q3B6U2Q5M4X7Q3B6U2Q';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPortfolio', () => {
    const mockPortfolioData: Portfolio = {
      totalBalance: '15420.50',
      baseCurrency: 'USD',
      assets: [
        {
          code: 'XLM',
          issuer: 'native',
          balance: '12500.00',
          native: true,
        },
        {
          code: 'USDC',
          issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
          balance: '2920.50',
          native: false,
        },
      ],
      lastUpdated: 1727800000000,
    };

    it('successfully fetches portfolio with correct endpoint URL', async () => {
      mockGet.mockResolvedValueOnce({ data: mockPortfolioData });

      const result = await PortfolioService.getPortfolio(mockPublicKey);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(`/portfolio/${mockPublicKey}`);
      expect(result).toEqual(mockPortfolioData);
    });

    it('throws formatted error on 404 Not Found response', async () => {
      const error404 = new Error('Request failed with status code 404');
      mockGet.mockRejectedValueOnce(error404);

      await expect(PortfolioService.getPortfolio(mockPublicKey)).rejects.toThrow(
        `Failed to fetch portfolio: ${error404}`
      );
      expect(mockGet).toHaveBeenCalledWith(`/portfolio/${mockPublicKey}`);
    });

    it('throws formatted error on 500 Server Error response', async () => {
      const error500 = new Error('Request failed with status code 500');
      mockGet.mockRejectedValueOnce(error500);

      await expect(PortfolioService.getPortfolio(mockPublicKey)).rejects.toThrow(
        `Failed to fetch portfolio: ${error500}`
      );
    });

    it('throws formatted error on network disconnection failure', async () => {
      const networkError = new Error('Network Error');
      mockGet.mockRejectedValueOnce(networkError);

      await expect(PortfolioService.getPortfolio(mockPublicKey)).rejects.toThrow(
        `Failed to fetch portfolio: ${networkError}`
      );
    });

    it('throws formatted error on request timeout', async () => {
      const timeoutError = new Error('timeout of 10000ms exceeded');
      mockGet.mockRejectedValueOnce(timeoutError);

      await expect(PortfolioService.getPortfolio(mockPublicKey)).rejects.toThrow(
        `Failed to fetch portfolio: ${timeoutError}`
      );
    });
  });

  describe('getRiskScore', () => {
    const mockRiskData: RiskScore = {
      overall: 42,
      volatility: 35,
      concentration: 60,
      counterpartyRisk: 25,
    };

    it('successfully fetches risk score with correct endpoint URL', async () => {
      mockGet.mockResolvedValueOnce({ data: mockRiskData });

      const result = await PortfolioService.getRiskScore(mockPublicKey);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(`/risk/${mockPublicKey}`);
      expect(result).toEqual(mockRiskData);
    });

    it('throws formatted error on client 400 Bad Request error', async () => {
      const error400 = new Error('Invalid public key format');
      mockGet.mockRejectedValueOnce(error400);

      await expect(PortfolioService.getRiskScore(mockPublicKey)).rejects.toThrow(
        `Failed to fetch risk score: ${error400}`
      );
      expect(mockGet).toHaveBeenCalledWith(`/risk/${mockPublicKey}`);
    });

    it('throws formatted error on 503 Service Unavailable', async () => {
      const error503 = new Error('Risk assessment service unavailable');
      mockGet.mockRejectedValueOnce(error503);

      await expect(PortfolioService.getRiskScore(mockPublicKey)).rejects.toThrow(
        `Failed to fetch risk score: ${error503}`
      );
    });

    it('throws formatted error on timeout', async () => {
      const timeoutError = new Error('timeout of 10000ms exceeded');
      mockGet.mockRejectedValueOnce(timeoutError);

      await expect(PortfolioService.getRiskScore(mockPublicKey)).rejects.toThrow(
        `Failed to fetch risk score: ${timeoutError}`
      );
    });
  });

  describe('getInsights', () => {
    const mockInsightsData: AIInsight[] = [
      {
        id: 'ins-1',
        title: 'High XLM Concentration',
        description: 'Over 80% of your portfolio is allocated in XLM. Consider rebalancing into USDC.',
        severity: 'high',
        action: 'Rebalance portfolio',
        timestamp: 1727800000000,
      },
      {
        id: 'ins-2',
        title: 'Yield Opportunity Detected',
        description: 'Lending pool yield for USDC increased to 8.2% APY.',
        severity: 'low',
        action: 'View lending rates',
        timestamp: 1727800050000,
      },
    ];

    it('successfully fetches AI insights with correct endpoint URL', async () => {
      mockGet.mockResolvedValueOnce({ data: mockInsightsData });

      const result = await PortfolioService.getInsights(mockPublicKey);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(`/insights/${mockPublicKey}`);
      expect(result).toEqual(mockInsightsData);
      expect(result).toHaveLength(2);
    });

    it('handles empty insights list cleanly', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });

      const result = await PortfolioService.getInsights(mockPublicKey);

      expect(mockGet).toHaveBeenCalledWith(`/insights/${mockPublicKey}`);
      expect(result).toEqual([]);
    });

    it('throws formatted error on 500 error when fetching insights', async () => {
      const error500 = new Error('AI analysis model failure');
      mockGet.mockRejectedValueOnce(error500);

      await expect(PortfolioService.getInsights(mockPublicKey)).rejects.toThrow(
        `Failed to fetch insights: ${error500}`
      );
    });

    it('throws formatted error on network connection reset', async () => {
      const networkError = new Error('ECONNRESET');
      mockGet.mockRejectedValueOnce(networkError);

      await expect(PortfolioService.getInsights(mockPublicKey)).rejects.toThrow(
        `Failed to fetch insights: ${networkError}`
      );
    });
  });
});
