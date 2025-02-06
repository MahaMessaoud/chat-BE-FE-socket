import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private apiUrl = 'http://localhost:5000/api/restaurants';
  private socket: Socket;

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:5000'); // Connexion WebSocket
  }

  getRestaurants(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
  getRestaurantById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addRestaurant(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateRestaurant(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteRestaurant(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // WebSockets pour la mise à jour en temps réel
  onRestaurantAdded(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('restaurantAdded', data => observer.next(data));
    });
  }

  onRestaurantUpdated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('restaurantUpdated', (updatedResto) => {
        observer.next(updatedResto);
      });
    });
  }


  onRestaurantDeleted(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('restaurantDeleted', id => observer.next(id));
    });
  }

}
