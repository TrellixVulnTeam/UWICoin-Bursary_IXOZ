import { DatabaseService } from './../database/database.services';
import { AngularFireAuth } from 'angularfire2/auth';
import { IAccount } from './../../models/account/account.models';
import { IBalance } from '../../models/balance/balance.models';
import { ILedgerVersion } from '../../models/ledger-version/ledger-version';
import { Injectable } from '@angular/core';
import { IPayment } from '../../models/payment/payment.models';
import { ITransaction } from './../../models/transaction/transaction.models';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { fromEvent } from 'rxjs/observable/fromEvent';
import * as RippleLib from 'ripple-lib';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/fromEvent';
import { ILedger } from '../../models/ledger/ledger.models';

@Injectable()
export class RippleLibService {

  private api: any = new RippleLib.RippleAPI({ server: 'wss://s.altnet.rippletest.net:51233' });
  private subscriptions: Subscription;
  private currency = 'XRP';

  constructor(private afAuth: AngularFireAuth,
    private dbProvider: DatabaseService) {

    // Get the updated user state on changes
    this.subscriptions = this.afAuth.authState.subscribe(user => {
      if (user) {
        this.connect();
      } else {
        if (this.subscriptions) {
          this.subscriptions.unsubscribe();
        }
        this.disconnect();
      }
    });
  }

  public getLedger(): Observable<ILedger> {
    return Observable.fromEvent(this.api, 'ledger').map((ledger: ILedgerVersion) => {
      let min, max;
      [min, max] = ledger.validatedLedgerVersions.split('-');
      return {
        baseFee: ledger.baseFeeXRP,
        minLedgerVersion: parseInt(min, 10),
        maxLedgerVersion: parseInt(max, 10)
      };
    });
  }


  // Disconnects the application from the Ripple Server
  public async connect(): Promise<void> {
    return this.api.connect().then(() => {
      console.log('Ripple connected');
    }).catch(error => {
      console.log('Error connecting to ripple');
    });
  }

  public async disconnect(): Promise<any> {
    return this.api.disconnect().then(() => {
      console.log('Ripple disconnected');
    });
  }

  // Generates a unique address and secret for the user
  public generateAddress(): IAccount {
    return this.api.generateAddress();
  }


  // Returns the balance for a sngle currency
  public async getBalance(address: string, currency?: string): Promise<IBalance> {
    return this.connect().then(() => {
      return this.getLedger().take(1).toPromise().then(result => {
        const options = {
          currency: this.currency,
          ledgerVersion: result.maxLedgerVersion
        };
        return this.api.getBalances(address, options).then(balances => {
          console.log(JSON.stringify(balances[0]));
          return balances[0];
        });
      }).catch(error => {
        console.log('Error getting ledger: ', error);
      });
    });
  }

  // Returns the balances for each of the available currencies
  public async getBalances(address: string): Promise<IBalance[]> {
    return this.connect().then(() => {
      return this.getLedger().take(1).toPromise().then(result => {
        const options = {
          ledgerVersion: result.maxLedgerVersion
        };
        return this.api.getBalances(address, options).then(balances => {
          console.log(JSON.stringify(balances[0]));
          return balances[0];
        });
      }).catch(error => {
        console.log('Error getting ledger: ', error);
      });
    });
  }

  // Gets all the transactions for the user's account
  public async getTransactions(address: string, limit?: number): Promise<ITransaction> {
    return this.connect().then(() => {
      return this.getLedger().take(1).toPromise().then(ledger => {
        const options = {
          minLedgerVersion: ledger.minLedgerVersion,
          maxLedgerVersion: ledger.maxLedgerVersion,
          limit: limit != null ? limit : undefined
        };
        return this.api.getTransactions(address, options);
      }).catch(error => {
        console.log('Error getting ledger: ', error);
      });
    });

  }

  // Returns whether or not the ripple api is connected to the server
  public isConnected(): boolean {
    return this.api.isConnected();
  }


  public async preparePayment(account: IAccount, vendorAddress: string, payment: IPayment): Promise<any> {
    return this.connect().then(() => {

      const instructions = {
        maxLedgerVersionOffset: 5
      };

      return this.api.preparePayment(account.address, payment, instructions).then(prepared => {
        console.log('Payment transaction prepared');
        const { signedTransaction } = this.api.sign(prepared.txJSON, account.secret);
        console.log('Payment transaction signed');
        return this.api.submit(signedTransaction).then(message => {
          console.log(JSON.stringify(message));
          return message;
        });
      });
    });
  }

}
