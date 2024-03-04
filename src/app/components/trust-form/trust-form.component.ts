import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Trust } from 'src/app/models/trust';
import { LoadingController, AlertController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { IonicModule, IonDatetime } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-trust-form',
  templateUrl: './trust-form.component.html',
  styleUrls: ['./trust-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],  
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class TrustFormComponent  implements OnInit {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  public loading: HTMLIonLoadingElement;
  public trustForm: FormGroup;
  public trust: Trust;
  @Input() actionButtonText: string;
  @Output() formSubmitted = new EventEmitter<any>();
  public fromDate: any;
  public toDate: any;
  public dateValue = format(new Date(), 'yyyy-MM-dd') + 'T09:00';
  public formattedDate = format(new Date(), 'MMM dd, yyyy');
  public displaySetupBuy = false;

  showPicker = false;

  constructor(
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    this.trustForm = this.formBuilder.group({
        id: new FormControl(''),
        date: new FormControl(this.formattedDate, [Validators.required]),
        name: new FormControl('', [Validators.required]),
        ticker: new FormControl('', [Validators.required]),
        quantity: new FormControl(0, [Validators.required]),
        price: new FormControl(0, [Validators.required]),
        transactioncharge: new FormControl(0, [Validators.required]),
        othercharges: new FormControl(0, [Validators.required]),
        tax: new FormControl(0, [Validators.required]),
        trustyield: new FormControl(0, [Validators.required]),
        addbuy: new FormControl(''),
      });
  }

  ngOnInit() {
    const toDayYear = new Date().getFullYear();
    this.toDate = `${(toDayYear + 1)}-01-01T11:00`;
    this.fromDate = `${(toDayYear - 5)}-01-01T11:00`;
    this.formattedDate = format(parseISO(this.dateValue), 'MMM d, yyyy');

  }

  dateChanged(value: any) {
    this.dateValue = value;
    this.formattedDate = format(parseISO(value), 'MMM d, yyyy');
    this.showPicker = false;
  }

  submitCredentials(trust: FormGroup): void {
    if (!trust.valid) {
        console.log('Form is not valid yet, current value:', trust.value);
      } else {
        const credentials: Trust = {
          id: trust.value.id,
          parentid: '',
          date: this.dateValue,
          name: trust.value.name,
          ticker: trust.value.ticker,
          quantity: trust.value.quantity,
          price: trust.value.price,
          currentprice: 0,
          transactioncharge: trust.value.transactioncharge,
          othercharges: trust.value.othercharges,
          tax: trust.value.tax,
          trustyield: trust.value.trustyield,
          addbuy: '',
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

  onTrustRetrieved(trust: Trust): void {
    this.trust = trust;
    // Update the data on the form
    this.trustForm.patchValue({
      id: this.trust.id,
      parentid: this.trust.parentid,
      date: format(parseISO(this.trust.date), 'MMM d, yyyy'),
      name: this.trust.name,
      ticker: this.trust.ticker,
      quantity: this.trust.quantity,
      price: this.trust.price,
      currentprice: this.trust.currentprice,
      transactioncharge: this.trust.transactioncharge,
      othercharges: this.trust.othercharges,
      tax: this.trust.tax,
      trustyield: this.trust.trustyield,
      addbuy: this.trust.addbuy,
    });
    this.dateValue = this.trust.date;
    this.formattedDate = format(parseISO(this.trust.date), 'MMM d, yyyy');
  }

  async handleError(error: any): Promise<void> {
    const alert = await this.alertCtrl.create({
      message: error.message,
      buttons: [{ text: 'Ok', role: 'cancel' }]
    });
    await alert.present();
  }
}
