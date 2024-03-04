import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { LoanService } from '../../../services/loan/loan.service';
import { Loan } from '../../../models/loan';
import { LoanFormComponent } from '../../../components/loan-form/loan-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-loan-create',
  templateUrl: './loan-create.component.html',
  styleUrls: ['./loan-create.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, LoanFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class LoanCreateComponent {
  @ViewChild(LoanFormComponent, { static: false }) loanForm: LoanFormComponent;
  public loan: Loan = new Loan();
  public submitted = false;
  public loanType: string;
  public toDay: any;
  public fromDate: any;
  public toDate: any;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();
  
  constructor(
    private loanService: LoanService,
    private toastService: ToastService,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.toDay = new Date().getFullYear();
    this.toDate = `${(this.toDay + 1)}`;
    this.fromDate = `${(this.toDay - 5)}`;
  }

  async createLoan(loan: Loan): Promise<void> {
    try {
      loan.date = new Date(loan.date).toISOString();
      loan.balance = loan.initialloan;
      loan.balance = Math.round(loan.balance * 1e2) / 1e2;

      if ( loan.frequency === 'Weekly' ) {
        loan.annualpayments = loan.paymentamount * 52;
      }
      if ( loan.frequency === 'Monthly' ) {
        loan.annualpayments = loan.paymentamount * 12;
      }
      if ( loan.frequency === 'Quarterly' ) {
        loan.annualpayments = loan.paymentamount * 4;
      }
      if ( this.loan.frequency === 'Annually' ) {
        loan.annualpayments = loan.paymentamount;
      }
      loan.annualpayments = Math.round(loan.annualpayments * 1e2) / 1e2;
      this.loanService.createLoan(loan).then(res => {
        this.toastService.displayToast('Loan account added');
        this.navController.navigateBack('/loans/loan-list');
      });
    } catch (error) {
      this.loanForm.handleError(error);
    }
  }
}
