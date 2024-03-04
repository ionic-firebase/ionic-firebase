import { Routes } from '@angular/router';
import { TrustAddComponent } from './trust-add/trust-add.component';
import { TrustBuyComponent } from './trust-buy/trust-buy.component';
import { TrustSellComponent } from './trust-sell/trust-sell.component';
import { TrustListComponent } from './trust-list/trust-list.component';
import { TrustUpdateComponent } from './trust-update/trust-update.component';

export const routes: Routes = [
    {
        path: '',
        component: TrustListComponent,
    },
    {
        path: 'trust-add/:id',
        component: TrustAddComponent,
    },
    {
        path: 'trust-buy/:id',
        component: TrustBuyComponent,
    },
    {
        path: 'trust-sell/:id/:sid',
        component: TrustSellComponent,
    },
    {
        path: 'trust-list/:id',
        component: TrustListComponent,
    },
    {
        path: 'trust-update/:id/:sid',
        component: TrustUpdateComponent,
    },
];