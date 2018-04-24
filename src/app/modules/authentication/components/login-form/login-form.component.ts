import { Router } from '@angular/router';
import { AuthenticationService } from './../../../../services/authentication/authentication.service';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.sass']
})
export class LoginFormComponent {

    loginForm: FormGroup;
    email: string;
    password: string;
    year: number;
    error: string;

    constructor(private auth: AuthenticationService,
        private formBuilder: FormBuilder,
        private router: Router,
        private toastr: ToastrService) {
        this.loginForm = formBuilder.group({
            'email': [null, Validators.compose([Validators.required, Validators.email])],
            'password': [null, Validators.compose([Validators.required, Validators.minLength(7)])]
        });

        this.year = new Date().getFullYear();
    }

    login(): void {
        this.auth.login(this.email, this.password).then(isAuthorized => {
            console.log(isAuthorized);
            if (isAuthorized) {
                isAuthorized.take(1).subscribe(auth => {
                    console.log(auth);
                    if (auth) {
                        this.router.navigate(['bursary', 'accounts']);
                    } else {
                        this.auth.logout().then(() => this.showErrorToast('Unauthorized account'));
                    }
                }, error => {
                    this.showErrorToast('Something went wrong');
                });
            } else {
                this.showErrorToast('Something went wrong');
            }
        }).catch(error => {
            this.showError(error);
        });
    }

    showError(error): void {
        // Error codes at https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signInWithEmailAndPassword
        switch (error.code) {
            case 'auth/user-not-found':
                this.showErrorToast('User not found');
                this.loginForm.reset(); // Clear the contents in the form
                break;
            case 'auth/wrong-password':
                this.showErrorToast('Wrong password');
                this.loginForm.controls['password'].reset(); // Clears only the password field
                break;
            case 'auth/network-request-failed':
                this.showErrorToast('Network request failed');
                this.loginForm.reset(); // Clear the contents in the form
                break;
            default:
                this.showErrorToast('Something went wrong');
                this.loginForm.reset(); // Clear the contents in the form
        }
        console.error(error);
    }

    showErrorToast(message: string, title?: string) {
        this.toastr.error(message, title);
    }
}
