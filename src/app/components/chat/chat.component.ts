import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  messageContent: string = '';
  messages: { sender: string; content: string; group: boolean }[] = [];
  followedUsers: any[] = [];
  selectedUser: any | null = null;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private modalService: NgbModal,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chatService.connect();

    // Pretplata na privatne poruke
    this.chatService.getPrivateMessages().subscribe((message) => {
      console.log('Received private message:', message);
      if (message.sender === this.selectedUser?.username) {
        this.messages.push(message);
      }
    });

    // Učitavanje korisnika koje korisnik prati
    this.loadFollowedUsers();
  }

  loadFollowedUsers(): void {
    const userId = Number(localStorage.getItem('userId')); // Pretpostavka da se ID korisnika čuva u localStorage
    this.userService.getFollowers(userId).subscribe({
      next: (users) => {
        this.followedUsers = users;
      },
      error: (err) => console.error('Failed to load followed users', err),
    });
  }

  openChatModal(content: any, user: any): void {
    this.selectedUser = user;
    this.messages = []; // Resetuje poruke prilikom otvaranja novog četa
    this.getChatHistory();  // Preuzimanje prethodnih poruka
    this.modalService.open(content, { backdrop: 'static', keyboard: false });
  }

  sendPrivateMessage(): void {
    if (this.selectedUser && this.messageContent.trim()) {
      this.chatService.sendPrivateMessage(this.selectedUser.username, this.messageContent);
      this.messages.push({ sender: 'Me', content: this.messageContent, group: false });
      this.messageContent = '';
    }
  }

  getChatHistory(): void {
    if (this.selectedUser) {
      this.chatService.getChatHistory(this.selectedUser.username).subscribe({
        next: (history) => {
          this.messages = history.map((msg) => ({
            sender: msg.sender,
            content: msg.content,
            group: msg.group,
          }));
        },
        error: (err) => console.error('Failed to load chat history', err),
      });
    }
  }


  ngOnDestroy(): void {
    this.chatService.disconnect();
  }
}
