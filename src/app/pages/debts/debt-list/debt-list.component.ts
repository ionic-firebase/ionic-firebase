import { Component, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { DebtService } from '../../../services/debt/debt.service';
import { SettingsService } from '../../../services/settings/settings.service';
import { Debt } from '../../../models/debt';
import { Transaction } from '../../../models/transaction';
import { Reorder } from '../../../models/reorder';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ToastService } from '../../../services/toast/toast.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-debt-list',
  templateUrl: './debt-list.component.html',
  styleUrls: ['./debt-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class DebtListComponent  implements OnInit {
  debtList: Debt[];
  debtTransactionList: any[];
  debtTransaction: any;
  debtBalances: number;
  debtPayments: number;

  private debtsSubscription: any;
  private debtTransactionsSubscription: any;
  private settingsSubscription: any;

  reorder: Reorder[];

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private debtService: DebtService,
    private settingsService: SettingsService,
    private toastService: ToastService,
    private actionCtrl: ActionSheetController,
    private alertController: AlertController,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewDidEnter() {

    this.debtsSubscription = this.debtService.getRealtimeDebts()
    .subscribe((debts: Debt[]) => {
      this.debtBalances = 0;
      this.debtPayments = 0;
      this.debtList = debts;
      if (this.debtList) {
        this.debtList.forEach((debt: Debt) => {
          this.debtBalances = this.debtBalances + debt.balance;
          this.debtPayments = this.debtPayments + debt.annualpayments;
        });
      }
    });
  }

  createDebt() {
    this.navController.navigateForward('/debts/debt-create');
  }

  async deleteDebtItem(
    debtId: string
  ) {
    const alert = await this.alertController.create({
      message: `Delete debt?`,
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
            this.debtService.deleteDebt(debtId).then(() => {
              this.debtTransactionsSubscription = this.debtService.getDebtTransactions(debtId)
              .pipe(take(1))
              .subscribe((transactions: Transaction[]) => {
                this.debtTransactionList = transactions;
                this.debtTransactionList.forEach((transaction: Transaction) => {
                  this.debtTransaction = transaction;
                  const transactionId = this.debtTransaction.id;
                  this.debtService.deleteDebtTransaction(debtId, transactionId);
                });
              });

              this.reorder = [];
              this.settingsSubscription = this.settingsService.getReorderByItemId(debtId)
              .pipe(take(1))
              .subscribe((reorder: Reorder) => {
                this.reorder[0] = reorder;
                if (this.reorder[0] !== undefined) {
                  const id = this.reorder[0].id;
                  if (id !== undefined) {
                    this.settingsService.deleteReorder(id).then(res => {
                      this.toastService.displayToast('Debt deleted.');
                      this.navController.navigateBack(`/debts/debt-list`);
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
    id: string
  ) {
    this.actionCtrl.create({
      buttons: [
        {
          text: 'List Transaction & Payments',
          handler: () => {
            this.navController.navigateForward(`/debts/debt-list-transactions/${id}`);
          }
        },
        {
          text: 'Add Transaction & Payments',
          handler: () => {
            this.navController.navigateForward(`/debts/debt-transaction/${id}`);
          }
        },
        {
          text: 'Edit Debt',
          handler: () => {
            this.navController.navigateForward(`/debts/debt-update/${id}`);
          }
        },
        {
          text: 'Delete Debt',
          handler: () => {
            this.deleteDebtItem(id);
          }
        },
        {
          text: 'Move Funds',
          handler: () => {
            this.navController.navigateForward(`/debts/debt-move-funds/${id}`);
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
    if (this.debtsSubscription) {
      this.debtsSubscription.unsubscribe();
    }
    if (this.debtTransactionsSubscription) {
      this.debtTransactionsSubscription.unsubscribe();
    }
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }
}
