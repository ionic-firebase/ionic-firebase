import { Routes } from '@angular/router';
import { LoanUpdateComponent } from './loan-update/loan-update.component';
import { LoanListComponent } from './loan-list/loan-list.component';
import { LoanListTransactionsComponent } from './loan-list-transactions/loan-list-transactions.component';
// import { LoanMoveFundsComponent } from './loan-move-funds/loan-move-funds.component';
import { LoanTransactionComponent } from './loan-transaction/loan-transaction.component';
import { LoanCreateComponent } from './loan-create/loan-create.component';

export const routes: Routes = [
  {
    path: '',
    component: LoanListComponent,
  },
  {
    path: 'loan-create',
    component: LoanCreateComponent,
  },
  {
    path: 'loan-list',
    component: LoanListComponent,
  },
  {
    path: 'loan-list-transactions/:id',
    component: LoanListTransactionsComponent,
  },
  {
    path: 'loan-transaction/:id',
    component: LoanTransactionComponent,
  },
  {
    path: 'loan-update/:id',
    component: LoanUpdateComponent,
  },
];