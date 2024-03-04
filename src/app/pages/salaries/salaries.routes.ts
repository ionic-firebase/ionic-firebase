import { Routes } from '@angular/router';
import { SalaryCreateComponent } from './salary-create/salary-create.component';
import { SalaryListComponent } from './salary-list/salary-list.component';
import { SalaryUpdateComponent } from './salary-update/salary-update.component';

export const routes: Routes = [
    {
        path: '',
        component: SalaryListComponent,
    },
    {
        path: 'salary-create',
        component: SalaryCreateComponent,
    },
    {
        path: 'salary-list',
        component: SalaryListComponent,
    },
    {
        path: 'salary-update/:id',
        component: SalaryUpdateComponent,
    },
];