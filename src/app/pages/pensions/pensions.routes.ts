import { Routes } from '@angular/router';
import { PensionCreateComponent } from './pension-create/pension-create.component';
import { PensionListComponent } from './pension-list/pension-list.component';
import { PensionUpdateComponent } from './pension-update/pension-update.component';

export const routes: Routes = [
    {
        path: '',
        component: PensionListComponent,
    },
    {
        path: 'pension-create',
        component: PensionCreateComponent,
    },
    {
        path: 'pension-list',
        component: PensionListComponent,
    },
    {
        path: 'pension-update/:id',
        component: PensionUpdateComponent,
    },
];