import { Routes } from '@angular/router';
import { PropertyUpdateComponent } from './property-update/property-update.component';
import { PropertyListComponent } from './property-list/property-list.component';
import { PropertyListTransactionsComponent } from './property-list-transactions/property-list-transactions.component';
import { PropertyTransactionComponent } from './property-transaction/property-transaction.component';
import { PropertyCreateComponent } from './property-create/property-create.component';

export const routes: Routes = [
  {
    path: '',
    component: PropertyListComponent,
  },
  {
    path: 'property-create',
    component: PropertyCreateComponent,
  },
  {
    path: 'property-list',
    component: PropertyListComponent,
  },
  {
    path: 'property-list-transactions/:id',
    component: PropertyListTransactionsComponent,
  },
  {
    path: 'property-transaction/:id',
    component: PropertyTransactionComponent,
  },
  {
    path: 'property-update/:id',
    component: PropertyUpdateComponent,
  },
];