import { IUser } from './../../../../models/user/user.models';
import { DatabaseService } from './../../../../services/database/database.services';
import { Subscription } from 'rxjs/Subscription';
import { AuthenticationService } from './../../../../services/authentication/authentication.service';
import { Component, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Roles } from '../../../../models/roles/roles.models';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'app-main-navigation',
    templateUrl: './main-navigation.component.html',
    styleUrls: ['./main-navigation.component.sass']
})
export class MainNavigationComponent implements OnInit, OnDestroy {

    @Output() toggle = new EventEmitter<boolean>();
    @Input() employeeName: any;
    @Input() employeeRole: any;
    userSubscription: Subscription;
    toggleNav = true;

    constructor(private auth: AuthenticationService,
        private db: DatabaseService,
        private router: Router) {
            this.toggle.emit(this.toggleNav);
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }

    logout(): void {
        this.auth.logout().then(() => {
            this.router.navigate(['authentication']);
        });
    }

    switchToggle(): void {
        this.toggleNav === true ? this.toggle.emit(false) : this.toggle.emit(true);
        this.toggleNav = !this.toggleNav;
    }
}
