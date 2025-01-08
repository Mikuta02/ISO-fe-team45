import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          localStorage.setItem('token', response.token);
          this.errorMessage = null; // Resetovanje poruke o grešci na uspešan login
          this.router.navigate(['/profile']);
        },
        error: (err) => {
          console.error('Login failed', err);
          // Prikaz poruke o grešci
          if (err.status === 401) {
            this.errorMessage = 'Invalid username or password. Please try again.';
          } else if (err.status === 429) {
            this.errorMessage = 'Too many login attempts. Please wait and try again later.';
          } else {
            this.errorMessage = 'An unexpected error occurred. Please try again later.';
          }
        }
      });
    }
  }
}
