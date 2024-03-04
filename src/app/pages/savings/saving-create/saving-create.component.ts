import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { SavingsService } from '../../../services/savings/savings.service';
import { Saving } from '../../../models/saving';
import { SettingsService } from '../../../services/settings/settings.service';
import { Reorder } from '../../../models/reorder';
import { Settings } from 'src/app/models/settings';
import { SavingsFormComponent } from '../../../components/savings-form/savings-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { take} from 'rxjs/operators';


@Component({
  selector: 'app-saving-create',
  templateUrl: './saving-create.component.html',
  styleUrls: ['./saving-create.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, SavingsFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class SavingCreateComponent {
  @ViewChild(SavingsFormComponent, { static: false }) savingsForm: SavingsFormComponent;

  public saving: Saving = new Saving();
  public savingType: string;
  public savingAnnualInterest: number;

  public reorder: Reorder;
  public ordercount: number;
  public settingsSubscription: any;
  public toDay: any;
  public fromDate: any;
  public toDate: any;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();
  
  constructor(
    private savingsService: SavingsService,
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
    .pipe()
    .subscribe((settings: Settings) => {
      this.ordercount = settings.ordercount;
    });
  }

  async createSaving(saving: Saving): Promise<void> {

    try {
      if (saving.frequency === 'Weekly') {
        saving.annualinterest = (saving.interest * 52);
      } else {
        if (saving.frequency === 'Monthly') {
          saving.annualinterest = (saving.interest * 12);
        } else {
          if (saving.frequency === 'Quarterly') {
            saving.annualinterest = (saving.interest * 4);
          } else {
            saving.annualinterest = saving.interest;
          }
        }
      }
      saving.date = new Date(saving.date).toISOString();
      saving.annualinterest = Math.round(saving.annualinterest * 1e2) / 1e2;
      saving.balance = saving.initialcash;
      this.savingsService.createSaving(saving).then(res => {
        this.reorder = {
          id: '',
          name: saving.name,
          type: 'Savings',
          itemid: res.id,
          order: this.ordercount,
          initialvalue: 0,
          ongoingvalue: 0
        };
        this.settingsService.createReorder(this.reorder).then(res1 => {
          this.ordercount++;
          this.settingsService.updateOrderCount(this.ordercount).then(res2 => {
            this.toastService.displayToast('Savings account added');
            this.navController.navigateBack('/savings/saving-list');
          });
        });
      });
    } catch (error) {
      this.savingsForm.handleError(error);
    }
  }
  
  ionViewWDidLeave() {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }
}
