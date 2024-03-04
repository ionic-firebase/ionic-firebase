import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { PropertyService } from '../../../services/property/property.service';
import { Property } from '../../../models/property';
import { Transaction } from '../../../models/transaction';
import { SettingsService } from '../../../services/settings/settings.service';
import { Reorder } from '../../../models/reorder';
import { Settings } from 'src/app/models/settings';
import { PropertyFormComponent } from '../../../components/property-form/property-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { take} from 'rxjs/operators';

@Component({
  selector: 'app-property-create',
  templateUrl: './property-create.component.html',
  styleUrls: ['./property-create.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, PropertyFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class PropertyCreateComponent {
  @ViewChild(PropertyFormComponent, { static: false }) propertyForm: PropertyFormComponent;
  public property: Property = new Property();
  public propertyType: string;
  public propertytransaction: Transaction = new Transaction();

  public reorder: Reorder;
  public ordercount: number;
  public settingsSubscription: any;
  private settings: Settings = new Settings();
  public toDay: any;
  public fromDate: any;
  public toDate: any;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();
  
  constructor(
    private propertyService: PropertyService,
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

  async createProperty(property: Property): Promise<void> {
    try {
      property.id = '';
      property.purchasedate = new Date(property.purchasedate).toISOString();
      if (property.contractdate !== undefined) {
        property.contractdate = new Date(property.contractdate).toISOString();
      }
      if (property.contractrenewal !== undefined) {
        property.contractrenewal = new Date(property.contractrenewal).toISOString();
      }
      if (property.budgetrentalincome === null) {
        property.budgetrentalincome = 0;
      }
      if (property.budgetrentalfrequency === undefined) {
        property.budgetrentalfrequency = 'Annual';
      }
      if (property.budgetotherincome === null) {
        property.budgetotherincome = 0;
      }

      if (property.budgetrentalfrequency === 'Weekly') {
        property.budgetannualincome = (property.budgetrentalincome * 52) + property.budgetotherincome;
      } else {
        if (property.budgetrentalfrequency === 'Monthly') {
          property.budgetannualincome = (property.budgetrentalincome * 12) + property.budgetotherincome;
        } else {
          if (property.budgetrentalfrequency === 'Quarterly') {
            property.budgetannualincome = (property.budgetrentalincome * 4) + property.budgetotherincome;
          } else {
            property.budgetannualincome = property.budgetrentalincome + property.budgetotherincome;
          }
        }
      }
      property.budgetannualincome = Math.round(property.budgetannualincome * 1e2) / 1e2;
      property.currentcashbalance = property.initialcash - property.purchasevalue;
      property.actualmortgage = 0;
      property.actualmanagement = 0;
      property.actualrates = 0;
      property.actualmaintenance = 0;
      property.actualinsurance = 0;
      property.actualutilities = 0;
      property.actualothercosts = 0;
      property.actualrentalincome = 0;
      property.actualotherincome = 0;
      property.actualannualincome = 0;

      this.propertyService.createProperty(property).then(res2 => {
        this.propertytransaction = {
          id: '',
          parentid: res2.id,
          date: property.purchasedate,
          description: `Property purchase @ ${property.purchasevalue}`,
          cashamount: property.purchasevalue,
          type: 'othercosts',
          mode: 'Property'
        };
        this.propertyService.createPropertyTransaction(res2.id, this.propertytransaction).then(res => {

          this.reorder = {
            id: '',
            name: property.name,
            type: 'Property',
            itemid: res2.id,
            order: this.settings.ordercount,
            initialvalue: 0,
            ongoingvalue: 0
          };
          this.settingsService.createReorder(this.reorder);
          const ordercount = this.settings.ordercount + 1;
          this.settingsService.updateOrderCount(ordercount);
          this.toastService.displayToast('Property added');
          this.navController.navigateBack('/property/property-list');
        });
      });
    } catch (error) {
      this.propertyForm.handleError(error);
    }
  }
  
  ionViewWDidLeave() {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }
}
