
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:5000/api';
  private socket: Socket;
  private connectedUsers: string[] = [];
  private currentUser: string | null = '';

  constructor(private http: HttpClient, private authService: AuthService) {
    this.currentUser = this.authService.getUsername();

    this.socket = io('ws://localhost:5000', {
      auth: { token: this.authService.getToken() },
      transports: ['websocket'],
    });
  }

  // ✅ Get only connected users (excluding current user)
  getUserStatusUpdates(): Observable<string[]> {
    return new Observable<string[]>((observer) => {
      this.socket.on('userStatusUpdate', (users: string[]) => {
        const filteredUsers = users.filter(user => user !== this.currentUser);
        this.connectedUsers = filteredUsers; // Update connectedUsers
        observer.next(filteredUsers);
      });
    });
  }

  // ✅ Get all users (connected and disconnected) excluding current user
  getAllUsers(): Observable<string[]> {
    return new Observable(observer => {
      this.http.get<string[]>(`${this.apiUrl}/users`).subscribe(users => {
        const filteredUsers = users.filter(user => user !== this.currentUser);
        observer.next(filteredUsers);
      });
    });
  }

  // ✅ Get messages for a specific conversation
  getMessages(receiver: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/${receiver}`);
  }

  // ✅ Send message to a user
  sendMessage(message: string, receiver: string): void {
    this.socket.emit('sendMessage', { message, receiver });
  }

  // ✅ Listen for new messages
  receiveMessage(callback: (msg: any) => void): void {
    this.socket.on('newMessage', callback);
  }

  // ✅ Mark messages as read
  markMessagesAsRead(sender: string): void {
    this.socket.emit('readMessages', { sender });
  }

  // ✅ Listen for unread message updates
  receiveUnreadMessages(callback: (unreadMessages: { [key: string]: number }) => void): void {
    this.socket.on('updateUnreadCount', callback);
  }

  // ✅ Disconnect socket
  disconnect(): void {
    this.socket.disconnect();
  }
  getRoomMessages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/chat-room/messages`);
  }

  // Envoi d'un message dans la chat room via WebSocket

  sendRoomMessage(messageData: { message: string, sender: string }): void {
    this.socket.emit("sendRoomMessage", {
      message: messageData.message,
      sender: messageData.sender,
    });
  }

  // Recevoir des messages en temps réel dans la chat room
  receiveRoomMessage(callback: (msg: any) => void): void {
    this.socket.on('newMessage', callback);
  }
}
