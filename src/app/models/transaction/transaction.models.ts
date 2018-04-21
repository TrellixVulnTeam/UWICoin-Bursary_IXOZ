import { IBalance } from "../balance/balance.models";

export interface ITransaction {
    type: string;
    address: string;
    sequence: number;
    id: string;
    specification: ISpecification;
    outcome: IOutcome;
}

interface ISpecification {
    source: {
        address: string;
        maxAmount: IBalance
    }
    destination: {
        address: string;
        amount: IBalance
    }
}

interface IOutcome {
    result: string;
    timestamp: string;
    fee: string;
    balanceChanges: object;
    deliveredAmount: IBalance;
}