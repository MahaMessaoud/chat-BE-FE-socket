import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  // credentials = { email: '', password: '' };

  // constructor(private authService: AuthService, private router: Router) {}

  // login() {
  //   this.authService.login(this.credentials).subscribe(response => {
  //     localStorage.setItem('token', response.token);
  //     alert('Connexion réussie !');
  //     this.router.navigate(['/chat']);
  //   }, error => {
  //     alert('Erreur: ' + error.error.error);
  //   });
  // }
  credentials = { email: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.credentials).subscribe(
      (response) => {
        localStorage.setItem('token', response.token);  // Enregistrer le token dans le localStorage
        alert('Connexion réussie !');
        this.router.navigate(['/chat']);  // Rediriger vers la page de chat
      },
      (error) => {
        alert('Erreur: ' + error.error.error);  // Afficher l'erreur si la connexion échoue
      }
    );
  }
}
