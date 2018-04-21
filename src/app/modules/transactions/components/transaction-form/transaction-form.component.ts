import { Component } from '@angular/core';
import { RippleLibService } from '../../../../services/rippled-lib/ripple-lib';
import { DatabaseService } from '../../../../services/database/database.services';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

    constructor(private ripple: RippleLibService,
        private db: DatabaseService,
        private formBuilder: FormBuilder) {

        db.getObject('users/bursary/account').subscribe(account => {
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
        const options = {
            source: {
                address: this.destination,
                maxAmount: {
                    value: this.amount.toString(),
                    currency: 'XRP'
                }
            },
            destination: {
                address: this.address,
                amount: {
                    value: this.amount.toString(),
                    currency: 'XRP'
                }
            }
        };
        this.ripple.preparePayment(options, this.destination).then(prepared => {
            let result = prepared.txJSON.replace('\\', '');
            result = JSON.parse(result);
            const transaction = {
                paymentType: 'Debit',
                time: new Date(),
                description: this.description,
                amount: result.Amount,
                source: result.Account,
                destination: result.Destination,
                fee: result.Fee,
                prepared: prepared,
                status: 'pending'
            };
            this.db.setObject(`transactions/debit/${this.destination}`, transaction).then(() => {
                console.log('Debit transaction sent');
                this.db.getObject(`transactions/debit/${result.destination}`).subscribe(transaction_result => {
                    if (transaction_result && transaction_result.status === 'success') {
                        console.log('Success');
                        this.transactionForm.reset();
                    }
                });
            }).catch(error => {
                console.error(error);
                this.transactionForm.controls['destination'].reset();
            });
        }).catch(error => {
            console.log(error);
            this.transactionForm.controls['destination'].reset();
        });
    }

    enterCreditTransaction() {
        const options = {
            source: {
                address: this.address,
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
        console.log(options);
        this.ripple.preparePayment(options, this.address).then(prepared => {
            console.log(prepared);
            this.ripple.signAndSubmitPayment(prepared).then(message => {
                let result = prepared.txJSON.replace('\\', '');
                result = JSON.parse(result);
                const transaction = {
                    paymentType: 'Debit',
                    time: new Date(),
                    description: this.description,
                    amount: result.Amount,
                    source: result.Account,
                    destination: result.Destination,
                    status: message.resultCode === 'tesSUCCESS' ? 'success' : message.resultCode
                };
                this.db.setObject(`transactions/credit/${this.destination}`, transaction).then(() => {
                    // Send a notification that the transaction was successfull
                    console.log('Success');
                    this.transactionForm.reset();
                });
            }).catch(error => {
                console.error(error);
                this.transactionForm.controls['destination'].reset();
            });
        }).catch(error => {
            console.error(error);
            this.transactionForm.controls['destination'].reset();
        });
    }

    getQRCodeResult(result: any) {
        if (result.status === 'Scan successful') {
            this.destination = result.account;
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
        }
    }

    toggleShowQRCode() {
        this.showQRCodeScanner = this.showQRCodeScanner === true ? false : true;
    }
}
