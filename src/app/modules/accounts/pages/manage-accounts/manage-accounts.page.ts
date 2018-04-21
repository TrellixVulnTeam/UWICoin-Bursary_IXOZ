import { Component, ViewChild, OnInit } from '@angular/core';
import { DatabaseService } from '../../../../services/database/database.services';
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { of as observableOf } from 'rxjs/observable/of';
import { catchError } from 'rxjs/operators/catchError';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { switchMap } from 'rxjs/operators/switchMap';
import { Roles } from '../../../../models/roles/roles.models';

@Component({
    templateUrl: './manage-accounts.page.html',
    styleUrls: ['./manage-accounts.page.sass']
})
export class ManageAccountsPageComponent implements OnInit {

    constructor(private db: DatabaseService) { }

    ngOnInit(): void {

    }

}