import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WithdrawalComponent } from './components/withdrawal/withdrawal.component';
import { ShopsComponent } from './components/shops/shops.component';
import { RequestComponent } from './components/request/request.component';
import { LoginComponent } from './components/login/login.component';
import { EmailComponent } from './components/email/email.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClicksComponent } from './components/clicks/clicks.component';
import { LayoutComponent } from './components/layout/layout.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { RequestDetailComponent } from './components/request-detail/request-detail.component';
import { ClickDetailComponent } from './components/click-detail/click-detail.component';
import { WithdrawalDetailComponent } from './components/withdrawal-detail/withdrawal-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent }, // fara sidebar
  {
    path: '', 
    component: LayoutComponent, // cu sidebar
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'shops', component: ShopsComponent },
      { path: 'request', component: RequestComponent },
      { path: 'withdrawal', component: WithdrawalComponent },
      { path: 'email', component: EmailComponent },
      { path: 'clicks', component: ClicksComponent },
      { path: 'user-detail/:id', component: UserDetailComponent },
      { path: 'request-detail/:id', component: RequestDetailComponent },
      { path: 'clicks/:id', component: ClickDetailComponent },
      { path: 'withdrawal/:id', component: WithdrawalDetailComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }     // Redirect unknown routes to login
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
