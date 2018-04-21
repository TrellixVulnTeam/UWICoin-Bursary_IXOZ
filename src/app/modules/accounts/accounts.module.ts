import { AccountsTableComponent } from './../../components/accounts-table/accounts-table.components';
import { ManageAccountsPageComponent } from './pages/manage-accounts/manage-accounts.page';
import { CoreModule } from './../core/core.module';
import { AccountsRoutingModule } from './accounts-routing.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AccountsHomePageComponent } from './pages/home/accounts.home.page';
import { NewAccountPageComponent } from './pages/new-account/new-account.page';
import { NewAccountFormComponent } from './components/new-account-form/new-account-form.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    AccountsRoutingModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    ReactiveFormsModule
  ],
  declarations: [
    AccountsHomePageComponent,
    ManageAccountsPageComponent,
    NewAccountPageComponent,
    NewAccountFormComponent,
    AccountsTableComponent
  ]
})
export class AccountsModule { }
