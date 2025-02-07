
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChatService } from 'src/services/chat.service';
import { MatSnackBar } from '@angular/material/snack-bar'; // Snackbar service

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  // messages: any[] = [];
  // newMessage: string = '';
  // receiver: string = '';
  // connectedUsers: string[] = [];
  // allUsers: string[] = []; // All users from the database

  // constructor(private chatService: ChatService, private http: HttpClient) {}

  // ngOnInit(): void {
  //   this.loadConnectedUsers();
  //   this.loadAllUsers(); // Fetch all users, connected or not

  //   this.chatService.receiveMessage((msg: any) => {
  //     console.log('Received message:', msg);
  //     this.messages.push({
  //       sender: msg.sender,
  //       message: msg.message,
  //       createdAt: msg.createdAt
  //     });
  //   });

  //   this.loadMessages(); // Load initial messages on component init
  // }

  // loadConnectedUsers(): void {
  //   this.http.get<string[]>('http://localhost:5000/api/connectedUsers')
  //     .subscribe(users => {
  //       this.connectedUsers = users;
  //     });
  // }

  // loadAllUsers(): void {
  //   this.http.get<string[]>('http://localhost:5000/api/users') // Fetch all users
  //     .subscribe(users => {
  //       this.allUsers = users;
  //     });
  // }

  // sendMessage(): void {
  //   if (this.newMessage.trim() && this.receiver.trim()) {
  //     this.chatService.sendMessage(this.newMessage, this.receiver);
  //     this.newMessage = '';
  //     this.loadMessages(); // Refresh messages after sending
  //   }
  // }

  // loadMessages(): void {
  //   if (this.receiver.trim()) {
  //     this.chatService.getMessages(this.receiver).subscribe((data) => {
  //       this.messages = Array.isArray(data) ? data.map((msg: any) => ({
  //         sender: msg.sender.username, // Access username from populated sender
  //         message: msg.content,         // Access content (not message)
  //         createdAt: msg.createdAt
  //       })) : [];
  //     });
  //   }
  // }
  messages: any[] = [];
  newMessage: string = '';
  receiver: string = '';
  connectedUsers: string[] = [];
  allUsers: string[] = [];

  constructor(
    private chatService: ChatService,
    private http: HttpClient,
    private snackBar: MatSnackBar // Inject the snackBar service
  ) {}

  ngOnInit(): void {
    this.loadConnectedUsers();
    this.loadAllUsers();

    // Receive messages from WebSocket
    this.chatService.receiveMessage((msg: any) => {
      this.messages.push({
        sender: msg.sender,
        message: msg.message,
        createdAt: msg.createdAt
      });
    });

    // Check for unread messages on component load
    this.checkForUnreadMessages();
  }

  // Load connected users
  loadConnectedUsers(): void {
    this.http.get<string[]>('http://localhost:5000/api/connectedUsers')
      .subscribe(users => {
        this.connectedUsers = users;
      });
  }

  // Load all users from the database (connected or not)
  loadAllUsers(): void {
    this.http.get<string[]>('http://localhost:5000/api/users')
      .subscribe(users => {
        this.allUsers = users;
      });
  }

  // Send a new message
  sendMessage(): void {
    if (this.newMessage.trim() && this.receiver.trim()) {
      this.chatService.sendMessage(this.newMessage, this.receiver);
      this.newMessage = '';
      this.loadMessages();
    }
  }

  // Load messages for a specific receiver
  loadMessages(): void {
    if (this.receiver.trim()) {
      this.chatService.getMessages(this.receiver).subscribe((data) => {
        this.messages = Array.isArray(data) ? data.map((msg: any) => ({
          sender: msg.sender.username,
          message: msg.content,
          createdAt: msg.createdAt
        })) : [];
      });
    }
  }

  // Check if there are unread messages for the current user
  checkForUnreadMessages(): void {
    this.http.get<any[]>('http://localhost:5000/api/unreadMessages').subscribe(messages => {
      if (messages.length > 0) {
        // Show a snackbar notification
        this.snackBar.open('You have unread messages!', 'Close', {
          duration: 5000, // 5 seconds
        });
      }
    });
  }
}
