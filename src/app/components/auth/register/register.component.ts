import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  usernameTaken: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

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
          this.successMessage = 'Registration successful! Redirecting to login page...';
          this.errorMessage = null; // Reset error message
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000); // Automatski prelazak nakon 3 sekunde
        },
        error: (err) => {
          console.error('Registration failed', err);
          // Različite poruke na osnovu odgovora sa servera
          if (err.status === 400 && err.error === 'Username already in use') {
            this.errorMessage = 'Username is already taken. Please choose another.';
          } else if (err.status === 500) {
            this.errorMessage = 'Internal server error. Please try again later.';
          } else {
            this.errorMessage = 'An unexpected error occurred. Please try again.';
          }
          this.successMessage = null; // Reset success message
        }
      });
    }
  }
}
