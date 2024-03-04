import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { DebtService } from '../../../services/debt/debt.service';
import { Debt } from '../../../models/debt';
import { DebtFormComponent } from '../../../components/debt-form/debt-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-debt-update',
  templateUrl: './debt-update.component.html',
  styleUrls: ['./debt-update.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DebtFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class DebtUpdateComponent {
  @ViewChild(DebtFormComponent, { static: false }) debtForm: DebtFormComponent;

  public debtId: string;

  currentDebt$: Observable<Debt> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.debtId = params['id'];
      return this.debtService.getDebt(params['id']);
    })
  );

  public debt: Debt = new Debt();
  public origBalance: number;
  public origInitialDebt: number;

  public toDay: any;
  public fromDate: any;
  public toDate: any;

  private debtSubscription: any;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private debtService: DebtService,
    private toastService: ToastService,
    private navController: NavController,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {

    this.toDay = new Date().getFullYear();
    this.toDate = `${(this.toDay + 1)}`;
    this.fromDate = `${(this.toDay - 5)}`;
    this.debtSubscription = this.currentDebt$.pipe()
    .subscribe((debt: Debt) => {
      this.origBalance = debt.balance;
      this.origInitialDebt = debt.initialdebt;
      this.debtForm.onDebtRetrieved(debt);
    });
  }

  async updateDebt(debt: Debt): Promise<void> {
    try {
      debt.id = this.debtId;
      debt.date = new Date(debt.date).toISOString();
      debt.balance = this.origBalance + debt.initialdebt - this.origInitialDebt;
      debt.balance = Math.round(debt.balance * 1e2) / 1e2;

      if (debt.frequency === 'Weekly') {
        debt.annualpayments = debt.paymentamount * 52;
      }
      if (debt.frequency === 'Monthly') {
        debt.annualpayments = debt.paymentamount * 12;
      }
      if (debt.frequency === 'Quarterly') {
        debt.annualpayments = debt.paymentamount * 4;
      }
      if (this.debt.frequency === 'Annually') {
        debt.annualpayments = debt.paymentamount;
      }
      debt.annualpayments = Math.round(debt.annualpayments * 1e2) / 1e2;
      debt.date = new Date(debt.date).toISOString();
      this.debtService.updateDebt(debt.id, debt).then(res => {
        this.toastService.displayToast('Debt updated');
        this.navController.navigateBack('/debts/debt-list');
      })
      .catch(error => this.debtForm.handleError(error));
    } catch (error) {
      this.debtForm.handleError(error);
    }
  }

  ionViewWillLeave() {
    if (this.debtSubscription) {
      this.debtSubscription.unsubscribe();
    }
  }
}
