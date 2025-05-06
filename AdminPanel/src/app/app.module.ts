import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RequestComponent } from './components/request/request.component';
import { EmailComponent } from './components/email/email.component';
import { WithdrawalComponent } from './components/withdrawal/withdrawal.component';
import { ShopsComponent } from './components/shops/shops.component';
import { CampainsComponent } from './components/campains/campains.component';
import { ClicksComponent } from './components/clicks/clicks.component';
import { LayoutComponent } from './components/layout/layout.component';

// primeng 

import { ButtonModule } from 'primeng/button'; 
import { InputTextModule } from 'primeng/inputtext'; 
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardService } from './services/card.service';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';

import { ChartsModule  } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { RequestDetailComponent } from './components/request-detail/request-detail.component';
import { ClickDetailComponent } from './components/click-detail/click-detail.component';
import { WithdrawalDetailComponent } from './components/withdrawal-detail/withdrawal-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    RequestComponent,
    EmailComponent,
    WithdrawalComponent,
    ShopsComponent,
    CampainsComponent,
    ClicksComponent,
    LayoutComponent,
    UserDetailComponent,
    RequestDetailComponent,
    ClickDetailComponent,
    WithdrawalDetailComponent
  ],
  imports: [
    BrowserModule,
    ChartsModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    ButtonModule,
    PasswordModule,
    RouterModule,
    InputTextModule,
    ToastModule,
    PanelModule,
    ProgressSpinnerModule,
    AvatarModule,
    MenuModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [MessageService, CardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
