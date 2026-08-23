import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmergencyUnstakeModal } from '@/components/staking/emergency/EmergencyUnstakeModal';
import { useStakingStore } from '@/store';
import { StakingPortfolio } from '@/types/staking';

// Chart.js needs a real canvas; stub the chart out for jsdom.
jest.mock('@/components/staking/emergency/PenaltyDecayChart', () => ({
  PenaltyDecayChart: () => (
    <div data-testid="penalty-decay-chart">chart-stub</div>
  ),
}));

const getHistory = jest.fn();
const execute = jest.fn();

jest.mock('@/services/emergencyUnstake', () => ({
  EmergencyUnstakeService: {
    isEligible: jest.requireActual(
      '@/services/emergencyUnstake'
    ).EmergencyUnstakeService.isEligible,
    quoteLocally: jest.requireActual(
      '@/services/emergencyUnstake'
    ).EmergencyUnstakeService.quoteLocally,
    getHistory: (...args: unknown[]) => getHistory(...args),
    execute: (...args: unknown[]) => execute(...args),
  },
}));

const DAY = 24 * 60 * 60 * 1000;

const portfolio: StakingPortfolio = {
  totalValue: 5000,
  baseCurrency: 'USD',
  averageApy: 8,
  totalRewards: 120,
  aggregateYield: 1.1,
  lastUpdated: Date.now(),
  change24h: 0.4,
  change7d: 2.1,
  positions: [
    {
      id: 'pos-locked',
      code: 'XLM',
      issuer: 'native',
      amount: '1000',
      apy: 5.2,
      yieldRate: 5.2 / 365,
      startDate: Date.now() - 10 * DAY,
      lockupDate: Date.now() + 80 * DAY,
      currentValue: 500,
      rewardsEarned: '12.5',
      status: 'active',
    },
    {
      // Already unlocked → NOT eligible for the emergency flow.
      id: 'pos-unlocked',
      code: 'USDC',
      issuer: 'GA5Z',
      amount: '500',
      apy: 8.1,
      yieldRate: 8.1 / 365,
      startDate: Date.now() - 200 * DAY,
      lockupDate: Date.now() - 20 * DAY,
      currentValue: 250,
      rewardsEarned: '9.9',
      status: 'active',
    },
  ],
};

