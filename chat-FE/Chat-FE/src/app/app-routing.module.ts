import { NgModule } from '@angular/core';
import { AddRestoComponent } from './RestauMngmnt/add-resto/add-resto.component';
import { ListRestauComponent } from './RestauMngmnt/list-restau/list-restau.component';
import { UpdateRestoComponent } from './RestauMngmnt/update-resto/update-resto.component';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './AuthMng/register/register.component';
import { LoginComponent } from './AuthMng/login/login.component';
import { ChatComponent } from './AuthMng/chat/chat.component';
import { ChatroomComponent } from './AuthMng/chatroom/chatroom.component';

const routes: Routes = [
  { path: 'restaurants', component: ListRestauComponent },  // Liste des restaurants
  { path: 'add-restaurant', component: AddRestoComponent },  // Ajouter un restaurant
  { path: 'update-restaurant/:id', component: UpdateRestoComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'chatr', component: ChatroomComponent },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
