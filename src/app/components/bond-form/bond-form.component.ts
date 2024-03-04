import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Bond } from 'src/app/models/bond';
import { LoadingController, AlertController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { IonicModule, IonDatetime } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-bond-form',
  templateUrl: './bond-form.component.html',
  styleUrls: ['./bond-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})

export class BondFormComponent implements OnInit {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  public loading: HTMLIonLoadingElement;
  public bondForm: FormGroup;
  public bond: Bond;
  @Input() actionButtonText: string;
  @Output() formSubmitted = new EventEmitter<any>();
  public fromDate: any;
  public toDate: any;
  public dateValue = format(new Date(), 'yyyy-MM-dd') + 'T09:00:00.000Z';
  public formattedDate = format(new Date(), 'MMM dd, yyyy');
  showPicker = false;

  constructor(
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    this.bondForm = this.formBuilder.group({
      id: new FormControl(''),
      date: new FormControl(this.formattedDate, [Validators.required]),
      name: new FormControl('', [Validators.required]),
      onlineid: new FormControl(''),
      number: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwordhint: new FormControl(''),
      memorableplace: new FormControl(''),
      memorablename: new FormControl(''),
      memorabledate: new FormControl(''),
      initialcash: new FormControl(0, [Validators.required]),
      balance: new FormControl(0),
      interestrate: new FormControl(0, [Validators.required]),
      interestpayable: new FormControl(0, [Validators.required]),
      frequency: new FormControl('Monthly', [Validators.required]),
      maturity: new FormControl('5', [Validators.required]),
      taxable: new FormControl('Yes', [Validators.required]),
      notes: new FormControl(''),
      annualinterest: new FormControl(''),
      forecast: new FormControl(true, [Validators.required])
    });
  }

  ngOnInit() {
    const toDayYear = new Date().getFullYear();
    this.toDate = `${(toDayYear + 1)}-01-01T11:00`;
    this.fromDate = `${(toDayYear - 5)}-01-01T11:00`;
  }

  dateChanged(value: any) {
    this.dateValue = value;
    this.formattedDate = format(parseISO(value), 'MMM d, yyyy');
    this.showPicker = false;
  }

  submitCredentials(bond: FormGroup): void {
    if (!bond.valid) {
      console.log('Form is not valid yet, current value:', bond.value);
    } else {
      const credentials: Bond = {
        id: bond.value.id,
        date: this.dateValue,
        name: bond.value.name,
        number: bond.value.number,
        onlineid: bond.value.onlineid,
        passwordhint: bond.value.passwordhint,
        memorableplace: bond.value.memorableplace,
        memorablename: bond.value.memorablename,
        memorabledate: bond.value.memorabledate,
        initialcash: bond.value.initialcash,
        balance: bond.value.balance,
        interestrate: bond.value.interestrate,
        interestpayable: bond.value.interestpayable,
        frequency: bond.value.frequency,
        maturity: bond.value.maturity,
        annualinterest: 0,
        taxable: bond.value.taxable,
        notes: bond.value.notes,
        forecast: bond.value.forecast
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

  onBondRetrieved(bond: Bond): void {
    this.bond = bond;
    // Update the data on the form
    this.bondForm.patchValue({
      id: this.bond.id,
      date: format(parseISO(this.bond.date), 'MMM d, yyyy'),
      name: this.bond.name,
      number: this.bond.number,
      onlineid: this.bond.onlineid,
      passwordhint: this.bond.passwordhint,
      memorableplace: this.bond.memorableplace,
      memorablename: this.bond.memorablename,
      memorabledate: this.bond.memorabledate,
      initialcash: this.bond.initialcash,
      balance: this.bond.balance,
      interestrate: this.bond.interestrate,
      interestpayable: this.bond.interestpayable,
      frequency: this.bond.frequency,
      maturity: this.bond.maturity,
      annualinterest: this.bond.annualinterest,
      taxable: this.bond.taxable,
      notes: this.bond.notes,
      forecast: this.bond.forecast
    });
    this.dateValue = this.bond.date;
    this.formattedDate = format(parseISO(this.bond.date), 'MMM d, yyyy');
  }

  async handleError(error: any): Promise<void> {
    const alert = await this.alertCtrl.create({
      message: error.message,
      buttons: [{ text: 'Ok', role: 'cancel' }]
    });
    await alert.present();
  }
}