describe('EmergencyUnstakeModal (integration)', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useStakingStore.setState({ stakingPortfolio: portfolio });
    getHistory.mockResolvedValue([]);
    execute.mockResolvedValue({
      txHash: 'abc123',
      status: 'completed',
    });
  });

  const renderModal = () =>
    render(<EmergencyUnstakeModal open onClose={() => {}} publicKey="GUSER" />);

  it('lists only locked positions as eligible and shows the real-time penalty preview', async () => {
    renderModal();

    await waitFor(() =>
      expect(screen.getByTestId('penalty-preview-tab')).toBeInTheDocument()
    );

    // The unlocked USDC position must not appear in the selector.
    fireEvent.click(screen.getByRole('tab', { name: 'Position' }));
    const selector = await screen.findByLabelText('Select staked position');
    expect(selector).toHaveTextContent('XLM');
    expect(screen.queryByRole('option', { name: /USDC/ })).not.toBeInTheDocument();

    // Back to the live preview to type an amount.
    fireEvent.click(screen.getByRole('tab', { name: 'Penalty Preview' }));

    // Type an amount → live metrics update without any button press.
    fireEvent.change(screen.getByTestId('withdrawal-amount'), {
      target: { value: '100' },
    });

    await waitFor(() =>
      expect(screen.getByTestId('net-proceeds')).toBeInTheDocument()
    );
    // ~10% of lock-up elapsed ⇒ penalty ≈ 9% of $50 gross = $4.50 net $45.50
    const net = screen.getByTestId('net-proceeds').textContent ?? '';
    expect(net.replace(/[^0-9.]/g, '')).toMatch(/^45\./);

    // Side-by-side comparison present with the "wait longer" callout.
    expect(screen.getByTestId('penalty-comparison')).toBeInTheDocument();
    expect(screen.getByText(/Normal Unstake/i)).toBeInTheDocument();
    expect(screen.getByText(/more$/i)).toBeInTheDocument();
  });

  it('validates amounts: rejects over-balance and non-numeric input', async () => {
    renderModal();

    const input = screen.getByTestId('withdrawal-amount');

    fireEvent.change(input, { target: { value: '2000' } }); // > 1000 staked
    expect(screen.getByText(/exceeds your staked balance/i)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '12ab' } });
    expect(screen.getByText(/Enter a valid number/i)).toBeInTheDocument();

    // Review button stays disabled for invalid input.
    expect(screen.getByTestId('review-emergency-unstake')).toBeDisabled();
  });

  it('walks through confirmation showing final amounts before execution', async () => {
    renderModal();

    fireEvent.change(screen.getByTestId('withdrawal-amount'), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByTestId('review-emergency-unstake'));

    const panel = await screen.findByTestId('confirmation-panel');
    expect(panel).toHaveTextContent(/Confirm emergency withdrawal/i);
    expect(panel).toHaveTextContent(/Withdrawal amount/);
    expect(panel).toHaveTextContent(/You will receive/);

    fireEvent.click(screen.getByTestId('confirm-emergency-unstake'));

    await waitFor(() =>
      expect(execute).toHaveBeenCalledWith(
        'GUSER',
        'pos-locked',
        100,
      )
    );
    expect(await screen.findByTestId('success-panel')).toHaveTextContent(
      /submitted successfully/i
    );
    // History refreshes after execution.
    expect(getHistory).toHaveBeenCalled();
  });

  it('shows execution errors and returns to the form step', async () => {
    execute.mockRejectedValue(new Error('ledger rejected transaction'));
    renderModal();

    fireEvent.change(screen.getByTestId('withdrawal-amount'), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByTestId('review-emergency-unstake'));
    fireEvent.click(await screen.findByTestId('confirm-emergency-unstake'));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        /ledger rejected transaction/i
      )
    );
    // Back on the form so the user can retry or cancel.
    expect(screen.getByTestId('review-emergency-unstake')).toBeInTheDocument();
  });

  it('renders history records with status filtering', async () => {
    getHistory.mockResolvedValue([
      {
        id: 'eu-1',
        positionId: 'pos-locked',
        assetCode: 'XLM',
        amount: '100.00',
        penaltyAmount: '9.00',
        netAmount: '91.00',
        status: 'completed',
        txHash: 'a'.repeat(64),
        timestamp: Date.now() - 2 * DAY,
      },
      {
        id: 'eu-2',
        positionId: 'pos-locked',
        assetCode: 'XLM',
        amount: '50.00',
        penaltyAmount: '4.50',
        netAmount: '45.50',
        status: 'pending',
        timestamp: Date.now() - DAY,
      },
    ]);

    renderModal();
    fireEvent.click(screen.getByRole('tab', { name: 'History' }));

    await waitFor(() =>
      expect(screen.getByTestId('unstake-history')).toBeInTheDocument()
    );
    // Wait for the fetched rows to render before filtering.
    expect(await screen.findByText('completed')).toBeInTheDocument();
    expect(screen.getByText('91')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/status/i), {
      target: { value: 'pending' },
    });
    await waitFor(() =>
      expect(screen.queryByText('91')).not.toBeInTheDocument()
    );
    expect(screen.getByText('45.5')).toBeInTheDocument();
  });

  it('explains when no positions are eligible', () => {
    useStakingStore.setState({
      stakingPortfolio: {
        ...portfolio,
        positions: portfolio.positions.slice(1), // only unlocked one
      },
    });
    renderModal();
    expect(
      screen.getByText(/None of your positions are eligible/i)
    ).toBeInTheDocument();
  });
});
