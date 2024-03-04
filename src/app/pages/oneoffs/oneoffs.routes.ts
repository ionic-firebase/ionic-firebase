import { Routes } from '@angular/router';
import { OneoffCreateComponent } from './oneoff-create/oneoff-create.component';
import { OneoffListComponent } from './oneoff-list/oneoff-list.component';
import { OneoffUpdateComponent } from './oneoff-update/oneoff-update.component';

export const routes: Routes = [
    {
        path: '',
        component: OneoffListComponent,
    },
    {
        path: 'oneoff-create',
        component: OneoffCreateComponent,
    },
    {
        path: 'oneoff-list',
        component: OneoffListComponent,
    },
    {
        path: 'oneoff-update/:id',
        component: OneoffUpdateComponent,
    },
];