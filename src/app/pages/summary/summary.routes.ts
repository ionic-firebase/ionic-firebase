import { Routes } from '@angular/router';
import { SummaryComponent } from './summary.component';
import { SummaryDetailComponent } from './summary-detail/summary-detail.component';
import { ForecastComponent } from './forecast/forecast.component';

export const routes: Routes = [
    {
        path: '',
        component: SummaryComponent,
    },
    {
        path: 'summary-detail',
        component: SummaryDetailComponent,
    },
    {
        path: 'forecast',
        component: ForecastComponent,
    },
];
