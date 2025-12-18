import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password.page';
import { ResetPasswordPage } from './pages/reset-password/reset-password.page';

import { AuthFormComponent } from './components/auth-form/auth-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: 'login', // ✅ CORREGIDO: Debe llamarse 'login' para que el botón de la Landing funcione
        component: LoginPage
      },
      {
        path: 'register',
        component: RegisterPage
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordPage
      },
      {
        path: 'reset-password',
        component: ResetPasswordPage
      },
      {
        path: '', // ✅ AÑADIDO: Si entras a /auth, te lleva directo al login
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ])
  ],
  declarations: [
    LoginPage,
    RegisterPage,
    ForgotPasswordPage,
    ResetPasswordPage,
    AuthFormComponent
  ]
})
export class AuthModule {}