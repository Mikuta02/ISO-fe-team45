import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatService, GroupDto, MessageDto } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

type Mode = 'private' | 'group';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  // zajedničko
  mode: Mode = 'private';

  // private chat
  followedUsers: any[] = [];
  selectedUser: any | null = null;
  privateMessages: MessageDto[] = [];
  privateInput = '';

  // group chat
  myGroups: GroupDto[] = [];
  selectedGroup: GroupDto | null = null;
  groupMessages: MessageDto[] = [];
  groupInput = '';
  newMemberUsername: string = '';

  // state
  modalRef?: NgbModalRef;
  groupWsSub?: Subscription;
  privateWsSub?: Subscription;

  constructor(
    private chat: ChatService,
    private users: UserService,
    private modal: NgbModal,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.chat.connect();

    // privatni stream
    this.privateWsSub = this.chat.onPrivateMessage().subscribe((msg) => {
      if (!this.selectedUser) return;

      const me = this.auth.getUser().sub;
      const isForCurrent =
        (msg.sender === this.selectedUser.username && msg.receiver === me) ||
        (msg.receiver === this.selectedUser.username && msg.sender === me);

      if (isForCurrent && this.mode === 'private') {
        this.privateMessages.push(msg);
        this.scrollToBottom();
      }
    });

    // inicijalni podaci
    this.loadFollowed();
    this.loadMyGroups();
  }

  ngOnDestroy(): void {
    this.privateWsSub?.unsubscribe();
    this.groupWsSub?.unsubscribe();
    if (this.selectedGroup) this.chat.dropGroupSubscription(this.selectedGroup.id);
    this.chat.disconnect();
  }

  /* ======= helpers ======= */

  me(): string {
    return this.auth.getUser().sub;
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const el = document.querySelector('.chat-messages') as HTMLElement | null;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }

  /* ======= PRIVATE CHAT ======= */

  loadFollowed(): void {
    const userId = Number(localStorage.getItem('userId'));
    this.users.getFollowers(userId).subscribe({
      next: (users) => (this.followedUsers = users),
      error: (e) => console.error(e),
    });
  }

  openPrivate(content: any, user: any): void {
    this.mode = 'private';
    this.selectedUser = user;
    this.privateMessages = [];
    this.chat.getPrivateHistory(user.username).subscribe({
      next: (history) => {
        this.privateMessages = [...history].sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));
        this.modalRef = this.modal.open(content, { size: 'lg', backdrop: 'static', keyboard: false });
        this.scrollToBottom();
      },
      error: (e) => console.error(e),
    });
  }

  sendPrivate(): void {
    if (!this.selectedUser || !this.privateInput.trim()) return;
    this.chat.sendPrivateMessage(this.selectedUser.username, this.privateInput.trim());
    this.privateInput = '';
  }

  /* ======= GROUP CHAT ======= */

  loadMyGroups(): void {
    this.chat.getMyGroups().subscribe({
      next: (gs) => (this.myGroups = gs),
      error: (e) => console.error(e),
    });
  }

  openGroup(content: any, g: GroupDto): void {
    this.mode = 'group';
    this.selectedGroup = { ...g, admin: (g as any).adminUsername ?? g.admin, members: [] };
    this.groupMessages = [];

    // 1) Učitaj meta & members kako bi canSendToGroup radio
    this.chat.getGroupInfo(g.id).subscribe({
      next: (meta) => {
        // copy preko postojećeg objekta
        this.selectedGroup = { ...this.selectedGroup!, name: meta.name, admin: (meta as any).adminUsername ?? meta.admin };
      },
      error: (e) => console.error(e),
    });

    this.chat.getGroupMembers(g.id).subscribe({
      next: (mems) => {
        this.selectedGroup = { ...this.selectedGroup!, members: mems.map(m => m.username) };
      },
      error: (e) => console.error(e),
    });

    // 2) REST istorija – backend brani pristup ne-članovima
    this.chat.getGroupHistory(g.id).subscribe({
      next: (history) => {
        this.groupMessages = [...history].sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

        // 3) WS sub samo za ovaj groupId
        this.groupWsSub?.unsubscribe();
        this.chat.dropGroupSubscription(g.id);
        this.groupWsSub = this.chat.ensureGroupSubscription(g.id).subscribe((msg) => {
          if (msg.group && msg.groupId === g.id && this.mode === 'group' && this.selectedGroup?.id === g.id) {
            this.groupMessages.push(msg);
            this.scrollToBottom();
          }
        });

        this.modalRef = this.modal.open(content, { size: 'lg', backdrop: 'static', keyboard: false });
        this.scrollToBottom();
      },
      error: (e) => {
        console.error(e);
        alert('Nemate pristup toj grupi.');
      },
    });
  }

  canSendToGroup(): boolean {
    if (!this.selectedGroup) return false;
    const g = this.selectedGroup;
    return !!g.members && g.members.includes(this.me());
  }

  isGroupAdmin(): boolean {
    return !!this.selectedGroup && this.selectedGroup.admin === this.me();
  }

  sendGroup(): void {
    if (!this.selectedGroup || !this.groupInput.trim()) return;
    if (!this.canSendToGroup()) return;
    this.chat.sendGroupMessage(this.selectedGroup.id, this.groupInput.trim());
    this.groupInput = '';
  }

  leaveGroup(): void {
    if (!this.selectedGroup) return;
    this.chat.leaveGroup(this.selectedGroup.id).subscribe({
      next: () => {
        this.modalRef?.close();
        this.chat.dropGroupSubscription(this.selectedGroup!.id);
        this.selectedGroup = null;
        this.loadMyGroups();
      },
      error: (e) => {
        console.error(e);
        alert('Nije uspelo napuštanje grupe.');
      },
    });
  }

  kickUser(u: string): void {
    if (!this.selectedGroup) return;
    if (!this.isGroupAdmin()) return;
    this.chat.removeMember(this.selectedGroup.id, u).subscribe({
      next: () => {
        const idx = this.selectedGroup!.members.indexOf(u);
        if (idx >= 0) this.selectedGroup!.members.splice(idx, 1);
      },
      error: (e) => {
        console.error(e);
        alert('Nije uspelo uklanjanje člana.');
      },
    });
  }

  onCreateGroup(name: string) {
    if (!name.trim()) return;
    // možeš proslediti i početne članove: this.chat.createGroup(name, ["alice","bob"])
    this.chat.createGroup(name).subscribe({
      next: (g) => {
        console.log('Group created:', g);
        alert(`Group "${g.name}" created (id=${(g as any).id}).`);
        this.loadMyGroups();
      },
      error: (err) => {
        console.error('Create group failed', err);
        alert('Failed to create group');
      }
    });
  }

  /** ======= DODATO: admin unosi username i dodaje člana ======= */
  addUserToGroup(): void {
    if (!this.selectedGroup) return;
    if (!this.isGroupAdmin()) return;

    const username = this.newMemberUsername.trim();
    if (!username) return;

    // već u članovima?
    if (this.selectedGroup.members?.includes(username)) {
      alert('Korisnik je već član grupe.');
      return;
    }

    this.chat.addMember(this.selectedGroup.id, username).subscribe({
      next: () => {
        // lokalno osveži listu članova
        if (!this.selectedGroup!.members) this.selectedGroup!.members = [];
        this.selectedGroup!.members.push(username);
        this.newMemberUsername = '';
      },
      error: (e) => {
        console.error(e);
        alert('Dodavanje člana nije uspelo (proveri da li korisnik postoji i da li si admin).');
      }
    });
  }
}
