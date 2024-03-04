import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { DebtService } from '../../../services/debt/debt.service';
import { Transaction } from '../../../models/transaction';
import { Debt } from '../../../models/debt';
import { ToastService } from '../../../services/toast/toast.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { TransactionFormComponent } from 'src/app/components/transaction-form/transaction-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-debt-transaction',
  templateUrl: './debt-transaction.component.html',
  styleUrls: ['./debt-transaction.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TransactionFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class DebtTransactionComponent {
  @ViewChild(TransactionFormComponent, { static: false }) transactionForm: TransactionFormComponent;

  debtId: string;

  currentDebt$: Observable<Debt> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.debtId = params['id'];
      return this.debtService.getDebt(params['id']);
    })
  );

  debtName: string;
  debtList: Debt[];
  debt: any;
  public debttransaction: Transaction = new Transaction();
  public submitted = false;
  debtBalance: number;
  newBalance: number;
  private debtSubscription: any;
  public toDay: any;
  public toDate: any;
  public fromDate: any;
  public typeDropdowns: any[];

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private debtService: DebtService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.typeDropdowns = [
      {name: 'Interest', value: 'interest'},
      {name: 'Debt Repayment', value: 'repayment'},
      {name: 'Debt Extension', value: 'extension'},
      {name: 'Management Fees', value: 'management'}
    ];
    this.toDay = new Date().getFullYear();
    this.toDate = `${(this.toDay + 1)}`;
    this.fromDate = `${(this.toDay - 5)}`;
    this.debttransaction.date = new Date().toISOString();
    this.debtSubscription = this.currentDebt$.pipe()
    .subscribe(debt => {
      this.debt = debt;
      if(this.debt != undefined) {
        this.debtBalance = this.debt.balance;
        this.debtName = this.debt.name;
      }
    });
  }

  async createDebtTransaction(transaction: Transaction): Promise<void> {

    try {
      if (transaction.type === 'repayment') {
        transaction.cashamount = transaction.cashamount * -1;
      }
      this.newBalance = this.debtBalance + transaction.cashamount;
      transaction.id = '';
      transaction.parentid = this.debtId;
      transaction.mode = 'debt';
      transaction.date = new Date(transaction.date).toISOString();

      this.debtService.createDebtTransaction(this.debtId, transaction).then(res => {
        this.debtService.updateDebtBalance(this.debtId, this.newBalance).then(res1 => {
          this.toastService.displayToast('Debt transaction added');
          this.navController.navigateBack('/debts/debt-list');
        });
      });
    } catch (error) {
      this.transactionForm.handleError(error);
    }
  }

  ionViewWillLeave() {
    if (this.debtSubscription) {
      this.debtSubscription.unsubscribe();
    }
  }

}
