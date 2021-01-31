import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./components/pages/home/home.module').then(
        (mod) => mod.HomeModule
      ),
  },
  {
    path: 'editor',
    loadChildren: () =>
      import('./components/pages/editor/editor.module').then(
        (mod) => mod.EditorModule
      ),
  },
  {
    path: 'confirmation/:token',
    loadChildren: () =>
      import('./components/pages/confirmation/confirmation.module').then(
        (mod) => mod.ConfirmationModule
      ),
  },
  {
    path: 'account',
    loadChildren: () =>
      import('./components/pages/account/account.module').then(
        (mod) => mod.AccountModule
      ),
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./components/pages/register/register.module').then(
        (mod) => mod.RegisterModule
      ),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./components/pages/login/login.module').then(
        (mod) => mod.LoginModule
      ),
  },
  {
    path: 'my-strats',
    loadChildren: () =>
      import('./components/pages/my-strats/my-strats.module').then(
        (mod) => mod.MyStratsModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
