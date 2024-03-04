import { Component, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { LoanService } from '../../../services/loan/loan.service';
import { SettingsService } from '../../../services/settings/settings.service';
import { Loan } from '../../../models/loan';
import { Transaction } from '../../../models/transaction';
import { Reorder } from '../../../models/reorder';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ToastService } from '../../../services/toast/toast.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-loan-list',
  templateUrl: './loan-list.component.html',
  styleUrls: ['./loan-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class LoanListComponent  implements OnInit {

  loanList: Loan[];
  loanTransactionList: Transaction[];
  loanTransaction: Transaction;
  loanBalances: number;
  loanPayments: number;

  private loanSubscription: any;
  private loanTransactionsSubscription: any;
  private settingsSubscription: any;

  reorder: Reorder[];

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private loanService: LoanService,
    private settingsService: SettingsService,
    private toastService: ToastService,
    private actionCtrl: ActionSheetController,
    private alertController: AlertController,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewDidEnter() {

    this.loanSubscription = this.loanService.getRealtimeLoans()
    .subscribe((loans: Loan[]) => {
      this.loanBalances = 0;
      this.loanPayments = 0;
      this.loanList = loans;
      if (this.loanList) {
        this.loanList.forEach((loan: Loan) => {
          this.loanBalances = this.loanBalances + loan.balance;
          this.loanPayments = this.loanPayments + loan.annualpayments;
        });
      }
    });
  }

  createLoan() {
    this.navController.navigateForward('/loans/loan-create');
  }

  async deleteLoanItem(
    loanId: string,
  ) {
    const alert = await this.alertController.create({
      message: `Delete loan`,
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
            this.loanService.deleteLoan(loanId)
            .then(() => {
              this.loanTransactionsSubscription = this.loanService.getLoanTransactions(loanId)
              .pipe(take(1))
              .subscribe((transactions: Transaction[]) => {
                this.loanTransactionList = transactions;
                this.loanTransactionList.forEach((transaction: Transaction) => {
                  this.loanTransaction = transaction;
                  const transactionId = this.loanTransaction.id;
                  this.loanService.deleteLoanTransaction(loanId, transactionId);
                });
              });
              this.reorder = [];
              this.settingsSubscription = this.settingsService.getReorderByItemId(loanId)
              .pipe(take(1))
              .subscribe((reorder: Reorder) => {
                this.reorder[0] = reorder;
                if (this.reorder[0] !== undefined) {
                  const id = this.reorder[0].id;
                  if (id !== undefined) {
                    this.settingsService.deleteReorder(id).then(res => {
                      this.toastService.displayToast('Loan deleted.');
                      this.navController.navigateBack(`/loans/loan-list`);
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
            this.navController.navigateForward(`/loans/loan-list-transactions/${id}`);
          }
        },
        {
          text: 'Add Transaction & Interest',
          handler: () => {
            this.navController.navigateForward(`/loans/loan-transaction/${id}`);
          }
        },
        {
          text: 'Edit Loan',
          handler: () => {
            this.navController.navigateForward(`/loans/loan-update/${id}`);
          }
        },
        {
          text: 'Delete Loan',
          handler: () => {
            this.deleteLoanItem(id);
          }
        },
        {
          text: 'Move Funds',
          handler: () => {
            this.navController.navigateForward(`/loans/loan-move-funds/${id}`);
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
    if (this.loanSubscription) {
      this.loanSubscription.unsubscribe();
    }
    if (this.loanTransactionsSubscription) {
      this.loanTransactionsSubscription.unsubscribe();
    }
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }
}