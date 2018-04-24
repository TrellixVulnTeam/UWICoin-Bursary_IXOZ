import { MessagingService } from './services/messaging/messaging.service';
import { AuthenticationService } from './services/authentication/authentication.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { RippleLibService } from './services/rippled-lib/ripple-lib';
import { AngularFireAuth } from 'angularfire2/auth';
import { Component, OnDestroy, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs/Subject';
import { DatabaseService } from './services/database/database.services';
import { IVendor } from './models/vendor/vendor.models';
import { IUser } from './models/user/user.models';
import { Subscription } from 'rxjs/Subscription';
import { ToastrService } from 'ngx-toastr';

@Component({

	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnDestroy, OnInit {

	messaging = firebase.messaging();
	messageSource = new Subject();
	currentMessage;

	vendorSubscription: Subscription;
	bursarySubscription: Subscription;

	// tslint:disable-next-line:max-line-length
	constructor(public auth: AuthenticationService, public ripple: RippleLibService, public db: DatabaseService, private afDb: AngularFireDatabase, public msg: MessagingService, private toastr: ToastrService) {
	}

	ngOnInit() {
		this.listToCreateVendorAccounts();
		this.listToCreateBursaryAccounts();

		this.msg.getPermission();
		this.msg.receiveMessage();
		this.receiveMessage();
	}

	ngOnDestroy() {
		if (this.vendorSubscription) {
			this.vendorSubscription.unsubscribe();
		}
		if (this.bursarySubscription) {
			this.bursarySubscription.unsubscribe();
		}
	}

	receiveMessage() {
		this.messaging.onMessage((result: any) => {
			const data = result.data;
			const notification = result.notification;

			if (notification.title === 'Transaction accepted') {
				this.showSuccessToast(data.message);
			} else if (notification.title === 'Transaction canceled') {
				this.showErrorToast(data.message);
			}
		});

	}

	listToCreateVendorAccounts() {
		// tslint:disable-next-line:max-line-length
		this.vendorSubscription = this.afDb.list('users/vendors/', ref => ref.orderByChild('created').equalTo(true)).valueChanges().subscribe((accounts: IUser[]) => {
			accounts.map((account: IUser) => {
				if (account.account_setup === false) {
					this.auth.sendPasswordResetEmail(account.email).then(() => {
						console.log('Password reset email sent: ', account.email);
						this.showSuccessToast(`Password reset email sent to ${account.email}`);
						this.db.updateObject(`users/vendors/${account.uid}`, { account_setup: true })
							.catch(error => console.log('Error updating account setup'));
					}).catch(error => {
						console.log('Error sending password reset email: ', error);
						this.showErrorToast(`Error sending email to ${account.email}`);
					});
				}
			});
		});
	}

	listToCreateBursaryAccounts() {
		// tslint:disable-next-line:max-line-length
		this.bursarySubscription = this.afDb.list('users/bursary/accounts/', ref => ref.orderByChild('created').equalTo(true)).valueChanges().subscribe((accounts: IUser[]) => {
			accounts.map((account: IUser) => {
				if (account.account_setup === false) {
					this.auth.sendPasswordResetEmail(account.email).then(() => {
						console.log('Password reset email sent: ', account.email);
						this.showSuccessToast(`Password reset email sent to ${account.email}`);
						this.db.updateObject(`users/bursary/accounts/${account.uid}`, { account_setup: true })
							.catch(error => console.log('Error updating account setup'));
					}).catch(error => {
						console.log('Error sending password reset email: ', error);
						this.showErrorToast(`Error sending email to ${account.email}`);
					});
				}
			});
		});
	}

	showErrorToast(message: string, title?: string) {
		this.toastr.error(message, title);
	}

	showSuccessToast(message: string, title?: string) {
		this.toastr.success(message, title);
	}

}
