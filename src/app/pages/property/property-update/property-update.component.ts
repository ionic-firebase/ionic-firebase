import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { PropertyService } from '../../../services/property/property.service';
import { Property } from '../../../models/property';
import { Transaction } from '../../../models/transaction';
import { PropertyFormComponent } from '../../../components/property-form/property-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-property-update',
  templateUrl: './property-update.component.html',
  styleUrls: ['./property-update.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, PropertyFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class PropertyUpdateComponent {
  @ViewChild(PropertyFormComponent, { static: false }) propertyForm: PropertyFormComponent;

  private propertyId: string;

  propertyBond$: Observable<Property> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.propertyId = params['id'];
      return this.propertyService.getProperty(params['id']);
    })
  );

  public propertytransaction: Transaction = new Transaction();
  public property: Property = new Property();
  private origPurchaseDate: any;
  private origInitialCash: number;
  private origPurchaseValue: number;
  private origCurrentCashBalance: number;

  private actualMortgage: number;
  private actualManagement: number;
  private actualRates: number;
  private actualMaintenance: number;
  private actualInsurance: number;
  private actualUtilities: number;
  private actualOtherCosts: number;
  private actualRentalIncome: number;
  private actualOtherIncome: number;
  private actualAnnualIncome: number;

  private propertySubscription: any;

  public toDay: any;
  public fromDate: any;
  public toDate: any;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private propertyService: PropertyService,
    private toastService: ToastService,
    private navController: NavController,
    private route: ActivatedRoute
  ) {

  }

  ionViewWillEnter() {
    this.toDay = new Date().getFullYear();
    this.toDate = `${(this.toDay + 1)}`;
    this.fromDate = `${(this.toDay - 5)}`;
    this.propertySubscription = this.propertyBond$.pipe()
    .subscribe((property: Property) => {
      this.origInitialCash = property.initialcash;
      this.origCurrentCashBalance = property.currentcashbalance;
      this.origPurchaseValue = property.purchasevalue;
      this.origPurchaseDate = property.purchasedate;
      this.actualMortgage = property.actualmortgage;
      this.actualManagement = property.actualmanagement;
      this.actualRates = property.actualrates;
      this.actualMaintenance = property.actualmaintenance;
      this.actualInsurance = property.actualinsurance;
      this.actualUtilities = property.actualutilities;
      this.actualOtherCosts = property.actualothercosts;
      this.actualRentalIncome = property.actualrentalincome;
      this.actualOtherIncome = property.actualotherincome;
      this.actualAnnualIncome = property.actualannualincome;
      this.propertyForm.onPropertyRetrieved(property);
    });
  }

  async updateProperty(property: Property): Promise<void> {
    try {
      property.purchasedate = new Date(property.purchasedate).toISOString();
      if (property.contractdate !== '') {
        property.contractdate = new Date(property.contractdate).toISOString();
      }
      if (property.contractrenewal !== '') {
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
      property.actualmortgage = this.actualMortgage;
      property.actualmanagement = this.actualManagement;
      property.actualrates = this.actualRates;
      property.actualmaintenance = this.actualMaintenance;
      property.actualinsurance = this.actualInsurance;
      property.actualutilities = this.actualUtilities;
      property.actualothercosts = this.actualOtherCosts;
      property.actualrentalincome = this.actualRentalIncome;
      property.actualotherincome = this.actualOtherIncome;
      property.actualannualincome = this.actualAnnualIncome;

      property.currentcashbalance = this.origCurrentCashBalance - (this.origInitialCash - this.origPurchaseValue)
       + (property.initialcash - property.purchasevalue);

      property.currentcashbalance = Math.round(property.currentcashbalance * 1e2) / 1e2;

      if ( this.origPurchaseValue !== property.purchasevalue) {

        this.propertytransaction.id = '';
        this.propertytransaction.parentid = property.id;
        this.propertytransaction.date = this.origPurchaseDate;
        this.propertytransaction.description = `VOID Property purchase @ ${this.origPurchaseValue}`;
        this.propertytransaction.cashamount = this.origPurchaseValue * -1;
        this.propertytransaction.type = 'othercosts';
        this.propertytransaction.mode = 'Property';

        this.propertyService.createPropertyTransaction(this.propertyId, this.propertytransaction).then(res => {
          this.propertytransaction.id = '';
          this.propertytransaction.parentid = property.id;
          this.propertytransaction.date = property.purchasedate;
          this.propertytransaction.description = `UPDATE Property purchase @ ${property.purchasevalue}`;
          this.propertytransaction.cashamount = property.purchasevalue;
          this.propertytransaction.type = 'othercosts';
          this.propertytransaction.mode = 'Property';
          this.propertyService.createPropertyTransaction(this.propertyId, this.propertytransaction).then(res1 => {
          });
        });
      }

      this.propertyService.updateProperty(this.propertyId, property).then(res => {
        this.toastService.displayToast('Property updated');
        this.navController.navigateBack('/property/property-list');
      });
    } catch (error) {
      this.propertyForm.handleError(error);
    }
  }

  ionViewWillLeave() {
    if (this.propertySubscription) {
      this.propertySubscription.unsubscribe();
    }
  }
}
