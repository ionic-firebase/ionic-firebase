import { Component, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { PensionService } from '../../../services/pension/pension.service';
import { Pension } from '../../../models/pension';
import { Reorder } from '../../../models/reorder';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-pension-list',
  templateUrl: './pension-list.component.html',
  styleUrls: ['./pension-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class PensionListComponent  implements OnInit {
  pensionList: Pension[];
  pension: Pension;
  pensionIncomeTotal: number;
  private pensionsSubscription: any;
  private settingsSubscription: any;

  reorder: Reorder[];

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private pensionService: PensionService,
    private toastService: ToastService,
    private actionCtrl: ActionSheetController,
    private alertController: AlertController,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.pensionIncomeTotal = 0;
    this.pensionsSubscription = this.pensionService.getRealtimePensions()
    .subscribe((pensions: Pension[]) => {
      this.pensionList = pensions;
      if (this.pensionList) {
        this.pensionList.forEach(pension => {
          this.pension = pension;
          this.pensionIncomeTotal = this.pensionIncomeTotal + pension.annualincome;
        });
      }
    });
  }

  createPension() {
    this.navController.navigateForward('/pensions/pension-create');
  }

  async deletePensionItem(
    pensionId: string,
  ) {
    const alert = await this.alertController.create({
      message: `Delete pension?`,
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
            this.pensionService.deletePension(pensionId)
            .then(() => {
              this.toastService.displayToast('Pension deleted.');
              this.navController.navigateBack(`/pensions/pension-list`);
            });
          },
        },
      ],
    });

    await alert.present();
  }

  openMenu(
    id: string
  ) {
    this.actionCtrl.create({
      buttons: [
        {
          text: 'Edit Pension',
          handler: () => {
            this.navController.navigateForward(`/pensions/pension-update/${id}`);
          }
        },
        {
          text: 'Delete Pension',
          handler: () => {
            this.deletePensionItem(id);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(ac => ac.present());
  }

  ionViewDidLeave() {
    if (this.pensionsSubscription) {
      this.pensionsSubscription.unsubscribe();
    }
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }
}
