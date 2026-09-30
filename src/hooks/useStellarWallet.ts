import { useCallback } from 'react';
import { useWalletStore } from '@/store';
import { StellarNetwork } from '@/types';
import {
  getAvailableWallets,
  connectWallet as walletKitConnect,
} from '@/services/walletKit';

export const useStellarWallet = () => {
  const { connected, account, disconnect, setLoading, setError } = useWalletStore();

  const connectWallet = useCallback(
    async (walletId: string, network: StellarNetwork) => {
      setLoading(true);
      setError(null);
      try {
        const result = await walletKitConnect(walletId, network);
        useWalletStore.getState().connect({
          publicKey: result.publicKey,
          accountId: result.publicKey,
          network: result.network,
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to connect wallet');
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError],
  );

  const connectFirstAvailable = useCallback(
    async (network: StellarNetwork) => {
      setLoading(true);
      setError(null);
      try {
        const wallets = await getAvailableWallets(network);
        const available = wallets.filter((w) => w.available);
        if (available.length === 0) {
          throw new Error('No wallets available. Please install a Stellar wallet extension.');
        }
        const chosen = available[0];
        const result = await walletKitConnect(chosen.id, network);
        useWalletStore.getState().connect({
          publicKey: result.publicKey,
          accountId: result.publicKey,
          network: result.network,
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to connect wallet');
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError],
  );

  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return {
    connected,
    account,
    connectWallet,
    connectFirstAvailable,
    disconnectWallet,
  };
};

export default useStellarWallet;
