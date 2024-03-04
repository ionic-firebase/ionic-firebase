import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { Observable, switchMap } from 'rxjs';
import { ToastService } from '../../../services/toast/toast.service';
import { LoanService } from '../../../services/loan/loan.service';
import { Loan } from '../../../models/loan';
import { LoanFormComponent } from '../../../components/loan-form/loan-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-loan-update',
  templateUrl: './loan-update.component.html',
  styleUrls: ['./loan-update.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, LoanFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class LoanUpdateComponent {
  @ViewChild(LoanFormComponent, { static: false }) loanForm: LoanFormComponent;

  public loanId: string;

  currentLoan$: Observable<Loan> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.loanId = params['id'];
      return this.loanService.getLoan(params['id']);
    })
  );

  public loan$: Loan;
  public origBalance: number;
  public origInitialLoan: number;
  public toDay: any;
  public fromDate: any;
  public toDate: any;

  public loansSubscription: any;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private loanService: LoanService,
    private toastService: ToastService,
    private navController: NavController,
    private route: ActivatedRoute
  ) {

  }

  ionViewWillEnter() {
    this.toDay = new Date().getFullYear();
    this.toDate = `${(this.toDay + 1)}`;
    this.fromDate = `${(this.toDay - 5)}`;
    this.loansSubscription = this.currentLoan$.pipe()
    .subscribe((loan: Loan) => {
      this.origBalance = loan.balance;
      this.origInitialLoan = loan.initialloan;
      this.loanForm.onLoanRetrieved(loan);
    });
  }

  async updateLoan(loan: Loan): Promise<void> {
    try {
      loan.id = this.loanId;
      loan.date = new Date(loan.date).toISOString();
      loan.balance = this.origBalance + loan.initialloan - this.origInitialLoan;
      loan.balance = Math.round(loan.balance * 1e2) / 1e2;

      if (loan.frequency === 'Weekly') {
        loan.annualpayments = loan.paymentamount * 52;
      }
      if (loan.frequency === 'Monthly') {
        loan.annualpayments = loan.paymentamount * 12;
      }
      if (loan.frequency === 'Quarterly') {
        loan.annualpayments = loan.paymentamount * 4;
      }
      if (loan.frequency === 'Annually') {
        loan.annualpayments = loan.paymentamount;
      }
      loan.annualpayments = Math.round(loan.annualpayments * 1e2) / 1e2;
      loan.date = new Date(loan.date).toISOString();
      this.loanService.updateLoan(this.loanId, loan).then(res => {
        this.toastService.displayToast('Loan account updated');
        this.navController.navigateBack('/loans/loan-list');
      });
    } catch (error) {
      this.loanForm.handleError(error);
    }
  }

  ionViewWDidLeave() {

    if (this.loansSubscription) {
      this.loansSubscription.unsubscribe();
    }
  }
}
