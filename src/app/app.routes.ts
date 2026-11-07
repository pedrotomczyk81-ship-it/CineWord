import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.Home),
    title: 'Início | CineWord',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin').then((m) => m.Admin),
    title: 'Sessões | CineWord',
  },
  {
    path: 'admin/novo',
    loadComponent: () =>
      import('./features/manutencao/manutencao').then((m) => m.Manutencao),
    title: 'Nova sessão | CineWord',
  },
  {
    path: 'admin/editar/:id',
    loadComponent: () =>
      import('./features/manutencao/manutencao').then((m) => m.Manutencao),
    title: 'Editar sessão | CineWord',
  },
  { path: '**', redirectTo: '' },
];
