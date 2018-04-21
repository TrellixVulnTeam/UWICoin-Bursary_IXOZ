import { CoreModule } from './../core/core.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { TransactionFormComponent } from './components/transaction-form/transaction-form.component';
import { TransactionsHomePageComponent } from './pages/home/transactions.page.home';
import { ManageTransactionsPageComponent } from './pages/manage-transaction/manage-transactions.page';
import { NewTransactionPageComponent } from './pages/new-transaction/new-transaction.page';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    TransactionsRoutingModule
  ],
  declarations: [
    ManageTransactionsPageComponent,
    NewTransactionPageComponent,
    TransactionFormComponent,
    TransactionsHomePageComponent
  ]
})
export class TransactionsModule { }
