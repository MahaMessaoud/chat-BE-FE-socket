
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';  // Pour appeler l'API de récupération des utilisateurs connectés
import { ChatService } from 'src/services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: any[] = [];  // Liste des messages
  newMessage: string = '';  // Nouveau message à envoyer
  receiver: string = '';  // Utilisateur avec qui discuter
  connectedUsers: string[] = [];  // Liste des utilisateurs connectés

  constructor(private chatService: ChatService, private http: HttpClient) {}

  ngOnInit(): void {
    // Appeler le service pour récupérer les utilisateurs connectés
    this.loadConnectedUsers();

    // Recevoir les nouveaux messages en temps réel via WebSocket
    this.chatService.receiveMessage((msg: any) => {
      this.messages.push(msg);
    });
  }

  // Méthode pour récupérer les utilisateurs connectés depuis l'API
  loadConnectedUsers(): void {
    this.http.get<string[]>('http://localhost:5000/api/connectedUsers')
      .subscribe(users => {
        this.connectedUsers = users;  // Stocker les utilisateurs connectés dans la propriété connectedUsers
      });
  }

  // Envoi d'un message
  sendMessage(): void {
    if (this.newMessage.trim() && this.receiver.trim()) {
      this.chatService.sendMessage(this.newMessage, this.receiver);  // Envoie du message via Socket.IO
      this.newMessage = '';  // Réinitialiser le champ du message
    }
  }

  // Charger les messages avec un utilisateur sélectionné
  loadMessages(): void {
    if (this.receiver.trim()) {
      this.chatService.getMessages(this.receiver).subscribe((data) => {
        this.messages = data;
      });
    }
  }
}
