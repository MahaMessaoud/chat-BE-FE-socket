
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

  constructor(private chatService: ChatService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadConnectedUsers();

    this.chatService.receiveMessage((msg: any) => {
      console.log('Received message:', msg);

      //  *** KEY CHANGE: Extract the message properties ***
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

  sendMessage(): void {
    if (this.newMessage.trim() && this.receiver.trim()) {
      this.chatService.sendMessage(this.newMessage, this.receiver);
      this.newMessage = '';
       this.loadMessages();// Refresh messages after sending
    }
  }

  loadMessages(): void {
    if (this.receiver.trim()) {
      this.chatService.getMessages(this.receiver).subscribe((data) => {
        // *** KEY CHANGE: Ensure data is an array and extract properties ***
        this.messages = Array.isArray(data) ? data.map((msg:any) => ({
          sender: msg.sender.username, // Access username from populated sender
          message: msg.content,         // Access content (not message)
          createdAt: msg.createdAt
        })) : [];
      });
    }
  }
}
