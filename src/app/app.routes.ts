import { AuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { Routes } from '@angular/router';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo('/auth/login');

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => 
    import('./home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'auth',
    loadChildren: () =>
    import('./pages/authentication/authentication.routes').then((m) => m.routes),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component')
    .then(m => m.SettingsComponent),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page')
    .then(m => m.LoginPage)
  },
  {
    path: 'summary',
    loadChildren: () => import('./pages/summary/summary.routes')
    .then((m) => m.routes),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'stocks',
    loadChildren: () => import('./pages/stocks/stocks.routes')
    .then((m) => m.routes),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'trusts',
    loadChildren: () => import('./pages/trusts/trusts.routes')
    .then((m) => m.routes),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'portfolios',
    loadChildren: () => import('./pages/portfolios/portfolio.routes')
    .then((m) => m.routes),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'bonds',
    loadChildren: () => import('./pages/bonds/bond.routes')
    .then((m) => m.routes),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'pensions',
    loadChildren: () => import('./pages/pensions/pensions.routes')
    .then((m) => m.routes),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'debts',
    loadChildren: () => import('./pages/debts/debts.routes')
    .then((m) => m.routes),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'budgets',
    loadChildren: () => import('./pages/budgets/budgets.routes')
    .then((m) => m.routes),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'loans',
    loadChildren: () => import('./pages/loans/loans.routes')
    .then((m) => m.routes),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'oneoffs',
    loadChildren: () => import('./pages/oneoffs/oneoffs.routes')
    .then((m) => m.routes),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'property',
    loadChildren: () => import('./pages/property/property.routes')
    .then((m) => m.routes),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'salaries',
    loadChildren: () => import('./pages/salaries/salaries.routes')
    .then((m) => m.routes),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'savings',
    loadChildren: () => import('./pages/savings/savings.routes')
    .then((m) => m.routes),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
];
