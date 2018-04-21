import { IUser } from './../models/user/user.models';
import { Roles } from './../models/roles/roles.models';
import { Component, Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from '../services/authentication/authentication.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.sass']
})
export class MainComponent {

    showNav = true;
    employeeName: string;
    employeeRole: string;
    role: number;
    user: string;

    constructor(public auth: AuthenticationService) {
        this.auth.getUser$().subscribe((user: IUser) => {
            this.employeeName = user.full_name;
            this.employeeRole = this.getRoleString(user.role);
            this.role = user.role;
        });
    }

    public getRoleString(role: number): string {
        return role >= Roles.busary_admin ? 'Admin' : 'General';
    }

    public toggleNav(toggle: boolean): void {
        this.showNav = toggle;
    }

}
