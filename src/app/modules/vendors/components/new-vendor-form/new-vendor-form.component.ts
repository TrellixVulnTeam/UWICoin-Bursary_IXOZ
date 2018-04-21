import { DatabaseService } from './../../../../services/database/database.services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import { Roles } from '../../../../models/roles/roles.models';
import { IUser } from '../../../../models/user/user.models';
import { AngularFireDatabase } from 'angularfire2/database';
import { IVendor } from '../../../../models/vendor/vendor.models';

@Component({
    selector: 'app-new-vendor-form',
    templateUrl: './new-vendor-form.component.html',
    styleUrls: ['./new-vendor-form.component.sass']
})
export class NewVendorFormComponent {

    vendorForm: FormGroup;

    name: string;
    description: string;
    type: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    adminEmail: string;
    adminName: string;
    telephone1: string;
    telephone2: string;
    facebookLink: string;
    twitterLink: string;
    instagramLink: string;

    constructor(private formBuilder: FormBuilder, private db: AngularFireDatabase) {
        this.vendorForm = formBuilder.group({
            'vendorName': [null, Validators.compose([Validators.required])],
            'vendorDescription': [null, Validators.compose([Validators.required])],
            'vendorType': [null, Validators.compose([Validators.required])],
            'addressLine1': [null, Validators.compose([Validators.required])],
            'addressLine2': [null],
            'city': [null, Validators.compose([Validators.required])],
            'adminName': [null, Validators.compose([Validators.required])],
            'adminEmail': [null, Validators.compose([Validators.required, Validators.email])],
            'telephone1': [null, Validators.compose([Validators.required])],
            'telephone2': [],
            'facebookLink': [],
            'twitterLink': [],
            'instagramLink': []
        });
    }

    save(): void {
        const vendor: IVendor = {
            vendorName: this.name,
            vendorDescription: this.description,
            vendorType: this.type,
            addressLine1: this.addressLine1,
            addressLine2: this.addressLine2,
            city: this.city,
            adminEmail: this.adminEmail,
            telephone1: this.telephone1,
            telephone2: this.telephone2,
            facebookLink: this.facebookLink,
            twitterLink: this.twitterLink,
            instagramLink: this.instagramLink
        };
        const admin: IUser = {
            full_name: this.adminName,
            email: this.adminEmail,
            role: Roles.vendor_admin,
            created: false,
            account_setup: false,
            flag: false,
            uid: this.db.createPushId()
        };
        const updates = {};
        updates[`vendors/${admin.uid}`] = vendor;
        updates[`users/vendors/${admin.uid}`] = admin;
        this.db.object('/').update(updates).then(result => {
            console.log('Success writing vendor: ', result);
        }).catch(error => {
            console.log(error);
        });
    }
}
