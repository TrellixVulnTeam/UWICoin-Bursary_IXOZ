export interface ILedgerVersion {
    baseFeeXRP: string;
    ledgerVersion: number;
    ledgerHash: string;
    ledgerTimestamp: string;
    reserveBaseXRP: string;
    reserveIncrementXRP: string
    transactionCount: number;
    validatedLedgerVersions: string;
}