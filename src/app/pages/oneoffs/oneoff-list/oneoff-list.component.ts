import { Component, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { OneoffsService } from '../../../services/oneoffs/oneoffs.service';
import { Oneoff } from '../../../models/oneoff';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ToastService } from '../../../services/toast/toast.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-oneoff-list',
  templateUrl: './oneoff-list.component.html',
  styleUrls: ['./oneoff-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class OneoffListComponent  implements OnInit {
  slideOpts = {
    initialSlide: 0,
    speed: 300,
    shortSwipes: true
  };

  oneoffList: Oneoff[];
  oneoff: Oneoff;
  private oneoffsSubscription: any;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private oneoffsService: OneoffsService,
    private toastService: ToastService,
    private actionCtrl: ActionSheetController,
    private alertController: AlertController,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.oneoffsSubscription = this.oneoffsService.getRealtimeOneoffs()
    .subscribe((oneoffs: Oneoff[]) => {
      this.oneoffList = oneoffs;
      if (this.oneoffList) {
        this.oneoffList.forEach((oneoff: Oneoff) => {
          this.oneoff = oneoff;
        });
      }
    });
  }

  createOneoff() 
  {
    this.navController.navigateForward(`/oneoffs/oneoff-create`);
  }

  async deleteOneoff(
    oneoffId: string,
  ) {
    const alert = await this.alertController.create({
      message: `Delete oneoff item?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: blah => {
          },
        },
        {
          text: 'Ok',
          handler: () => {
            this.oneoffsService.deleteOneoff(oneoffId)
            .then(() => {
              this.toastService.displayToast('Oneoff item deleted');
              this.navController.navigateForward('/oneoffs/oneoff-list');
            });
          },
        },
      ],
    });

    await alert.present();
  }

  openMenu(id: string) {
    this.actionCtrl.create({
      buttons: [
        {
          text: 'Edit Oneoff',
          handler: () => {
            this.navController.navigateForward(`/oneoffs/oneoff-update/${id}`);
          }
        },
        {
          text: 'Delete Oneoff',
          handler: () => {
            this.deleteOneoff(id);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(ac => ac.present());
  }

  ionViewWillLeave() {
    if (this.oneoffsSubscription) {
      this.oneoffsSubscription.unsubscribe();
    }
  }
}
