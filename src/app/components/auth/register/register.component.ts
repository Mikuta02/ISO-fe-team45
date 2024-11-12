import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  usernameTaken: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private userService: UserService, private router: Router) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onUsernameChange(): void {
    const username = this.registerForm.get('username')?.value;
    if (username) {
      this.userService.isUsernameTaken(username).subscribe({
        next: (isTaken) => {
          this.usernameTaken = isTaken;
        },
        error: (err) => {
          console.error('Failed to check username availability', err);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.usernameTaken) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Registration successful', response);
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Registration failed', err);
        }
      });
    }
  }
}
