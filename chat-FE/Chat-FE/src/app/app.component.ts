import { Component, OnDestroy, OnInit } from '@angular/core';
import { WebsocketService } from 'src/services/websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',

  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  messages: string[] = [];
  newMessage: string = '';

  constructor(private wsService: WebsocketService) {}

  ngOnInit() {
    this.wsService.onNewMessage().subscribe((message: string) => {
      this.messages.push(message);
    });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.wsService.sendMessage(this.newMessage);
      this.newMessage = '';
    }
  }

  ngOnDestroy() {
    this.wsService.disconnect();
  }
}
