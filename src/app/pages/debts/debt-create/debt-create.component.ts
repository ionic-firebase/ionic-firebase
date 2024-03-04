import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { DebtService } from '../../../services/debt/debt.service';
import { Debt } from '../../../models/debt';
import { SettingsService } from '../../../services/settings/settings.service';
import { Settings } from 'src/app/models/settings';
import { DebtFormComponent } from '../../../components/debt-form/debt-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { take} from 'rxjs/operators';

@Component({
  selector: 'app-debt-create',
  templateUrl: './debt-create.component.html',
  styleUrls: ['./debt-create.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DebtFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class DebtCreateComponent {
  @ViewChild(DebtFormComponent, { static: false }) debtForm: DebtFormComponent;
  public debt: Debt = new Debt();
  public submitted = false;
  public debtType: string;
  public debtAnnual: number;
  public toDay: any;
  public fromDate: any;
  public toDate: any;

  public settingsSubscription: any;
  settings: Settings = new Settings();

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();
  
  constructor(
    private debtService: DebtService,
    private settingsService: SettingsService,
    private toastService: ToastService,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.toDay = new Date().getFullYear();
    this.toDate = `${(this.toDay + 1)}`;
    this.fromDate = `${(this.toDay - 5)}`;
    this.settingsSubscription = this.settingsService.getSettings()
    .pipe(take(1))
    .subscribe(settings => {
    this.settings = settings;
    });
  }

  async createDebt(debt: Debt): Promise<void> {
    try {
      debt.date = new Date(debt.date).toISOString();
      debt.balance = debt.initialdebt;
      debt.balance = Math.round(debt.balance * 1e2) / 1e2;

      if ( debt.frequency === 'Weekly' ) {
        debt.annualpayments = debt.paymentamount * 52;
      }
      if ( debt.frequency === 'Monthly' ) {
        debt.annualpayments = debt.paymentamount * 12;
      }
      if ( debt.frequency === 'Quarterly' ) {
        debt.annualpayments = debt.paymentamount * 4;
      }
      if ( this.debt.frequency === 'Annually' ) {
        debt.annualpayments = debt.paymentamount;
      }
      debt.annualpayments = Math.round(debt.annualpayments * 1e2) / 1e2;
      this.debtService.createDebt(debt).then(res => {
        this.toastService.displayToast('Debt account added');
        this.navController.navigateBack('/debts/debt-list');
      });
    } catch (error) {
      this.debtForm.handleError(error);
    }
  }

  ionViewWDidLeave() {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }
}
