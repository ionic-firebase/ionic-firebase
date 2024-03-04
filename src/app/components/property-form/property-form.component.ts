import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Property } from 'src/app/models/property';
import { LoadingController, AlertController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { IonicModule, IonDatetime } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-property-form',
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],  
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class PropertyFormComponent  implements OnInit {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  public loading: HTMLIonLoadingElement;
  public propertyForm: FormGroup;
  public property: Property;
  @Input() actionButtonText: string;
  @Output() formSubmitted = new EventEmitter<any>();
  public fromDate: any;
  public toDate: any;
  public datePurchaseValue = format(new Date(), 'yyyy-MM-dd') + 'T09:00:00.000Z';
  public formattedPurchaseDate = format(new Date(), 'MMM dd, yyyy');
  public dateContractValue = format(new Date(), 'yyyy-MM-dd') + 'T09:00:00.000Z';
  public formattedContractDate = format(new Date(), 'MMM dd, yyyy');
  public dateRenewalValue = format(new Date(), 'yyyy-MM-dd') + 'T09:00:00.000Z';
  public formattedRenewalDate = format(new Date(), 'MMM dd, yyyy');

  showPicker = false;
  showPurchasePicker = false;
  showContractPicker = false;
  showRenewalPicker = false;

  constructor(
      private formBuilder: FormBuilder,
      private loadingCtrl: LoadingController,
      private alertCtrl: AlertController
  ) {
      this.propertyForm = this.formBuilder.group({
          id: new FormControl(''),
          purchasedate: new FormControl(this.formattedPurchaseDate, [Validators.required]),
          name: new FormControl('', [Validators.required]),
          initialcash: new FormControl(0, [Validators.required]),
          purchasevalue: new FormControl(0, [Validators.required]),
          currentvalue: new FormControl(0, [Validators.required]),
          budgetmanagement: new FormControl(0, [Validators.required]),
          budgetmortgage: new FormControl(0, [Validators.required]),
          budgetrates: new FormControl(0, [Validators.required]),
          budgetmaintenance: new FormControl(0, [Validators.required]),
          budgetinsurance: new FormControl(0, [Validators.required]),
          budgetutilities: new FormControl(0, [Validators.required]),
          budgetothercosts: new FormControl(0, [Validators.required]),
          budgetrentalincome: new FormControl(0),
          budgetrentalfrequency: new FormControl('Annually'),
          budgetotherincome: new FormControl(0),
          tenantname: new FormControl(''),
          tenantphone: new FormControl(''),
          tenantemail: new FormControl(''),
          contractdate: new FormControl(this.formattedContractDate),
          contractrenewal: new FormControl(this.formattedRenewalDate),
          taxable: new FormControl('Yes', [Validators.required]),
          notes: new FormControl(''),
          forecast: new FormControl(true, [Validators.required])
      });
  }

  ngOnInit() {
      const toDayYear = new Date().getFullYear();
      this.toDate = `${(toDayYear + 20)}-01-01T11:00`;
      this.fromDate = `${(toDayYear - 5)}-01-01T11:00`;
  }

  purchasedateChanged(value: any) {
      this.datePurchaseValue = value;
      this.formattedPurchaseDate = format(parseISO(value), 'MMM d, yyyy');
      this.showPicker = false;
  }

  contractdateChanged(value: any) {
  this.dateContractValue = value;
  this.formattedContractDate = format(parseISO(value), 'MMM d, yyyy');
  this.showPicker = false;
  }

  renewaldateChanged(value: any) {
  this.dateRenewalValue = value;
  this.formattedRenewalDate = format(parseISO(value), 'MMM d, yyyy');
  this.showPicker = false;
  }

  submitCredentials(property: FormGroup): void {
      if (!property.valid) {
          console.log('Form is not valid yet, current value:', property.value);
      } else {
          const credentials: Property = {
              id: property.value.id,
              purchasedate: this.datePurchaseValue,
              name: property.value.name,
              initialcash: property.value.initialcash,
              purchasevalue: property.value.purchasevalue,
              currentcashbalance: property.value.currentcashbalance,
              currentvalue: property.value.currentvalue,
              forecast: property.value.forecast,
              budgetmanagement: property.value.budgetmanagement,
              budgetmortgage: property.value.budgetmortgage,
              budgetrates: property.value.budgetrates,
              budgetmaintenance: property.value.budgetmaintenance,
              budgetinsurance: property.value.budgetinsurance,
              budgetutilities: property.value.budgetutilities,
              budgetothercosts: property.value.budgetothercosts,
              budgetrentalincome: property.value.budgetrentalincome,
              budgetrentalfrequency: property.value.budgetrentalfrequency,
              budgetotherincome: property.value.budgetotherincome,
              budgetannualincome: property.value.budgetannualincome,
              actualmortgage: property.value.actualmortgage,
              actualmanagement: property.value.actualmanagement,
              actualrates: property.value.actualrates,
              actualmaintenance: property.value.actualmaintenance,
              actualinsurance: property.value.actualinsurance,
              actualutilities: property.value.actualutilities,
              actualothercosts: property.value.actualothercosts,
              actualrentalincome: property.value.actualrentalincome,
              actualotherincome: property.value.actualotherincome,
              actualannualincome: property.value.actualannualincome,
              tenantname: property.value.tenantname,
              tenantphone: property.value.tenantphone,
              tenantemail: property.value.tenantemail,
              contractdate: this.dateContractValue,
              contractrenewal: this.dateRenewalValue,
              taxable: property.value.taxable,
              notes: property.value.notes
          };
          this.formSubmitted.emit(credentials);
      }
  }

  async showLoading(): Promise<void> {
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
  }

  hideLoading(): Promise<boolean> {
      return this.loading.dismiss();
  }

  onPropertyRetrieved(property: Property): void {
      this.property = property;
      // Update the data on the form
      this.propertyForm.patchValue({
          id: this.property.id,
          purchasedate: format(parseISO(this.property.purchasedate), 'MMM d, yyyy'),
          name: this.property.name,
          initialcash: this.property.initialcash,
          purchasevalue: this.property.purchasevalue,
          currentcashbalance: this.property.currentcashbalance,
          currentvalue: this.property.currentvalue,
          budgetmanagement: this.property.budgetmanagement,
          budgetmortgage: this.property.budgetmortgage,
          budgetrates: this.property.budgetrates,
          budgetmaintenance: this.property.budgetmaintenance,
          budgetinsurance: this.property.budgetinsurance,
          budgetutilities: this.property.budgetutilities,
          budgetothercosts: this.property.budgetothercosts,
          budgetrentalincome: this.property.budgetrentalincome,
          budgetrentalfrequency: this.property.budgetrentalfrequency,
          budgetotherincome: this.property.budgetotherincome,
          budgetannualincome: this.property.budgetannualincome,
          actualmortgage: this.property.actualmortgage,
          actualmanagement: this.property.actualmanagement,
          actualrates: this.property.actualrates,
          actualmaintenance: this.property.actualmaintenance,
          actualinsurance: this.property.actualinsurance,
          actualutilities: this.property.actualutilities,
          actualothercosts: this.property.actualothercosts,
          actualrentalincome: this.property.actualrentalincome,
          actualotherincome: this.property.actualotherincome,
          actualannualincome: this.property.actualannualincome,
          tenantname: this.property.tenantname,
          tenantphone: this.property.tenantphone,
          tenantemail: this.property.tenantemail,
          contractdate: format(parseISO(this.property.contractdate), 'MMM d, yyyy'),
          contractrenewal: format(parseISO(this.property.contractrenewal), 'MMM d, yyyy'),
          taxable: this.property.taxable,
          forecast: this.property.forecast,
          notes: this.property.notes
      });
      this.datePurchaseValue = this.property.purchasedate;
      this.formattedPurchaseDate = format(parseISO(this.property.purchasedate), 'MMM d, yyyy');
      this.datePurchaseValue = this.property.purchasedate;
      this.formattedContractDate = format(parseISO(this.property.contractdate), 'MMM d, yyyy');
      this.datePurchaseValue = this.property.purchasedate;
      this.formattedRenewalDate = format(parseISO(this.property.contractrenewal), 'MMM d, yyyy');
  }

  async handleError(error: any): Promise<void> {
      const alert = await this.alertCtrl.create({
          message: error.message,
          buttons: [{ text: 'Ok', role: 'cancel' }]
      });
      await alert.present();
  }
}
