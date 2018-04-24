import { AngularFireDatabase } from 'angularfire2/database';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Component } from '@angular/core';
import { RippleLibService } from '../../../../services/rippled-lib/ripple-lib';
import { DatabaseService } from '../../../../services/database/database.services';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IBalance } from '../../../../models/balance/balance.models';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-transaction-form',
    templateUrl: './transaction-form.component.html',
    styleUrls: ['./transaction-form.component.sass']
})
export class TransactionFormComponent {

    account: string;
    amount: string;
    address: string;
    secret: string;
    description: string;
    destination: string;
    showQRCodeScanner = false;
    qrCodeResultMessage;
    payment: 'Debit' | 'Credit' = null;
    transactionForm: FormGroup;
    enoughBalance = false;
    subscriptions: Subscription;

    constructor(private ripple: RippleLibService,
        private dbService: DatabaseService,
        private db: AngularFireDatabase,
        private auth: AuthenticationService,
        private formBuilder: FormBuilder,
        private toastr: ToastrService) {

        this.subscriptions = dbService.getObject('users/bursary/account').subscribe(account => {
            if (account) {
                this.address = account.address;
                this.secret = account.secret;
            }
        });

        this.transactionForm = this.formBuilder.group({
            'amount': [null, Validators.compose([Validators.required])],
            'description': [null, Validators.compose([Validators.required])],
            'destination': [null, Validators.compose([Validators.required])],
            'payment': [null, Validators.compose([Validators.required])]
        });

    }
    enterDebitTransaction() {
        this.auth.getAccount$().take(1).subscribe(account => {
            const key = this.dbService.getPushKey();
            const options = {
                source: {
                    address: this.destination,
                    maxAmount: {
                        value: this.amount.toString(),
                        currency: 'XRP'
                    }
                },
                destination: {
                    address: account.address,
                    amount: {
                        value: this.amount.toString(),
                        currency: 'XRP'
                    }
                },
                status: 'pending',
                description: this.description,
                uid: this.auth.getAuth().currentUser.uid,
                key: key
            };
            this.dbService.setObject(`transactions/debit/${key}/`, options).then(() => {
                this.showSuccessToast('The transaction was sent successfully');
                this.transactionForm.reset();
            }).catch(error => {
                this.showErrorToast('The transaction was failed to send');
                this.transactionForm.reset();
            });

        });

    }

    enterCreditTransaction() {
        this.auth.getAccount$().take(1).subscribe(account => {
            const options = {
                source: {
                    address: account.address,
                    maxAmount: {
                        value: this.amount.toString(),
                        currency: 'XRP'
                    }
                },
                destination: {
                    address: this.destination,
                    amount: {
                        value: this.amount.toString(),
                        currency: 'XRP'
                    }
                }
            };
            this.ripple.preparePayment(account, this.address, options).then(prepared => {
                const key = this.dbService.getPushKey();
                const transaction = {
                    paymentType: 'Credit',
                    time: new Date(),
                    description: this.description,
                    amount: {
                        value: options.destination.amount.value,
                        currency: 'XRP',
                    },
                    source: options.source.address,
                    destination: options.destination.address,
                    status: prepared.resultCode === 'tesSUCCESS' ? 'success' : 'failed',
                    uid: this.auth.getAuth().currentUser.uid,
                    key: key
                };
                this.dbService.setObject(`transactions/credit/${key}`, transaction).then(() => {
                    this.showSuccessToast('The transaction was successful');
                    this.transactionForm.reset();
                });
            }).catch(error => {
                console.error(error);
                this.showErrorToast('The transaction failed');
                this.transactionForm.reset();
            });
        });
    }

    getQRCodeResult(result: any) {
        if (result.status === 'Scan successful') {
            this.destination = result.account;
        }
        if (this.payment && this.payment === 'Debit') {
            this.checkBalance();
        }
        this.qrCodeResultMessage = result.status;
        this.showQRCodeScanner = false;
    }

    submit(): void {
        if (this.transactionForm.valid) {
            if (this.payment === 'Debit') {
                console.log('Debit payment made');
                this.enterDebitTransaction();
            } else if (this.payment === 'Credit') {
                console.log('Credit payment made');
                this.enterCreditTransaction();
            }
            this.qrCodeResultMessage = null;
        }
    }

    toggleShowQRCode() {
        this.showQRCodeScanner = this.showQRCodeScanner === true ? false : true;
    }

    checkBalance() {
        if (this.destination != null && this.amount != null && this.payment === 'Debit') {
            console.log(this.destination);
            this.ripple.getBalance(this.destination).then((balance: IBalance) => {
                if (balance) {
                    const currentBalance = parseInt(balance.value, 10);
                    const amount = parseInt(this.amount, 10);

                    if (currentBalance < amount) {
                        this.transactionForm.controls['destination'].setErrors({ 'notenough': true });
                        this.showErrorToast('The user does not have enough money to complete the transaction.');
                    } else {
                        this.transactionForm.controls['destination'].setErrors(null);
                        this.showSuccessToast('The user has enough money.');
                    }
                    return;
                }
                this.transactionForm.controls['destination'].setErrors({ 'notenough': true });
                this.showErrorToast('The user does not have enough money to complete the transaction.');
            }).catch(error => {
                console.log(error);
                this.transactionForm.controls['destination'].setErrors({ 'notenough': true });
                this.showErrorToast('The user does not have enough money to complete the transaction.');
            });
        }
    }

    showErrorToast(message: string, title?: string) {
        this.toastr.error(message, title);
    }

    showSuccessToast(message: string, title?: string) {
        this.toastr.success(message, title);
    }
}
