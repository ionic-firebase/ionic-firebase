import { Component, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { BondService } from '../../../services/bond/bond.service';
import { SettingsService } from '../../../services/settings/settings.service';
import { Bond } from '../../../models/bond';
import { Reorder } from '../../../models/reorder';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ToastService } from '../../../services/toast/toast.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-bond-list',
  templateUrl: './bond-list.component.html',
  styleUrls: ['./bond-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class BondListComponent  implements OnInit {

  bondList: Bond[];
  bondTransactionList: any[];
  bondTransaction: any;
  bondTotal: number;
  bondIncome: number;

  private bondSubscription: any;
  private bondTransactionsSubscription: any;
  private settingsSubscription: any;

  reorder: Reorder[];

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private bondService: BondService,
    private settingsService: SettingsService,
    private toastService: ToastService,
    private actionCtrl: ActionSheetController,
    private alertController: AlertController,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewDidEnter() {

    this.bondSubscription = this.bondService.getRealtimeBonds()
    .subscribe((bonds: Bond[]) => {
      this.bondTotal = 0;
      this.bondIncome = 0;
      this.bondList = bonds;
      if (this.bondList) {
        this.bondList.forEach((bond: Bond) => {
          this.bondTotal = this.bondTotal + bond.balance;
          this.bondIncome = this.bondIncome + bond.annualinterest;
        });
      }
    });
  }

  createBond() {
    this.navController.navigateForward('/bonds/bond-create');
  }

  async deleteBondItem(
    bondId: string,
  ) {
    const alert = await this.alertController.create({
      message: `Delete bond`,
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
            this.bondService.deleteBond(bondId)
            .then(() => {
              this.bondTransactionsSubscription = this.bondService.getBondTransactions(bondId)
              .pipe(take(1))
              .subscribe(snapTransactions => {
                this.bondTransactionList = snapTransactions;
                this.bondTransactionList.forEach(transaction => {
                  this.bondTransaction = transaction;
                  const transactionId = this.bondTransaction.id;
                  this.bondService.deleteBondTransaction(bondId, transactionId);
                });
              });
              this.reorder = [];
              this.settingsSubscription = this.settingsService.getReorderByItemId(bondId)
              .pipe(take(1))
              .subscribe(snapReorder => {
                this.reorder[0] = snapReorder;
                if (this.reorder[0] !== undefined) {
                  const id = this.reorder[0].id;
                  if (id !== undefined) {
                    this.settingsService.deleteReorder(id).then(res => {
                      this.toastService.displayToast('Bond deleted.');
                      this.navController.navigateBack(`/bonds/bond-list`);
                    });
                  }
                }
              });
            });
          },
        },
      ],
    });
    await alert.present();
  }

  openMenu(
    id: string,
  ) {
    this.actionCtrl.create({
      buttons: [
        {
          text: 'List Transactions & Interest',
          handler: () => {
            this.navController.navigateForward(`/bonds/bond-list-transactions/${id}`);
          }
        },
        {
          text: 'Add Transaction & Interest',
          handler: () => {
            this.navController.navigateForward(`/bonds/bond-transaction/${id}`);
          }
        },
        {
          text: 'Edit Bond',
          handler: () => {
            this.navController.navigateForward(`/bonds/bond-update/${id}`);
          }
        },
        {
          text: 'Delete Bond',
          handler: () => {
            this.deleteBondItem(id);
          }
        },
        {
          text: 'Move Funds',
          handler: () => {
            this.navController.navigateForward(`/bonds/bond-move-funds/${id}`);
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
    if (this.bondSubscription) {
      this.bondSubscription.unsubscribe();
    }
    if (this.bondTransactionsSubscription) {
      this.bondTransactionsSubscription.unsubscribe();
    }
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }
}
