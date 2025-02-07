
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChatService } from 'src/services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: any[] = [];
  newMessage: string = '';
  receiver: string = '';
  connectedUsers: string[] = [];
  allUsers: string[] = []; // All users from the database

  constructor(private chatService: ChatService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadConnectedUsers();
    this.loadAllUsers(); // Fetch all users, connected or not

    this.chatService.receiveMessage((msg: any) => {
      console.log('Received message:', msg);
      this.messages.push({
        sender: msg.sender,
        message: msg.message,
        createdAt: msg.createdAt
      });
    });

    this.loadMessages(); // Load initial messages on component init
  }

  loadConnectedUsers(): void {
    this.http.get<string[]>('http://localhost:5000/api/connectedUsers')
      .subscribe(users => {
        this.connectedUsers = users;
      });
  }

  loadAllUsers(): void {
    this.http.get<string[]>('http://localhost:5000/api/users') // Fetch all users
      .subscribe(users => {
        this.allUsers = users;
      });
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.receiver.trim()) {
      this.chatService.sendMessage(this.newMessage, this.receiver);
      this.newMessage = '';
      this.loadMessages(); // Refresh messages after sending
    }
  }

  loadMessages(): void {
    if (this.receiver.trim()) {
      this.chatService.getMessages(this.receiver).subscribe((data) => {
        this.messages = Array.isArray(data) ? data.map((msg: any) => ({
          sender: msg.sender.username, // Access username from populated sender
          message: msg.content,         // Access content (not message)
          createdAt: msg.createdAt
        })) : [];
      });
    }
  }
}
