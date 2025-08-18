import { Injectable, NgZone } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

export interface MessageDto {
  sender: string;
  receiver: string;
  content: string;
  group: boolean;     // privatne = false
  timestamp: string;  // ISO iz backend-a
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private stompClient: Client | null = null;
  private privateMsg$ = new Subject<MessageDto>();
  private connected = false;

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private zone: NgZone,         // <<< da bi callback bio u Angular zoni
  ) {}

  connect(): void {
    if (this.connected) return;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
      connectHeaders: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      debug: (msg) => console.log(msg),
    });

    this.stompClient.onConnect = () => {
      this.connected = true;

      const me = this.auth.getUser().sub; // npr. "testuser1"
      const myTopic = `/private-message/${me}`;

      console.log('[WS] Connected. Subscribing to', myTopic);

      this.stompClient!.subscribe(myTopic, (frame: IMessage) => {
        this.zone.run(() => {
          const payload: MessageDto = JSON.parse(frame.body);
          console.log('[WS] MESSAGE received:', payload);
          this.privateMsg$.next(payload);
        });
      });
    };

    this.stompClient.onWebSocketClose = () => { this.connected = false; };

    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.connected = false;
    }
  }

  sendPrivateMessage(receiverUsername: string, content: string): void {
    if (!this.stompClient) return;
    const message: Partial<MessageDto> = {
      sender: this.auth.getUser().sub,
      receiver: receiverUsername,
      content,
      group: false,
    };
    this.stompClient.publish({
      destination: '/app/private-message',
      body: JSON.stringify(message),
    });
  }

  getPrivateMessages(): Observable<MessageDto> {
    return this.privateMsg$.asObservable();
  }

  getChatHistory(recipientUsername: string): Observable<MessageDto[]> {
    return this.http.get<MessageDto[]>(
      `http://localhost:8080/api/chat/${this.auth.getUser().sub}/history/${recipientUsername}`
    );
  }
}
