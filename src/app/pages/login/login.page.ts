import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { UserCredential } from '../../models/user';
import { AuthService } from 'src/app/services/user/auth.service';
import { AuthFormComponent } from 'src/app/components/auth-form/auth-form.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, AuthFormComponent],
})
export class LoginPage implements OnInit {
  @ViewChild(AuthFormComponent, { static: false }) loginForm: AuthFormComponent;
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {}
  
loginUser(Credential: UserCredential) {
    try {
      const userCredential = this.authService.login(
        Credential.email,
        Credential.password
      );
    } catch (error) {
    }
  }

  logout() {
    this.authService.logout();
    console.log('Logged out');
  }
}

