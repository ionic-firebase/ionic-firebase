import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { LoanService } from '../../../services/loan/loan.service';
import { Transaction } from '../../../models/transaction';
import { Loan } from '../../../models/loan';
import { ToastService } from '../../../services/toast/toast.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { TransactionFormComponent } from 'src/app/components/transaction-form/transaction-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-loan-transaction',
  templateUrl: './loan-transaction.component.html',
  styleUrls: ['./loan-transaction.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TransactionFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})

export class LoanTransactionComponent {
  @ViewChild(TransactionFormComponent, { static: false }) transactionForm: TransactionFormComponent;
  
  public loanId: string;
  
  currentLoan$: Observable<Loan> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.loanId = params['id'];
      return this.loanService.getLoan(params['id']);
    })
  );

  public loanName: string;
  public loanBalance: number;
  public fromDate: any;
  public toDate: any;
  public typeDropdowns: any[];
  public loanSubscription: any;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();
  
  constructor(
    private loanService: LoanService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.typeDropdowns = [
      {name: 'Interest', value: 'interest'},
      {name: 'Loan Repayment', value: 'repayment'},
      {name: 'Loan Extension', value: 'extension'},
      {name: 'Management Fees', value: 'management'}
    ];
    this.loanBalance = 0;
    this.toDate = new Date().getFullYear();
    this.toDate = `${(this.toDate + 1)}`;
    this.fromDate = `${(this.toDate - 3)}`;
    this.loanSubscription = this.currentLoan$.pipe()
    .subscribe((loan: Loan) => {
      this.loanBalance = loan.balance;
      this.loanName = loan.name;
    });
  }

  async createLoanTransaction(transaction: Transaction): Promise<void> {

    try {
      if (transaction.type === 'repayment') {
        transaction.cashamount = transaction.cashamount * -1;
      }
      this.loanBalance = this.loanBalance + transaction.cashamount;
      this.loanBalance = Math.round(this.loanBalance * 1e2) / 1e2;

      transaction.id = '';
      transaction.parentid = this.loanId;
      transaction.date = new Date(transaction.date).toISOString();
      transaction.mode = 'loan';
      this.loanService.createLoanTransaction(this.loanId, transaction).then(result => {
        this.loanService.updateLoanBalance(this.loanId, this.loanBalance).then(res2 => {
          this.toastService.displayToast('Loan transaction added');
          this.navController.navigateBack('/loans/loan-list');
        });
      });
    } catch (error) {
      this.transactionForm.handleError(error);
    }
  }

  ionViewWillLeave() {
    if (this.loanSubscription) {
      this.loanSubscription.unsubscribe();
    }
  }
}
