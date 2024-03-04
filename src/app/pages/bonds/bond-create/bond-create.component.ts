import { Component, inject, ViewChild } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { BondService } from '../../../services/bond/bond.service';
import { Bond } from '../../../models/bond';
import { SettingsService } from '../../../services/settings/settings.service';
import { Reorder } from '../../../models/reorder';
import { Settings } from 'src/app/models/settings';
import { BondFormComponent } from '../../../components/bond-form/bond-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { take} from 'rxjs/operators';

@Component({
  selector: 'app-bond-create',
  templateUrl: './bond-create.component.html',
  styleUrls: ['./bond-create.component.scss'],
  standalone: true,
  imports: [BondFormComponent, CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class BondCreateComponent {
  @ViewChild(BondFormComponent, { static: false }) bondForm: BondFormComponent;
  public bond: Bond = new Bond();
  public bondType: string;
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
    private bondService: BondService,
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

  async createBond(bond: Bond): Promise<void> {

    try {
      bond.id = '';
      bond.balance = bond.initialcash;
      if (bond.frequency === 'Weekly') {
        bond.interestpayable = (bond.balance * bond.interestrate / 5200)
        bond.annualinterest = (bond.interestpayable * 52);
      } else {
        if (bond.frequency === 'Monthly') {
          bond.interestpayable = (bond.balance * bond.interestrate / 1200)
          bond.annualinterest = (bond.interestpayable * 12);
        } else {
          if (bond.frequency === 'Quarterly') {
            bond.interestpayable = (bond.balance * bond.interestrate / 400)
            bond.annualinterest = (bond.interestpayable * 4);
          } else {
            bond.interestpayable = (bond.balance * bond.interestrate / 100)
            bond.annualinterest = bond.interestpayable;
          }
        }
      }
      bond.annualinterest = Math.round(bond.annualinterest * 1e2) / 1e2;
      bond.date = new Date(bond.date).toISOString();
      this.bondService.createBond(bond).then(bondId => {
        this.reorder = {
          id: '',
          name: bond.name,
          type: `Bond`,
          itemid: bondId.id,
          order: this.settings.ordercount,
          initialvalue: 0,
          ongoingvalue: 0
        };

        this.settingsService.createReorder(this.reorder);
        const ordercount = this.settings.ordercount + 1;
        this.settingsService.updateOrderCount(ordercount);
        this.toastService.displayToast('Bond account added');
        this.navController.navigateBack('/bonds/bond-list');
      });
    } catch (error) {
      this.bondForm.handleError(error);
    }
  }
  
  ionViewWDidLeave() {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }
}
