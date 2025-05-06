import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
      this.router.navigate(['/dashboard']);
    }
  }

  login(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Only allow admin user (userpromodash@gmail.com)
    if (this.email === 'userpromodash@gmail.com' && this.password === environment.password) {
      // Simulate API call delay
      setTimeout(() => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', this.email);
        this.router.navigate(['/dashboard']);
        this.isLoading = false;
      }, 800);
    } else {
      setTimeout(() => {
        this.errorMessage = 'Invalid credentials. Only admin access is allowed.';
        this.isLoading = false;
      }, 800);
    }
  }
}