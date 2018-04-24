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
    currentMessage = new BehaviorSubject(null);

    constructor(private db: AngularFireDatabase,
        private auth: AuthenticationService) {

    }

    updateToken(token) {
        this.auth.getAuthState().take(1).subscribe(user => {
            if (!user) { return; }

            const data = { [user.uid]: token };
            this.db.object('fcmTokens/').update(data);
        });
    }

    getPermission() {
        this.messaging.requestPermission().then(() => {
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

    receiveMessage() {
        this.messaging.onMessage((payload) => {
            console.log('Message received. ', payload);
            this.currentMessage.next(payload);
        });

    }
}
