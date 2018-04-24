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
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs/Subscription';
import * as firebase from 'firebase';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/first';

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

    constructor(private formBuilder: FormBuilder,
        private db: AngularFireDatabase,
        private dbService: DatabaseService,
        private auth: AuthenticationService,
        private toastr: ToastrService) {
        this.accountForm = this.formBuilder.group({
            'full_name': [null, Validators.compose([Validators.required])],
            'email': [null, Validators.compose([Validators.required, Validators.email])],
            'role': [null, Validators.compose([Validators.required])]
        });

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
            const subscription = this.db.list('users/bursary/accounts', ref => ref.orderByChild('email').equalTo(this.email)).valueChanges().take(1).switchMap(result => {

                if (result.length <= 0) {
                    this.dbService.setObject(`users/bursary/accounts/${uid}`, user).then(() => {
                        this.showSuccessToast('User created successfully');
                    }).catch(error => {
                        console.log('Error updating user: ', JSON.stringify(error));
                        this.showErrorToast('Error updating user data');
                    });
                } else {
                    console.log('User already exists');
                    this.showErrorToast('User already exits');
                }
                return [];
            }).subscribe(result => result);
        }
    }

    showErrorToast(message: string, title?: string) {
        this.toastr.error(message, title);
        this.accountForm.reset();
    }

    showSuccessToast(message: string, title?: string) {
        this.toastr.success(message, title);
        this.accountForm.reset();
    }
}
