import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { Roles } from '../../../../models/roles/roles.models';

@Component({
    selector: 'app-side-navigation',
    templateUrl: './side-navigation.component.html',
    styleUrls: ['./side-navigation.component.sass']
})
export class SideNavigationComponent {

    @Input() role = Roles.busary_general;
    isLinkVisible = false;
    selectedLink: ILink;
    links: ILink[] = [
        {
            name: 'Dashboard',
            path: '/bursary/dashboard',
            icon: 'fa-tachometer',
            id: 'dashboard-link'
        },
        {
            authorization: Roles.busary_admin,
            name: 'Accounts',
            path: '/bursary/accounts',
            icon: 'fa-user',
            id: 'accounts-link',
            children: [
                {
                    name: 'New Bursary Account',
                    path: '/bursary/accounts/page/new-account',
                },
                {
                    name: 'Manage Accounts',
                    path: '/bursary/accounts/page/manage-accounts',
                }
            ]
        },
        {
            name: 'Vendors',
            path: '/bursary/vendors',
            icon: 'fa-shopping-cart',
            id: 'vendors-link',
            children: [
                {
                    name: 'New Vendor',
                    path: '/bursary/vendors/page/new-vendor'
                },
                {
                    name: 'Manage Vendors',
                    path: '/bursary/vendors/page/manage-vendors'
                }
            ]
        },
        {
            name: 'Transactions',
            path: '/bursary/transactions',
            icon: 'fa-exchange',
            id: 'transactions-link',
            children: [
                {
                    name: 'New Transaction',
                    path: '/bursary/transactions/page/new-transaction'
                },
                {
                    name: 'Manage Transactions',
                    path: '/bursary/transactions/page/manage-transactions'
                }
            ]
        },
        {
            name: 'Settings',
            path: '/bursary/settings',
            icon: 'fa-cog',
            id: 'settings-link'
        }
    ];

    constructor(private router: Router) {
        // Gets the current selected path event if it is a child path
        const index = _.findIndex(this.links, (o) => this.router.url.startsWith(o.path));
        this.selectedLink = this.links[index];
    }

    onSelect(link: ILink): void {
        this.selectedLink = link;
    }
}

export interface ILink {
    authorization?: number;
    name: string;
    path: string;
    icon: string;
    id: string;
    children?: IChild[];
}


export interface IChild {
    authorization?: number;
    name: string;
    path: string;
}
