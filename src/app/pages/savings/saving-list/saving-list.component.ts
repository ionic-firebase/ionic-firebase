import { Component, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { SavingsService } from '../../../services/savings/savings.service';
import { SettingsService } from '../../../services/settings/settings.service';
import { Saving } from '../../../models/saving';
import { Transaction } from '../../../models/transaction';
import { Reorder } from '../../../models/reorder';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ToastService } from '../../../services/toast/toast.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-saving-list',
  templateUrl: './saving-list.component.html',
  styleUrls: ['./saving-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class SavingListComponent  implements OnInit {

  savingsList: Saving[];
  savingTransactionsList: Transaction[];
  savingTransaction: Transaction;
  savingBalances: number;
  savingIncomes: number;

  private savingsSubscription: any;
  private savingTransactionsSubscription: any;

  private settingsSubscription: any;

  reorder: Reorder[];

  private readonly AuthService = inject(AuthService);
  private readonly user$ = this.AuthService.getUser();

  constructor(
    private savingsService: SavingsService,
    private settingsService: SettingsService,
    private toastService: ToastService,
    private actionCtrl: ActionSheetController,
    private alertController: AlertController,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {

    this.savingsSubscription = this.savingsService.getRealtimeSavings()
    .subscribe((savings: Saving[]) => {
      this.savingBalances = 0;
      this.savingIncomes = 0;
      this.savingsList = savings;
      if (this.savingsList) {
        this.savingsList.forEach((saving: Saving) => {
          this.savingBalances = this.savingBalances + saving.balance;
          this.savingIncomes = this.savingIncomes + saving.annualinterest;
        });
      }
    });
  }

  createSaving() {
    this.navController.navigateForward('/savings/saving-create');
  }

  async deleteSavingItem(
    savingId: string,
  ) {
    const alert = await this.alertController.create({
      message: `Delete saving?`,
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
            this.savingsService.deleteSaving(savingId)
            .then(() => {
              this.savingTransactionsSubscription = this.savingsService.getSavingTransactions(savingId)
              .pipe()
              .subscribe((transactions: Transaction[]) => {
                this.savingTransactionsList = transactions;
                this.savingTransactionsList.forEach((transaction: Transaction) => {
                  this.savingTransaction = transaction;
                  if(this.savingTransaction != undefined) {
                    const transactionId = this.savingTransaction.id;
                    this.savingsService.deleteSavingTransaction(savingId, transactionId);
                  }
                });
              });
              this.reorder = [];
              this.settingsSubscription = this.settingsService.getReorderByItemId(savingId)
              .pipe(take(1))
              .subscribe((reorder: Reorder) => {
                this.reorder[0] = reorder;
                if (this.reorder[0] !== undefined) {
                  const id = this.reorder[0].id;
                  if (id !== undefined) {
                    this.settingsService.deleteReorder(id).then(res => {
                      this.toastService.displayToast('Saving deleted.');
                      this.navController.navigateBack(`/savings/saving-list`);
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
            this.navController.navigateForward(`/savings/saving-list-transactions/${id}`);
          }
        },
        {
          text: 'Add Transaction & Interest',
          handler: () => {
            this.navController.navigateForward(`/savings/saving-transaction/${id}`);
          }
        },
        {
          text: 'Edit Saving',
          handler: () => {
            this.navController.navigateForward(`/savings/saving-update/${id}`);
          }
        },
        {
          text: 'Delete Saving',
          handler: () => {
            this.deleteSavingItem(id);
          }
        },
        {
          text: 'Move Funds',
          handler: () => {
            this.navController.navigateForward(`/savings/saving-move-funds/${id}`);
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
    if (this.savingsSubscription) {
      this.savingsSubscription.unsubscribe();
    }
    if (this.savingTransactionsSubscription) {
      this.savingTransactionsSubscription.unsubscribe();
    }
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }
}
