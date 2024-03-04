import { Routes } from '@angular/router';
import { BondUpdateComponent } from './bond-update/bond-update.component';
import { BondListComponent } from './bond-list/bond-list.component';
import { BondListTransactionsComponent } from './bond-list-transactions/bond-list-transactions.component';
// import { BondMoveFundsComponent } from './bond-move-funds/bond-move-funds.component';
import { BondTransactionComponent } from './bond-transaction/bond-transaction.component';
import { BondCreateComponent } from './bond-create/bond-create.component';
import { BondMoveFundsComponent } from './bond-move-funds/bond-move-funds.component';

export const routes: Routes = [
  {
    path: '',
    component: BondListComponent,
  },
  {
    path: 'bond-create',
    component: BondCreateComponent,
  },
  {
    path: 'bond-list',
    component: BondListComponent,
  },
  {
    path: 'bond-list-transactions/:id',
    component: BondListTransactionsComponent,
  },
  {
    path: 'bond-move-funds/:id',
    component: BondMoveFundsComponent
  },
  {
    path: 'bond-transaction/:id',
    component: BondTransactionComponent,
  },
  {
    path: 'bond-update/:id',
    component: BondUpdateComponent,
  },
];