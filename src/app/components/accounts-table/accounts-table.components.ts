import { IUser } from './../../models/user/user.models';
import { Observable } from 'rxjs/Observable';
import { DatabaseService } from './../../services/database/database.services';
import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { AngularFireDatabase } from 'angularfire2/database';
import { DataSource } from '@angular/cdk/table';
import { Roles } from '../../models/roles/roles.models';

@Component({
    selector: 'app-accounts-table',
    styleUrls: ['accounts-table.components.sass'],
    templateUrl: 'accounts-table.components.html',
})
export class AccountsTableComponent implements AfterViewInit, OnInit {

    @ViewChild(MatPaginator) paginator: MatPaginator;

    displayedColumns = ['full_name', 'email', 'position', 'flag'];
    dataSource = new AccountDataSource(this.db);

    constructor(private db: DatabaseService) {
    }

    ngOnInit() {
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    }

    ngAfterViewInit() {
    }
}

export class AccountDataSource extends DataSource<any> {

    constructor(private db: DatabaseService) {
        super();
    }

    connect(): Observable<IUser[]> {
        const bursary = this.db.getList('users/bursary');
        const students = this.db.getList('users/students');
        const accounts = Observable.merge(bursary, students).map((users: IUser[]) => {
            console.log(users);
            return users.map((data: IUser) => {
                const account: IUser = {
                    full_name: data.full_name,
                    email: data.email,
                    position: this.resolveRole(data.role),
                    flag: data.flag || false
                };
                return account;
            });
        });

        accounts.subscribe(account => console.log(account));
        return accounts;
    }

    disconnect() { }

    resolveRole(role: number) {
        switch (role) {
            case Roles.student_general:
                return 'Student';
            case Roles.vendor_general:
                return 'Vendor Employee';
            case Roles.vendor_admin:
                return 'Vendor Administrator';
            case Roles.busary_general:
                return 'Bursary Employee';
            case Roles.busary_admin:
                return 'Bursary Admin';
            default:
                return 'Administrator';
        }
    }
}