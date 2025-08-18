import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { ChatService, MessageDto } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  messageContent = '';
  messages: MessageDto[] = [];
  followedUsers: any[] = [];
  selectedUser: any | null = null;

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private modalService: NgbModal,
    protected authService: AuthService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.chatService.connect();

    this.chatService.getPrivateMessages().subscribe((message) => {
      if (!this.selectedUser) return;

      const me = this.authService.getUser().sub;
      const isForCurrentThread =
        (message.sender === this.selectedUser.username && message.receiver === me) ||
        (message.receiver === this.selectedUser.username && message.sender === me);

      if (isForCurrentThread) {
        this.zone.run(() => {   // <<< garantuje rerender
          this.messages.push(message);
          this.scrollToBottom();
        });
      }
    });
    this.loadFollowedUsers();
  }

  loadFollowedUsers(): void {
    const userId = Number(localStorage.getItem('userId'));
    this.userService.getFollowers(userId).subscribe({
      next: (users) => (this.followedUsers = users),
      error: (err) => console.error('Failed to load followed users', err),
    });
  }

  openChatModal(content: any, user: any): void {
    this.selectedUser = user;
    this.messages = [];
    this.getChatHistory();
    this.modalService.open(content, { backdrop: 'static', keyboard: false });
    setTimeout(() => this.scrollToBottom(), 200);
  }

  sendPrivateMessage(): void {
    if (this.selectedUser && this.messageContent.trim()) {
      const me = this.authService.getUser().sub;

      // Odmah prikaži u UI
      this.zone.run(() => {
        this.scrollToBottom();
      });

      // Pošalji serveru
      this.chatService.sendPrivateMessage(this.selectedUser.username, this.messageContent);

      // Očisti input
      this.messageContent = '';
    }
  }

  getChatHistory(): void {
    if (!this.selectedUser) return;

    this.chatService.getChatHistory(this.selectedUser.username).subscribe({
      next: (history) => {
        // backend šalje poslednjih 10 kao ASC (jer smo ih okrenuli u servisu).
        // Ako želiš sigurnost po vremenu:
        this.messages = [...history].sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));
        this.scrollToBottom();
      },
      error: (err) => console.error('Failed to load chat history', err),
    });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 50);
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
  }
}
