import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewTransactionPageComponent } from './pages/new-transaction/new-transaction.page';
import { ManageTransactionsPageComponent } from './pages/manage-transaction/manage-transactions.page';
import { TransactionsHomePageComponent } from './pages/home/transactions.page.home';

const routes: Routes = [
  {
    path: 'page',
    component: TransactionsHomePageComponent,
    children: [
      {
        path: 'new-transaction',
        component: NewTransactionPageComponent
      },
      {
        path: 'manage-transactions',
      component: ManageTransactionsPageComponent
      },
      {
        path: '',
        redirectTo: 'new-transaction',
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
export class TransactionsRoutingModule { }
