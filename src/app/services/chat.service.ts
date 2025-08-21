import { Injectable, NgZone } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface MessageDto {
  id?: number;
  sender: string;
  receiver: string | null;
  content: string;
  group: boolean;
  groupId?: number | null;
  timestamp: string; // ISO
}

export interface GroupDto {
  id: number;
  name: string;
  admin: string;      // admin username (mapira se iz GroupChat.adminUsername)
  members: string[];  // popunjavamo ručno preko /members
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private stomp: Client | null = null;
  private connected = false;

  private privateStream$ = new Subject<MessageDto>();
  private groupStreams = new Map<number, Subject<MessageDto>>();
  private groupSubs = new Map<number, StompSubscription>();

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private zone: NgZone
  ) {}

  /* ============= WS connect ============= */

  connect(): void {
    if (this.connected) return;

    this.stomp = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
      connectHeaders: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      debug: (m) => console.log(m),
    });

    this.stomp.onConnect = () => {
      this.connected = true;
      const me = this.auth.getUser().sub;
      this.stomp!.subscribe(`/private-message/${me}`, (frame: IMessage) => {
        this.zone.run(() => this.privateStream$.next(JSON.parse(frame.body)));
      });
    };

    this.stomp.onWebSocketClose = () => {
      this.connected = false;
      this.groupSubs.forEach((sub) => sub.unsubscribe());
      this.groupSubs.clear();
    };

    this.stomp.activate();
  }

  disconnect(): void {
    if (this.stomp) {
      this.stomp.deactivate();
      this.connected = false;
    }
  }

  /* ============= Private chat ============= */

  sendPrivateMessage(receiverUsername: string, content: string): void {
    if (!this.stomp) return;
    const me = this.auth.getUser().sub;
    const body = {
      sender: me,                 // Fallback za backend kad nema Principal-a
      receiver: receiverUsername,
      content,
      group: false,
    };
    this.stomp.publish({
      destination: '/app/private-message',
      body: JSON.stringify(body),
    });
  }

  onPrivateMessage(): Observable<MessageDto> {
    return this.privateStream$.asObservable();
  }

  getPrivateHistory(otherUsername: string): Observable<MessageDto[]> {
    // backend podržava obe rute; koristimo kraću
    return this.http.get<MessageDto[]>(`http://localhost:8080/api/chat/${encodeURIComponent(otherUsername)}/history`);
  }

  /* ============= Group chat ============= */

  ensureGroupSubscription(groupId: number): Observable<MessageDto> {
    let stream = this.groupStreams.get(groupId);
    if (!stream) {
      stream = new Subject<MessageDto>();
      this.groupStreams.set(groupId, stream);
    }
    if (this.stomp && !this.groupSubs.has(groupId)) {
      const sub = this.stomp.subscribe(`/topic/group/${groupId}`, (frame: IMessage) => {
        this.zone.run(() => stream!.next(JSON.parse(frame.body)));
      });
      this.groupSubs.set(groupId, sub);
    }
    return stream.asObservable();
  }

  dropGroupSubscription(groupId: number): void {
    const sub = this.groupSubs.get(groupId);
    if (sub) sub.unsubscribe();
    this.groupSubs.delete(groupId);
    this.groupStreams.delete(groupId);
  }

  sendGroupMessage(groupId: number, content: string): void {
    if (!this.stomp) return;
    const me = this.auth.getUser().sub;
    const body = { groupId, content, sender: me, group: true };
    this.stomp.publish({
      destination: '/app/group-message',
      body: JSON.stringify(body),
    });
  }

  getGroupHistory(groupId: number): Observable<MessageDto[]> {
    return this.http.get<MessageDto[]>(`http://localhost:8080/api/chat/group/${groupId}/history`);
  }

  getMyGroups(): Observable<GroupDto[]> {
    // vraća GroupChat[] sa adminUsername, bez members → members dopunjavamo pri otvaranju
    return this.http.get<GroupDto[]>(`http://localhost:8080/api/chat/groups/my`);
  }

  getGroupInfo(groupId: number): Observable<GroupDto> {
    return this.http.get<GroupDto>(`http://localhost:8080/api/chat/groups/${groupId}`);
  }

  getGroupMembers(groupId: number): Observable<{username: string}[]> {
    return this.http.get<{username: string}[]>(`http://localhost:8080/api/chat/groups/${groupId}/members`);
  }

  // admin
  addMember(groupId: number, username: string) {
    return this.http.post<void>(`http://localhost:8080/api/chat/groups/${groupId}/members/${encodeURIComponent(username)}`, {});
  }

  // admin
  removeMember(groupId: number, username: string) {
    return this.http.delete<void>(`http://localhost:8080/api/chat/groups/${groupId}/members/${encodeURIComponent(username)}`);
  }

  // member
  leaveGroup(groupId: number) {
    return this.http.post<void>(`http://localhost:8080/api/chat/groups/${groupId}/leave`, {});
  }

  // kreiranje grupe (opciono prosledi i members)
  createGroup(name: string, members?: string[]) {
    return this.http.post<GroupDto>(`http://localhost:8080/api/groups`, { name, members });
  }
}
