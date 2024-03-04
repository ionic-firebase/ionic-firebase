import { Routes } from '@angular/router';
import { StockAddComponent } from './stock-add/stock-add.component';
import { StockBuyComponent } from './stock-buy/stock-buy.component';
import { StockSellComponent } from './stock-sell/stock-sell.component';
import { StockListComponent } from './stock-list/stock-list.component';
import { StockUpdateComponent } from './stock-update/stock-update.component';

export const routes: Routes = [
    {
        path: '',
        component: StockListComponent,
    },
    {
        path: 'stock-add/:id',
        component: StockAddComponent,
    },
    {
        path: 'stock-buy/:id',
        component: StockBuyComponent,
    },
    {
        path: 'stock-sell/:id/:sid',
        component: StockSellComponent,
    },
    {
        path: 'stock-list/:id',
        component: StockListComponent,
    },
    {
        path: 'stock-update/:id/:sid',
        component: StockUpdateComponent,
    },
];
