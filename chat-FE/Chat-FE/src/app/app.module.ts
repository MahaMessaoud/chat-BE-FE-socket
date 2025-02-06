import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ListRestauComponent } from './RestauMngmnt/list-restau/list-restau.component';
import { AddRestoComponent } from './RestauMngmnt/add-resto/add-resto.component';
import { UpdateRestoComponent } from './RestauMngmnt/update-resto/update-resto.component';
import { RegisterComponent } from './AuthMng/register/register.component';
import { LoginComponent } from './AuthMng/login/login.component';
import { AuthInterceptor } from './Interceptors/auth.interceptor';
import { ChatComponent } from './AuthMng/chat/chat.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    AddRestoComponent,
    ListRestauComponent, // <-- Déclarez le composant ici
    UpdateRestoComponent, RegisterComponent, LoginComponent, ChatComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
  ],
  bootstrap: [AppComponent],

  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ]})
export class AppModule {}
