import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private stompClient: Client | null = null;
  private messageSubject: Subject<{ sender: string; content: string; group: boolean }> = new Subject();
  private groupMessageSubject: Subject<any> = new Subject<any>();
  private connected = false;

  constructor(
      private authService: AuthService, // Ukoliko je potrebno, može se dodati servis za autentikaciju
      private http: HttpClient,
  ) {}

  /**
   * Povezivanje na WebSocket server.
   */
  connect(): void {
    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws', // WebSocket URL
      reconnectDelay: 5000, // Automatsko povezivanje nakon prekida
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,  // Dodavanje tokena
      },
      debug: (msg) => console.log(msg), // Debug logovi za praćenje
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket server:', frame);
      this.connected = true;

      // Pretplata na globalni kanal
      this.subscribeToChannel('/private-message/' + this.authService.getUser().sub); // Pretpostavka da je korisničko ime sačuvano u localStorage
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported an error:', frame.headers['message']);
    };

    this.stompClient.onWebSocketClose = () => {
      console.warn('WebSocket connection closed');
      this.connected = false;
    };

    this.stompClient.activate(); // Pokreće konekciju
  }

  /**
   * Pretplata na kanal
   * @param channel WebSocket kanal
   */
  private subscribeToChannel(channel: string): void {
    if (this.stompClient) {
      this.stompClient.subscribe(channel, (message: IMessage) => {
        console.log('Received message:', message);
        const body = JSON.parse(message.body);
        const messageData = {
          sender: body.sender,
          content: body.content,
          group: body.group,
        };
        console.log('Received message:', messageData);
        this.messageSubject.next(messageData);
      });
    }
  }

  /**
   * Pretplata na grupne poruke.
   * @param groupId ID grupe
   */
  subscribeToGroup(groupId: string): void {
    if (this.stompClient) {
      this.stompClient.subscribe(`/topic/group/${groupId}`, (message: IMessage) => {
        const body = JSON.parse(message.body);
        this.groupMessageSubject.next(body);
      });
    }
  }

  /**
   * Slanje privatne poruke drugom korisniku.
   * @param recipientUsername Korisničko ime primaoca
   * @param content Sadržaj poruke
   */
  sendPrivateMessage(recipientUsername: string, content: string): void {
    console.log('Sending private message to:', recipientUsername, 'Content:', content, 'Sender:', this.authService.getUser().sub);
    if (this.stompClient && this.stompClient.connected) {
      const message = {
        receiver: recipientUsername,
        sender: this.authService.getUser().sub, // Pretpostavka da je korisničko ime sačuvano u localStorage
        content: content,
        group: false,
      };
      this.stompClient.publish({
        destination: `app/private-message/${recipientUsername}`,
        body: JSON.stringify(message),
      });
    } else {
      console.error('WebSocket connection is not active.');
    }
  }

  /**
   * Slanje poruke grupi.
   * @param groupId ID grupe
   * @param content Sadržaj poruke
   */
  sendGroupMessage(groupId: string, content: string): void {
    if (this.stompClient && this.stompClient.connected) {
      const message = {
        groupId: groupId,
        content: content,
        group: true,
      };
      this.stompClient.publish({
        destination: `/app/group/${groupId}`,
        body: JSON.stringify(message),
      });
    } else {
      console.error('WebSocket connection is not active.');
    }
  }

  /**
   * Dohvatanje poruka
   * @returns Observable za privatne poruke
   */
  getPrivateMessages(): Observable<{ sender: string; content: string; group: boolean }> {
    return this.messageSubject.asObservable();
  }

  /**
   * Dohvatanje grupnih poruka
   * @returns Observable za grupne poruke
   */
  getGroupMessages(): Observable<any> {
    return this.groupMessageSubject.asObservable();
  }

  /**
   * Diskonektovanje sa WebSocket servera.
   */
  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      console.log('WebSocket connection closed.');
      this.connected = false;
    }
  }

  /**
   * Proverava da li je WebSocket konekcija aktivna
   * @returns `true` ako je aktivna, `false` inače
   */
  isConnected(): boolean {
    return this.connected;
  }

  getChatHistory(recipientUsername: string): Observable<{ sender: string; content: string; group: boolean }[]> {
    return this.http.get<{ sender: string; content: string; group: boolean }[]>(
      `http://localhost:8080/api/chat/${this.authService.getUser().sub}/history/${recipientUsername}`
    );
  }

}
