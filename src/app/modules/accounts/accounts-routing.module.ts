import { ManageAccountsPageComponent } from './pages/manage-accounts/manage-accounts.page';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountsHomePageComponent } from './pages/home/accounts.home.page';
import { NewAccountPageComponent } from './pages/new-account/new-account.page';

const routes: Routes = [
  {
    path: 'page',
    component: AccountsHomePageComponent,
    children: [
      {
        path: 'new-account',
        component: NewAccountPageComponent
      },
      {
        path: 'manage-accounts',
        component: ManageAccountsPageComponent
      },
      {
        path: '',
        redirectTo: 'new-account',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'page',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule { }
