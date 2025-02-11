import { Component } from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { ChatService } from 'src/services/chat.service';

@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.scss']
})
export class ChatroomComponent {
  messages: any[] = [];
  newMessage: string = '';
  currentUser: string | null = '';

  constructor(private chatService: ChatService, private authService: AuthService) {}

  ngOnInit(): void {
    this.getCurrentUser();
    this.loadMessages();

    this.chatService.receiveRoomMessage((msg: any) => {
      const sender = String(msg.sender); // Convert to string

      this.messages.push({
          sender: sender || 'Inconnu',  // Use the converted string
          content: msg.message || msg.content || '',
          createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
      });

      console.log("Messages array:", this.messages);
  });
  }

  getCurrentUser(): void {
    this.currentUser = this.authService.getUsername();
  }

  loadMessages(): void {
    this.chatService.getRoomMessages().subscribe((data) => {
      this.messages = data;
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      const sender = this.currentUser || 'Unknown';  // Assurer que le sender est une chaîne de caractères
      const messageData = {
        message: this.newMessage,
        sender: sender,
      };
      this.chatService.sendRoomMessage(messageData); // Passer l'objet avec message et sender
      this.newMessage = '';  // Réinitialiser le champ du message
    }
  }



}
