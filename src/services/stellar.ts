import StellarSdk from 'stellar-sdk';

const STELLAR_NETWORK = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';
const NETWORK_PASSPHRASE = STELLAR_NETWORK === 'public'
  ? StellarSdk.Networks.PUBLIC_NETWORK_PASSPHRASE
  : StellarSdk.Networks.TESTNET_NETWORK_PASSPHRASE;

const HORIZON_URL = STELLAR_NETWORK === 'public'
  ? 'https://horizon.stellar.org'
  : 'https://horizon-testnet.stellar.org';

export interface AccountBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
  limit?: string;
  buying_liabilities?: string;
  selling_liabilities?: string;
}

export interface AccountDetails {
  publicKey: string;
  accountSequence: string;
  balances: AccountBalance[];
  subentryCount: number;
  thresholds: {
    low_threshold: number;
    med_threshold: number;
    high_threshold: number;
  };
  signers: {
    key: string;
    weight: number;
    type: string;
  }[];
  flags: {
    auth_required: boolean;
    auth_revocable: boolean;
    auth_immutable: boolean;
  };
  paging_token?: string;
  lastModifiedLedger?: number;
  lastModifiedTime?: string;
}

export class StellarService {
  static getNetworkPassphrase(): string {
    return NETWORK_PASSPHRASE;
  }

  static getHorizonUrl(): string {
    return HORIZON_URL;
  }

  static isValidPublicKey(key: string): boolean {
    // Stellar public keys start with 'G' and are 56 characters long
    return /^G[A-Z2-7]{55}$/.test(key);
  }

  static validateAccount(publicKey: string): boolean {
    return this.isValidPublicKey(publicKey);
  }

  /**
   * Create a Horizon server instance configured for the current network.
   */
  private static getServer(): StellarSdk.Horizon.Server {
    return new StellarSdk.Horizon.Server(HORIZON_URL, {
      allowHttp: false,
    });
  }

  /**
   * Fetch real account details from the Stellar Horizon server.
   *
   * Connects to the appropriate Horizon endpoint based on the
   * NEXT_PUBLIC_STELLAR_NETWORK environment variable and returns
   * typed account data including balances, sequence number, signers,
   * thresholds, and flags.
   *
   * @throws Error if the public key is invalid, the account is not found,
   *         or a network error occurs.
   */
  static async fetchAccountDetails(publicKey: string): Promise<AccountDetails> {
    if (!this.isValidPublicKey(publicKey)) {
      throw new Error('Invalid public key: must be a valid Stellar public key starting with G');
    }

    const server = this.getServer();

    try {
      const account = await server.loadAccount(publicKey);

      const balances: AccountBalance[] = account.balances.map((b) => ({
        asset_type: b.asset_type,
        asset_code: b.asset_code,
        asset_issuer: b.asset_issuer,
        balance: b.balance,
        limit: b.limit,
        buying_liabilities: b.buying_liabilities,
        selling_liabilities: b.selling_liabilities,
      }));

      return {
        publicKey,
        accountSequence: account.sequence,
        balances,
        subentryCount: account.subentry_count,
        thresholds: {
          low_threshold: account.thresholds.low_threshold,
          med_threshold: account.thresholds.med_threshold,
          high_threshold: account.thresholds.high_threshold,
        },
        signers: account.signers.map((s) => ({
          key: s.key,
          weight: s.weight,
          type: s.type,
        })),
        flags: {
          auth_required: account.flags.auth_required,
          auth_revocable: account.flags.auth_revocable,
          auth_immutable: account.flags.auth_immutable,
        },
        paging_token: account.paging_token,
        lastModifiedLedger: account.last_modified_ledger,
        lastModifiedTime: account.last_modified_time,
      };
    } catch (error) {
      if (error instanceof StellarSdk.NotFoundError) {
        throw new Error(
          `Account ${publicKey} not found on ${STELLAR_NETWORK}. The account may not be funded yet.`,
        );
      }
      if (error instanceof StellarSdk.NetworkError) {
        throw new Error(
          `Network error while connecting to Horizon: ${error.message}. Please check your connection and try again.`,
        );
      }
      if (error instanceof StellarSdk.BadResponseError) {
        throw new Error(
          `Horizon server returned an error: ${error.message}. The server may be rate-limiting requests.`,
        );
      }
      if (error instanceof Error) {
        throw new Error(`Failed to fetch account: ${error.message}`);
      }
      throw new Error('Failed to fetch account: unknown error');
    }
  }

  /**
   * Fetch transaction history for an account.
   */
  static async fetchTransactions(
    publicKey: string,
    options: { limit?: number; cursor?: string; order?: 'asc' | 'desc' } = {},
  ) {
    if (!this.isValidPublicKey(publicKey)) {
      throw new Error('Invalid public key');
    }

    const server = this.getServer();
    const { limit = 20, cursor, order = 'desc' } = options;

    try {
      let builder = server.transactions().forAccount(publicKey).limit(limit).order(order);
      if (cursor) {
        builder = builder.cursor(cursor);
      }
      const response = await builder.call();
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }
      throw new Error('Failed to fetch transactions: unknown error');
    }
  }

  /**
   * Fetch recent payments for an account.
   */
  static async fetchPayments(
    publicKey: string,
    options: { limit?: number; cursor?: string; order?: 'asc' | 'desc' } = {},
  ) {
    if (!this.isValidPublicKey(publicKey)) {
      throw new Error('Invalid public key');
    }

    const server = this.getServer();
    const { limit = 20, cursor, order = 'desc' } = options;

    try {
      let builder = server.payments().forAccount(publicKey).limit(limit).order(order);
      if (cursor) {
        builder = builder.cursor(cursor);
      }
      const response = await builder.call();
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch payments: ${error.message}`);
      }
      throw new Error('Failed to fetch payments: unknown error');
    }
  }
}

export default StellarService;
