
import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/api/messages';
  private socket: any;

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    this.socket = io('ws://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });
  }

  getMessages(receiver: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${receiver}`);
  }

  sendMessage(message: string, receiver: string): void {
    this.socket.emit('sendMessage', { message, receiver });
  }

  receiveMessage(callback: (msg: any) => void): void {
    this.socket.on('newMessage', callback);
  }
  getUserStatusUpdates(): Observable<string[]> {
    return new Observable<string[]>(observer => {
      this.socket.on('userStatusUpdate', (users: string[]) => {
        observer.next(users);
      });
    });
  }
  receiveUnreadMessages(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('unreadMessages', (messages: any) => {
        observer.next(messages);
      });
    });
  }
}
