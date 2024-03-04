import { Routes } from '@angular/router';
import { PortfolioUpdateComponent } from './portfolio-update/portfolio-update.component';
import { PortfolioListComponent } from './portfolio-list/portfolio-list.component';
import { PortfolioListTransactionsComponent } from './portfolio-list-transactions/portfolio-list-transactions.component';
// import { PortfolioMoveFundsComponent } from './portfolio-move-funds/portfolio-move-funds.component';
import { PortfolioTransactionComponent } from './portfolio-transaction/portfolio-transaction.component';
import { PortfolioCreateComponent } from './portfolio-create/portfolio-create.component';
import { PortfolioMoveFundsComponent } from './portfolio-move-funds/portfolio-move-funds.component';

export const routes: Routes = [
  {
    path: '',
    component: PortfolioListComponent,
  },
  {
    path: 'portfolio-create',
    component: PortfolioCreateComponent,
  },
  {
    path: 'portfolio-list',
    component: PortfolioListComponent,
  },
  {
    path: 'portfolio-list-transactions/:id',
    component: PortfolioListTransactionsComponent,
  },
  {
    path: 'portfolio-move-funds/:id',
    component: PortfolioMoveFundsComponent,
  },
  {
    path: 'portfolio-transaction/:id',
    component: PortfolioTransactionComponent,
  },
  {
    path: 'portfolio-update/:id',
    component: PortfolioUpdateComponent,
  },
];