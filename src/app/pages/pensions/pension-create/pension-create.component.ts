import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { PensionService } from '../../../services/pension/pension.service';
import { Pension } from '../../../models/pension';
import { SettingsService } from '../../../services/settings/settings.service';
import { Reorder } from '../../../models/reorder';
import { Settings } from 'src/app/models/settings';
import { PensionFormComponent } from '../../../components/pension-form/pension-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { take} from 'rxjs/operators';

@Component({
  selector: 'app-pension-create',
  templateUrl: './pension-create.component.html',
  styleUrls: ['./pension-create.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, PensionFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class PensionCreateComponent {
  @ViewChild(PensionFormComponent, { static: false }) pensionForm: PensionFormComponent;

  public pension: Pension = new Pension();
  public reorder: Reorder;
  public ordercount: number;
  public settingsSubscription: any;
  settings: Settings = new Settings();
  public toDay: any;
  public fromDate: any;
  public toDate: any;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private pensionService: PensionService,
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

  async createPension(pension: Pension): Promise<void> {
    try {
      pension.id = '';
      pension.startdate = new Date(pension.startdate).toISOString();

      if (pension.frequency === 'Weekly') {
        pension.annualincome = pension.income * 52;
      } else {
        if (pension.frequency === 'Monthly') {
          pension.annualincome = pension.income * 12;
        } else {
          if (pension.frequency === 'Quarterly') {
            pension.annualincome = pension.income * 4;
          } else {
            pension.annualincome = pension.income;
          }
        }
      }
      pension.annualincome = Math.round(pension.annualincome * 1e2) / 1e2;
      this.pensionService.createPension(pension).then(id => {
        this.toastService.displayToast('Pension created');
        this.navController.navigateBack('/pensions/pension-list');
      });
    } catch (error) {
      this.pensionForm.handleError(error);
    }
  }

  ionViewWDidLeave() {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }
}

