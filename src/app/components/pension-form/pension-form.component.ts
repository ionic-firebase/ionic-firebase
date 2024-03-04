import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Pension } from 'src/app/models/pension';
import { LoadingController, AlertController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { IonicModule, IonDatetime } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-pension-form',
  templateUrl: './pension-form.component.html',
  styleUrls: ['./pension-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],  
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class PensionFormComponent  implements OnInit {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  public loading: HTMLIonLoadingElement;
  public pensionForm: FormGroup;
  public pension: Pension;
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
    this.pensionForm = this.formBuilder.group({
      id: new FormControl(''),
      startdate: new FormControl(this.formattedDate, [Validators.required]),
      name: new FormControl('', [Validators.required]),
      account: new FormControl('', [Validators.required, Validators.minLength(6)]),
      onlineid: new FormControl(''),
      passwordhint: new FormControl(''),
      income: new FormControl(0, [Validators.required]),
      frequency: new FormControl('Monthly', [Validators.required]),
      annualincome: new FormControl(0),
      taxable: new FormControl('Yes', [Validators.required]),
      notes: new FormControl(''),
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

  submitCredentials(pension: FormGroup): void {
    if (!pension.valid) {
      console.log('Form is not valid yet, current value:', pension.value);
    } else {
      const credentials: Pension = {
        id: pension.value.id,
        startdate: this.dateValue,
        name: pension.value.name,
        account: pension.value.account,
        onlineid: pension.value.onlineid,
        passwordhint: pension.value.passwordhint,
        income: pension.value.income,
        frequency: pension.value.frequency,
        annualincome: pension.value.annualincome,
        taxable: pension.value.taxable,
        forecast: pension.value.forecast,
        notes: pension.value.notes
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

  onPensionRetrieved(pension: Pension): void {
    this.pension = pension;
    // Update the data on the form
    this.pensionForm.patchValue({
      id: this.pension.id,
      startdate: format(parseISO(this.pension.startdate), 'MMM d, yyyy'),
      name: this.pension.name,
      account: this.pension.account,
      onlineid: this.pension.onlineid,
      passwordhint: this.pension.passwordhint,
      income: this.pension.income,
      frequency: this.pension.frequency,
      annualincome: this.pension.annualincome,
      taxable: this.pension.taxable,
      notes: this.pension.notes,
    });
    this.dateValue = this.pension.startdate;
    this.formattedDate = format(parseISO(this.pension.startdate), 'MMM d, yyyy');
  }

  async handleError(error: any): Promise<void> {
    const alert = await this.alertCtrl.create({
      message: error.message,
      buttons: [{ text: 'Ok', role: 'cancel' }]
    });
    await alert.present();
  }
}
