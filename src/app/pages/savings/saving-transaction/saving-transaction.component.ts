import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { SavingsService } from '../../../services/savings/savings.service';
import { Transaction } from '../../../models/transaction';
import { Saving } from '../../../models/saving';
import { ToastService } from '../../../services/toast/toast.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { TransactionFormComponent } from 'src/app/components/transaction-form/transaction-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-saving-transaction',
  templateUrl: './saving-transaction.component.html',
  styleUrls: ['./saving-transaction.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TransactionFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})

export class SavingTransactionComponent {
  @ViewChild(TransactionFormComponent, { static: false }) transactionForm: TransactionFormComponent;

  savingId: string;

  currentSaving$: Observable<Saving> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.savingId = params['id'];
      return this.savingsService.getSaving(params['id']);
    })
  );
  
  savingName: string;
  public savingBalance: number;
  public newBalance: number;

  public savingtransaction: Transaction = new Transaction();
  private savingSubscription: any;
  public toDay: any;
  public toDate: any;
  public fromDate: any;
  public typeDropdowns: any[];
  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();
  
  constructor(
    private savingsService: SavingsService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.typeDropdowns = [
      {name: 'Interest', value: 'interest'},
      {name: 'Fees / Charges', value: 'fees'},
      {name: 'Cash In', value: 'cash'},
      {name: 'Cash Withdrawl', value: 'withdrawl'}
    ];
    this.toDay = new Date().getFullYear();
    this.toDate = `${(this.toDay + 1)}`;
    this.fromDate = `${(this.toDay - 5)}`;
    this.savingSubscription = this.currentSaving$.pipe()
    .subscribe(saving => {
      this.savingBalance = saving.balance;
      this.savingName = saving.name;
    });
  }

  async createSavingTransaction(transaction: Transaction): Promise<void> {
    try {
      if (transaction.type === 'withdrawl' || transaction.type === 'fees') {
        transaction.cashamount = transaction.cashamount * -1;
      }
      this.newBalance = this.savingBalance + transaction.cashamount;
      this.newBalance = Math.round(this.newBalance * 1e2) / 1e2;

      transaction.id = '';
      transaction.parentid = this.savingId;
      transaction.mode = 'saving';
      transaction.date = new Date(transaction.date).toISOString();
      this.savingsService.createSavingsTransaction(this.savingId, transaction).then(res => {
        this.savingsService.updateSavingsBalance(this.savingId, this.newBalance).then(res2 => {
          this.toastService.displayToast('Saving transaction added');
          this.navController.navigateBack('/savings/saving-list');
        });
      });
    } catch (error) {
      this.transactionForm.handleError(error);
    }
  }

  ionViewWillLeave() {
    if (this.savingSubscription) {
      this.savingSubscription.unsubscribe();
    }
  }
}
