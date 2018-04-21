import { IBalance } from './../balance/balance.models';


export interface IPayment {
    source: {
        address: string;
        maxAmount: IBalance;
    },
    destination: {
        address: string;
        amount: IBalance;
    }
}