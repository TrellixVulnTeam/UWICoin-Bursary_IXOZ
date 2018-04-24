import { AuthenticationService } from './../authentication/authentication.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private auth: AuthenticationService,
        private router: Router) { }

    canActivate() {
        if (this.auth.getAuth().currentUser == null) {
            this.router.navigate(['/authentication']);
            return false;
        }
        return true;
    }
}