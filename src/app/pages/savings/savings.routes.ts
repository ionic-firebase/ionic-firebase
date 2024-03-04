import { Routes } from '@angular/router';
import { SavingUpdateComponent } from './saving-update/saving-update.component';
import { SavingListComponent } from './saving-list/saving-list.component';
import { SavingListTransactionsComponent } from './saving-list-transactions/saving-list-transactions.component';
// import { SavingMoveFundsComponent } from './saving-move-funds/saving-move-funds.component';
import { SavingTransactionComponent } from './saving-transaction/saving-transaction.component';
import { SavingCreateComponent } from './saving-create/saving-create.component';
import { SavingMoveFundsComponent } from './saving-move-funds/saving-move-funds.component';

export const routes: Routes = [
  {
    path: '',
    component: SavingListComponent,
  },
  {
    path: 'saving-create',
    component: SavingCreateComponent,
  },
  {
    path: 'saving-list',
    component: SavingListComponent,
  },
  {
    path: 'saving-list-transactions/:id',
    component: SavingListTransactionsComponent,
  },
  {
    path: 'saving-move-funds/:id',
    component: SavingMoveFundsComponent,
  },
  {
    path: 'saving-transaction/:id',
    component: SavingTransactionComponent,
  },
  {
    path: 'saving-update/:id',
    component: SavingUpdateComponent,
  },
];