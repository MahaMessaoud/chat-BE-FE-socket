import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:5000'); // Remplacez par l'URL de votre backend
  }

  // Écoute des événements génériques
  onEvent(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data) => {
        observer.next(data);
      });
    });
  }

  // Écoute des nouveaux messages
  onNewMessage(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('message', (message: string) => {
        observer.next(message);
      });
    });
  }

  // Envoi d'un message au serveur
  sendMessage(message: string): void {
    this.socket.emit('message', message);
  }

  // Déconnexion du socket
  disconnect(): void {
    this.socket.disconnect();
  }
}
