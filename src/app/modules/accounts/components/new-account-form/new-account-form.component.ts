import { switchMap } from 'rxjs/operators/switchMap';
import { AngularFireDatabase } from 'angularfire2/database';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { DatabaseService } from './../../../../services/database/database.services';
import { IUser } from './../../../../models/user/user.models';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Roles } from './../../../../models/roles/roles.models';
import { Component } from '@angular/core';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { Subscription } from 'rxjs/Subscription';
import * as firebase from 'firebase';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'app-new-account-form',
    templateUrl: './new-account-form.component.html',
    styleUrls: ['./new-account-form.component.sass']
})
export class NewAccountFormComponent {

    roles = [
        { name: 'Bursary General', id: Roles.busary_general },
        { name: 'Bursary Administrator', id: Roles.busary_admin }
    ];

    accountForm: FormGroup;
    fullName: string;
    email: string;
    role: number;
    createdUser: Observable<IUser>;
    loading = false;
    userSub: Subscription;
    response = new BehaviorSubject<string>(null);

    constructor(private formBuilder: FormBuilder,
        private db: AngularFireDatabase,
        private dbService: DatabaseService,
        private auth: AuthenticationService) {
        this.accountForm = this.formBuilder.group({
            'full_name': [null, Validators.compose([Validators.required])],
            'email': [null, Validators.compose([Validators.required, Validators.email])],
            'role': [null, Validators.compose([Validators.required])]
        });

        this.fullName = 'Darion Hernandez';
        this.email = 'darionhernandez868@gmail.com';
        this.role = 4;
    }

    showError(error: string) {

    }

    submit(): void {
        console.log('Submit clicked');
        if (this.accountForm.valid) {
            const uid = this.db.createPushId();
            const user: IUser = {
                email: this.email,
                created: false,
                account_setup: false,
                full_name: this.fullName,
                flag: false,
                role: this.role,
                uid: uid
            };
            // tslint:disable-next-line:max-line-length
            const subscription = this.db.list('users/bursary', ref => ref.orderByChild('email').equalTo(this.email)).valueChanges().switchMap(result => {
                console.log(result.length);
                if (result.length <= 0) {
                    this.dbService.setObject(`users/bursary/${uid}`, user).catch(error => {
                        console.log('Error updating user: ', JSON.stringify(error));
                        this.response.next('Error updating user data');
                    });
                } else {
                    console.log('User already exists');
                    this.response.next('User already exists');
                }
                return [];
            }).take(1).subscribe(result => {
                console.log(result);
            });
            setTimeout(() => subscription.unsubscribe(), 5000);
        }
    }
}
