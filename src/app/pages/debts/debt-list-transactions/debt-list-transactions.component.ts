import { Component, ViewEncapsulation, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { DebtService } from '../../../services/debt/debt.service';
import { ToastService } from '../../../services/toast/toast.service';
import { Debt } from '../../../models/debt';
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
  selector: 'app-debt-list-transactions',
  templateUrl: './debt-list-transactions.component.html',
  styleUrls: ['./debt-list-transactions.component.scss'],
  standalone: true,
  imports: [TransactionFormComponent, CommonModule, FormsModule, ReactiveFormsModule, 
    NgxDatatableModule, IonicModule ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class DebtListTransactionsComponent {

  debtId: string;
  
  currentDebt$: Observable<Debt> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.debtId = params['id'];
      return this.debtService.getDebt(params['id']);
    })
  );

  debtName: string;
  isUpdated: boolean;

  public debtBalance: number;
  public rowList: Array<any>;
  public debtTransactionKey: string;

  public debt: Debt;

  public debtTransactionList: Transaction[];
  public debtTransaction: Transaction;

  private debtSubscription: any;
  private debtTransactionsSubscription: any;
  private debtTransactionSubscription: any;

  public columns: any;
  public rows: any;
  public isMode: boolean;
  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private debtService: DebtService,
    private toastService: ToastService,
    private alertController: AlertController,
    private actionCtrl: ActionSheetController,
    private route: ActivatedRoute,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.isMode = false;
    this.debtSubscription = this.currentDebt$.pipe(take(1))
    .subscribe(debt => {
      this.debt = debt;
      if(this.debt !== undefined) {
        this.debtBalance = debt.initialdebt;
        this.debtName = debt.name;
        this.rowList = [];
        this.rowList.push({
          date: this.debt.date,
          type: '',
          ismode: this.isMode,
          description: 'Initial balance setup',
          cashamount: this.debtBalance,
          balance: this.debtBalance,
          id: ''
        });
        this.isMode = true;
        this.debtTransactionsSubscription = this.debtService.getDebtTransactions(this.debtId)
        .pipe()
        .subscribe((transactions: Transaction[]) => {
          this.debtTransactionList = transactions;
          if (this.debtTransactionList) {
            this.debtTransactionList.forEach(snap => {
              this.debtBalance = this.debtBalance + snap.cashamount;
              this.rowList.push({
                date: snap.date,
                type: snap.type,
                ismode: this.isMode,
                description: snap.description,
                cashamount: snap.cashamount,
                balance: this.debtBalance,
                id: snap.id
              });
            });
            this.rows = this.rowList;
          }
        });
      }
    });
  }

  async getidpromise(): Promise<any> {
    return this.route.snapshot.paramMap.get('id');
  }

  createDebtTransaction() {
    this.navController.navigateForward(`/debts/debt-transaction/${this.debtId}`);
  }

  async deleteDebtTransaction(
    transactionId: string,
  ) {
    const alert = await this.alertController.create({
      message: `Delete debt transaction?`,
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
            this.debtTransactionSubscription = this.debtService.getDebtTransaction(this.debtId, transactionId)
            .pipe()
            .subscribe(transaction => {
              this.debtTransaction = transaction;

              if ( this.debtTransaction && !this.isUpdated) {
                if (this.debtTransaction.type === 'repayment') {
                  this.debtBalance = this.debtBalance - transaction.cashamount;
                } else {
                  this.debtBalance = this.debtBalance + transaction.cashamount;
                }
                this.isUpdated =  true;
                this.debtService.updateDebtBalance(this.debtId, this.debtBalance);
              }
            });
            this.debtService.deleteDebtTransaction(this.debtId, transactionId)
            .then(() => {
              this.toastService.displayToast('Debt transaction deleted.');
              this.navController.navigateBack(`/debts/debt-list`);
            });
          }
        }
      ]
    });

    await alert.present();
  }

  openMenu(id: string) {
    if (id) {
      this.actionCtrl.create({
        buttons: [
          {
            text: 'Delete Debt Transaction',
            handler: () => {
              this.deleteDebtTransaction(id);
            }
          },
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ]
      }).then(ac => ac.present());
    }
  }

  ionViewWillLeave() {
    if (this.debtSubscription) {
      this.debtSubscription.unsubscribe();
    }
    if (this.debtTransactionSubscription) {
      this.debtTransactionSubscription.unsubscribe();
    }
    if (this.debtTransactionsSubscription) {
      this.debtTransactionsSubscription.unsubscribe();
    }
  }
}
