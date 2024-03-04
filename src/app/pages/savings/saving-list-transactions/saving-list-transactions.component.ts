import { Component, ViewEncapsulation, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { SavingsService } from '../../../services/savings/savings.service';
import { ToastService } from '../../../services/toast/toast.service';
import { Saving } from '../../../models/saving';
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
  selector: 'app-saving-list-transactions',
  templateUrl: './saving-list-transactions.component.html',
  styleUrls: ['./saving-list-transactions.component.scss'],
  standalone: true,
  imports: [TransactionFormComponent, CommonModule, FormsModule, ReactiveFormsModule, 
    NgxDatatableModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class SavingListTransactionsComponent {

  savingId: string;

  currentSaving$: Observable<Saving> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.savingId = params['id'];
      return this.savingsService.getSaving(params['id']);
    })
  );

  savingName: string;
  public savingBalance: number;
  public rowList$: Array<any>;
  private isUpdated: boolean;

  savingTransactionKey: string;
  savingTransactionList: Transaction[];
  private savingTransaction: Transaction;

  savingSubscription: any;
  savingTransactionsSubscription: any;
  savingTransactionSubscription: any;

  public columns: any;
  public rows: any;
  public isMode: boolean;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private savingsService: SavingsService,
    private toastService: ToastService,
    private alertController: AlertController,
    private actionCtrl: ActionSheetController,
    private route: ActivatedRoute,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.rowList$ = [];
    this.isMode = false;
    this.savingSubscription = this.currentSaving$.pipe(take(1))
    .subscribe((saving: Saving) => {
      this.savingBalance = saving.initialcash;
      this.savingName = saving.name;
      this.rowList$.push({
        date: saving.date,
        type: '',
        ismode: this.isMode,
        description: 'Initial balance setup',
        cashamount: this.savingBalance,
        balance: this.savingBalance,
        key: ''
      });
      this.isMode = true;
      this.savingTransactionsSubscription = this.savingsService.getSavingTransactions(this.savingId)
      .pipe(take(1))
      .subscribe((transactions: Transaction[]) => {
        this.savingTransactionList = transactions;
        if (this.savingTransactionList) {
          this.savingTransactionList.forEach((transaction: Transaction) => {
            this.savingTransaction = transaction;
            this.savingBalance = this.savingBalance + this.savingTransaction.cashamount;
            this.rowList$.push({
              date: this.savingTransaction.date,
              type: this.savingTransaction.type,
              ismode: this.isMode,
              description: this.savingTransaction.description,
              cashamount: this.savingTransaction.cashamount,
              balance: this.savingBalance,
              id: this.savingTransaction.id
            });
          });
          this.rows = [...this.rowList$];
        }
      });
    });
  }

  async getidpromise(): Promise<any> {
    return this.route.snapshot.paramMap.get('id');
  }

  createSavingTransaction() {
    this.navController.navigateForward(`/savings/saving-transaction/${this.savingId}`);
  }

  async deleteSavingTransaction(
    transactionId: string,
    mode: string,
    cashamount: number
  ) {
    if (transactionId) {
      const alert = await this.alertController.create({
        message: `Delete cash transaction?`,
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
              if ( mode === 'Cash' ) {
                const newbalance = this.savingBalance - cashamount;
                this.savingsService.updateSavingsBalance(this.savingId, newbalance);
                this.savingsService.deleteSavingTransaction(this.savingId, transactionId)
                .then(() => {
                  this.toastService.displayToast('Cash transaction deleted.');
                  this.navController.navigateBack(`/savings/saving-list`);
                });
              }
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
          text: 'Delete saving transaction',
          handler: () => {
            this.deleteSavingTransaction(id, mode, cashamount);
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
    if (this.savingTransactionsSubscription) {
      this.savingTransactionsSubscription.unsubscribe();
    }
    if (this.savingSubscription) {
      this.savingSubscription.unsubscribe();
    }
  }
}
