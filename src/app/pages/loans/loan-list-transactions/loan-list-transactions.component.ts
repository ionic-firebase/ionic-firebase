import { Component, ViewEncapsulation, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { LoanService } from '../../../services/loan/loan.service';
import { ToastService } from '../../../services/toast/toast.service';
import { Loan } from '../../../models/loan';
import { Transaction } from '../../../models/transaction';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransactionFormComponent } from '../../../components/transaction-form/transaction-form.component';
import { AuthService } from '../../../services/user/auth.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Observable, switchMap } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-loan-list-transactions',
  templateUrl: './loan-list-transactions.component.html',
  styleUrls: ['./loan-list-transactions.component.scss'],
  standalone: true,
  imports: [TransactionFormComponent, CommonModule, FormsModule, ReactiveFormsModule, 
    NgxDatatableModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class LoanListTransactionsComponent {

  loanId: string;

  currentLoan$: Observable<Loan> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.loanId = params['id'];
      return this.loanService.getLoan(params['id']);
    })
  );

  loan: Loan;
  loanTransactionList: Transaction[];
  loanTransaction: Transaction;

  loanName: string;
  loanBalance: number;
  isUpdated: boolean;

  loanDate: string;
  public rowList$: Array<any>;
  private loanSubscription: any;
  private loanTransactionsSubscription: any;
  private loanTransactionSubscription: any;

  public columns: any;
  public rows: any;
  public isMode: boolean;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private loanService: LoanService,
    private toastService: ToastService,
    private alertController: AlertController,
    private actionCtrl: ActionSheetController,
    private route: ActivatedRoute,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.rowList$ = [];
    this.loanSubscription = this.currentLoan$
    .pipe(take(1))
    .subscribe((loan: Loan) => {
      this.loan = loan;
      if(this.loan !== undefined) {
        this.loanBalance = this.loan.initialloan;
        this.loanName = this.loan.name;
        this.rowList$ = [];
        this.rowList$.push({
          date: this.loan.date,
          mode: '',
          type: '',
          ismode: this.isMode,
          description: 'Initial balance setup',
          cashamount: this.loanBalance,
          balance: this.loanBalance,
          id: ''
        });

        this.loanTransactionsSubscription = this.loanService.getLoanTransactions(this.loanId)
        .pipe()
        .subscribe((transactions: Transaction[]) => {
          this.loanTransactionList = transactions;
          if (this.loanTransactionList !== undefined) {
            this.loanTransactionList.forEach(snapTransaction => {
              this.loanTransaction = snapTransaction;
              this.loanBalance = this.loanBalance + this.loanTransaction.cashamount;
              if ( this.loanTransaction.mode === 'Cash') {
                this.isMode = true;
              } else {
                this.isMode = false;
              }
              this.rowList$.push({
                date:  this.loanTransaction.date,
                type:  this.loanTransaction.type,
                ismode: this.isMode,
                description:  this.loanTransaction.description,
                cashamount:  this.loanTransaction.cashamount,
                balance: this.loanBalance,
                id:  this.loanTransaction.id
              });
            });
            this.rows = [...this.rowList$];
          }
        });
      }
    });
  }

  async getidpromise(): Promise<any> {
    return this.route.snapshot.paramMap.get('id');
  }

  createLoanTransaction() {
    this.navController.navigateForward(`/loans/loan-transaction/${this.loanId}`);
  }

  async deleteLoanTransaction(
    transactionId: string,
  ) {
    if (transactionId) {
      const alert = await this.alertController.create({
        message: `Delete loan transaction?`,
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
              this.isUpdated = false;
              this.loanTransactionSubscription = this.loanService.getLoanTransaction(this.loanId, transactionId)
              .pipe(take(1))
              .subscribe(transaction => {
                this.loanTransaction = transaction;
  
                if ( this.loanTransaction && !this.isUpdated) {
                  if (this.loanTransaction.type === 'repayment') {
                    this.loanBalance = this.loanBalance - transaction.cashamount;
                  } else {
                    this.loanBalance = this.loanBalance + transaction.cashamount;
                  }
                  this.isUpdated =  true;
                  this.loanService.updateLoanBalance(this.loanId, this.loanBalance);
                }
              });
              this.loanService.deleteLoanTransaction(this.loanId, transactionId)
              .then(() => {
                this.toastService.displayToast('Loan transaction deleted.');
                this.navController.navigateBack(`/loan-list`);
              });
            },
          },
        ],
      });
      await alert.present();
    }
  }

  openMenu(
    id: string,
    mode: string,
    cashamount: number
  ) {
    this.actionCtrl.create({
      buttons: [
        {
          text: 'Delete loan transaction',
          handler: () => {
            this.deleteLoanTransaction(id);
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
    if (this.loanTransactionsSubscription) {
      this.loanTransactionsSubscription.unsubscribe();
    }
    if (this.loanTransactionSubscription) {
      this.loanTransactionSubscription.unsubscribe();
    }
    if (this.loanSubscription) {
      this.loanSubscription.unsubscribe();
    }
  }
}
