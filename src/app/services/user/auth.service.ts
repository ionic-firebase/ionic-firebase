import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  updateProfile,
  getAuth,
} from '@angular/fire/auth';
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);

  getUser(): User | null {
    return this.auth.currentUser;
  }

  getUser$(): Observable<User | null> {
    return of(this.getUser());
  }

  login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signup(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  async updateTaxYear(taxyearkey: string): Promise<any> {
    try {
      const auth = getAuth();
      if(auth.currentUser != null) {
        await updateProfile(auth.currentUser, {
          displayName: taxyearkey
        })
      }
    } catch (error) {
      console.log('updateTaxYear Transaction failed: ', error);
      throw error;
    }
  }
}
