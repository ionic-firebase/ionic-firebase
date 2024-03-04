import { Routes } from '@angular/router';
import { BudgetCreateComponent } from './budget-create/budget-create.component';
import { BudgetListComponent } from './budget-list/budget-list.component';
import { BudgetUpdateComponent } from './budget-update/budget-update.component';

export const routes: Routes = [
    {
        path: '',
        component: BudgetListComponent,
    },
    {
        path: 'budget-create/:id',
        component: BudgetCreateComponent,
    },
    {
        path: 'budget-list',
        component: BudgetListComponent,
    },
    {
        path: 'budget-update/:id',
        component: BudgetUpdateComponent,
    },
];
