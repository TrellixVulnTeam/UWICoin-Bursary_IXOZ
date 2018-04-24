import { Roles } from './../../models/roles/roles.models';
import { AuthenticationService } from './../authentication/authentication.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable()
export class RoleGuard implements CanActivate {

    constructor(private auth: AuthenticationService,
        private router: Router) { }

    canActivate() {
        return this.auth.getUser$().map(user => {
            if (user) {
                if (user.role >= Roles.busary_admin) {
                    this.router.navigate(['/authentication']);
                    return true;
                }
            }
            return false;
        });
    }
}