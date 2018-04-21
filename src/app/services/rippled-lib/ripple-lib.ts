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

@Injectable()
export class RippleLibService {

  private api: any = new RippleLib.RippleAPI({ server: 'wss://s.altnet.rippletest.net:51233' });
  private account: any;
  private maxLedgerVersion: number;
  private minLedgerVersion: number;
  private subscriptions: Subscription;

  constructor(private afAuth: AngularFireAuth,
    private dbProvider: DatabaseService) {

    // Get the updated user state on changes
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.fetchAddress(user.uid);
      } else {
        if (this.subscriptions) {
          this.subscriptions.unsubscribe();
        }
      }
    });

    // Get the updated ledger version on changes
    fromEvent(this.api, 'ledger').subscribe((ledger: ILedgerVersion) => {
      let min, max;
      [min, max] = ledger.validatedLedgerVersions.split('-');
      this.maxLedgerVersion = parseInt(max, 10);
      this.minLedgerVersion = parseInt(min, 10);
    });
  }

  // Disconnects the application from the Ripple Server
  public async connect(): Promise<any> {
    return this.api.connect().then(() => {
      console.log('Ripple connected');
    });
  }

  public async disconnect(): Promise<any> {
    return this.api.disconnect().then(() => {
      console.log('Ripple disconnected');
    });
  }

  // Fetches the user's address from the database
  public fetchAddress(uid: string): void {
    this.subscriptions = this.dbProvider.getObject(`users/bursary/account`).subscribe(addresses => {
      if (addresses) {
        this.account = addresses;
      }
    });
  }

  // Returns an object containing the user's address and secret
  public getAccount(): IAccount {
    return this.account;
  }

  // Returns the address of the user
  public getAddress(): string {
    return this.account.address;
  }

  // Returns the balance for a sngle currency
  public async getBalance(currency?: string): Promise<IBalance> {

    const options = {
      currency: currency || 'XRP'
    };
    return this.api.getBalances(this.account.address, options).then(balances => balances[0]);
  }

  // Returns the balances for each of the available currencies
  public getBalances(): Promise<IBalance[]> {
    return this.api.getBalances(this.account.address);
  }

  getCustomerBalance(customer_address: string, currency?: string): Promise<IBalance> {
    const options = {
      currency: currency || 'XRP'
    };
    return this.api.getBalances(this.account.address, options).then(balances => balances[0]);
  }

  // Gets all the transactions for the user's account
  public getTransactions(): Subscription {
    const options = {
      minLedgerVersion: this.minLedgerVersion,
      maxLedgerVersion: this.maxLedgerVersion
    };
    return this.api.getTransactions(this.account.address, options);
  }

  // Returns whether or not the ripple api is connected to the server
  public isConnected(): boolean {
    return this.api.isConnected();
  }


  public async preparePayment(payment: IPayment, address: string): Promise<any> {
    const instructions = {
      maxLedgerVersionOffset: 5
    };
    return this.api.preparePayment(address, payment, instructions).then(prepared => {
      console.log('Payment transaction prepared');
      return prepared;
    });
  }


  public async signAndSubmitPayment(prepared: any) {
    const { signedTransaction } = await this.api.sign(prepared.txJSON, this.account.secret);
    console.log('Payment transaction signed');
    return this.api.submit(signedTransaction);
  }

}
