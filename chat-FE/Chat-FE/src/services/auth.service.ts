import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // 🔹 Extraire le username du token JWT
  getUsername(): string | null {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded.username; // Assurez-vous que le token contient "username"
    } catch (error) {
      console.error("Erreur de décodage du token :", error);
      return null;
    }
  }
  
}
