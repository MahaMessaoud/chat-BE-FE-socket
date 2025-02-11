
import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/services/chat.service';
import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  messages: any[] = [];
  newMessage: string = '';
  receiver: string = '';
  connectedUsers: string[] = [];
  allUsers: string[] = [];
  unreadMessages: { [key: string]: number } = {};
  currentUser: string | null = '';

  constructor(private chatService: ChatService, private authService: AuthService) {}

  ngOnInit(): void {
    this.getCurrentUser();
    this.loadAllUsers();

    this.chatService.getUserStatusUpdates().subscribe((users) => {
      this.connectedUsers = users;
    });

    this.chatService.receiveMessage((msg: any) => {
      this.messages.push({
        sender: msg.sender || 'Inconnu',
        message: msg.message || msg.content || '',
        createdAt: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : 'Heure inconnue'
      });
      if (msg.sender !== this.currentUser && msg.receiver === this.currentUser) { // Check if message is for current user and not from current user
        this.incrementUnread(msg.sender);
      }
    });

    this.loadMessages();
  }

  getCurrentUser(): void {
    this.currentUser = this.authService.getUsername();
  }

  loadAllUsers(): void {
    this.chatService.getAllUsers().subscribe((users) => {
      this.allUsers = users;
    });
  }

  isUserOnline(username: string): boolean {
    return this.connectedUsers.includes(username);
  }

  selectUser(username: string): void {
    this.receiver = username;
    this.loadMessages();
    this.chatService.markMessagesAsRead(this.receiver);
    this.unreadMessages[this.receiver] = 0;
  }

  loadMessages(): void {
    if (this.receiver.trim()) {
      this.chatService.getMessages(this.receiver).subscribe((data) => {
        this.messages = Array.isArray(data)
          ? data.map((msg: any) => ({
              sender: msg.sender?.username || msg.sender || 'Inconnu',
              message: msg.message || msg.content || '',
              createdAt: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : 'Heure inconnue'
            }))
          : [];
      });

      this.chatService.markMessagesAsRead(this.receiver);
      this.unreadMessages[this.receiver] = 0;
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.receiver.trim()) {
      this.chatService.sendMessage(this.newMessage, this.receiver);
      this.messages.push({
        sender: 'Moi',
        message: this.newMessage,
        createdAt: new Date().toLocaleTimeString()
      });
      this.newMessage = '';
    }
  }

  hasUnreadMessages(user: string): boolean {
    return this.unreadMessages[user] > 0;
  }

  incrementUnread(user: string) {
    this.unreadMessages[user] = (this.unreadMessages[user] || 0) + 1;
  }
}
