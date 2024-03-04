import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { UserCredential } from 'src/app/models/user';
import { Settings } from 'src/app/models/settings';
import { SettingsService } from '../../services/settings/settings.service';


import { AuthService } from 'src/app/services/user/auth.service';
import 'firebase/auth';
import { AuthFormComponent } from 'src/app/components/auth-form/auth-form.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, AuthFormComponent],
})
export class SignupPage implements OnInit {
  @ViewChild(AuthFormComponent, { static: false })
  signupForm: AuthFormComponent;
  settings: Settings = new Settings();

  constructor(
    private authService: AuthService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit() {}

  async signupUser(credentials: UserCredential) {
    try {
      const userCredential = await this.authService.signup(
        credentials.email,
        credentials.password
      ).then(UserId => {

          console.log('userCredential = ', userCredential);

// Initialise database for user here


      });
    } catch (error) {
    }
  }
}
