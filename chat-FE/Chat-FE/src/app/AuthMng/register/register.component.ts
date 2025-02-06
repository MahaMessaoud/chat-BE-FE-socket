import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  user = { username: '', email: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.authService.register(this.user).subscribe(() => {
      alert('Inscription réussie ! Connectez-vous.');
      this.router.navigate(['/login']);
    }, error => {
      alert('Erreur: ' + error.error.error);
    });
  }
}
