import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'rxjs/add/operator/take';
import { AuthenticationService } from '../authentication/authentication.service';
import { DatabaseService } from '../database/database.services';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MessagingService {

    messaging = firebase.messaging();
    private messageSource = new Subject();
    currentMessage = this.messageSource.asObservable();

    constructor(private db: DatabaseService,
        private auth: AuthenticationService) {

    }

    getPermission() {
        this.messaging.requestPermission()
            .then(() => {
                console.log('Notification permission granted.');
                return this.messaging.getToken();
            })
            .then(token => {
                console.log(token);
                this.updateToken(token);
            })
            .catch((err) => {
                console.log('Unable to get permission to notify.', err);
            });
    }

    updateToken(token) {
        this.auth.getAccount$().subscribe(account => {
            if (account) {
                this.db.setObject(`fcmTokens/`, { [account.address]: token });
            }
        }, error => {
            console.log('Error updating messaging token: ', error);
        });
    }

    monitorRefresh() {
        this.messaging.onTokenRefresh(() => {
            this.messaging.getToken()
                .then(refreshedToken => {
                    console.log('Token refreshed.');
                    this.updateToken(refreshedToken);
                })
                .catch(err => console.log(err, 'Unable to retrieve new token'));
        });
    }

    receiveMessages() {
        this.messaging.onMessage(payload => {
            console.log('Message received. ', payload);
            this.messageSource.next(payload);
        });
    }
}
