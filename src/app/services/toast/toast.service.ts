import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  public toast: any;

  constructor(
    private toastController: ToastController
  ) { }

  displayToast(
      message: string,
  ): void {
    this.toast = this.toastController.create({
      message: `${message}`,
      duration: 2000,
      position: 'middle'
    }).then((toastData) => {
      toastData.present();
    });
  }
}