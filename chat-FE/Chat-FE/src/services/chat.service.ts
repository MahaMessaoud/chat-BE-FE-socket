import { Injectable } from '@angular/core';
import { io } from 'socket.io-client'; // Importer Socket.IO
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/api/messages'; // URL pour récupérer les messages
  private socket: any;

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    // Connexion au serveur WebSocket
    this.socket = io('http://localhost:5000', {
      auth: { token },
    });
  }

  // Méthode pour récupérer tous les messages
  getMessages(receiver: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${receiver}`);
  }

  // Envoi de message
  sendMessage(message: string, receiver: string): void {
    this.socket.emit('sendMessage', { message, receiver });
  }
  getMessageSended(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
  // Réception des messages
  receiveMessage(callback: (msg: any) => void): void {
    this.socket.on('newMessage', callback);
  }
}
