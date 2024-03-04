import { Routes } from '@angular/router';
import { DebtUpdateComponent } from './debt-update/debt-update.component';
import { DebtListComponent } from './debt-list/debt-list.component';
import { DebtListTransactionsComponent } from './debt-list-transactions/debt-list-transactions.component';
// import { DebtMoveFundsComponent } from './debt-move-funds/debt-move-funds.component';
import { DebtTransactionComponent } from './debt-transaction/debt-transaction.component';
import { DebtCreateComponent } from './debt-create/debt-create.component';

export const routes: Routes = [
  {
    path: '',
    component: DebtListComponent,
  },
  {
    path: 'debt-create',
    component: DebtCreateComponent,
  },
  {
    path: 'debt-list',
    component: DebtListComponent,
  },
  {
    path: 'debt-list-transactions/:id',
    component: DebtListTransactionsComponent,
  },
  {
    path: 'debt-transaction/:id',
    component: DebtTransactionComponent,
  },
  {
    path: 'debt-update/:id',
    component: DebtUpdateComponent,
  },
];