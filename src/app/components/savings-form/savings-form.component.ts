import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Saving } from 'src/app/models/saving';
import { LoadingController, AlertController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { IonicModule, IonDatetime } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-savings-form',
  templateUrl: './savings-form.component.html',
  styleUrls: ['./savings-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],  
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class SavingsFormComponent  implements OnInit {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  public loading: HTMLIonLoadingElement;
  public savingsForm: FormGroup;
  public saving: Saving;
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
    this.savingsForm = this.formBuilder.group({
      id: new FormControl(''),
      date: new FormControl(this.formattedDate, [Validators.required]),
      name: new FormControl('', [Validators.required]),
      number: new FormControl('', [Validators.required, Validators.minLength(6)]),
      onlineid: new FormControl(''),
      initialcash: new FormControl(0, [Validators.required]),
      interest: new FormControl(0, [Validators.required]),
      frequency: new FormControl('Annually', [Validators.required]),
      taxable: new FormControl('Yes', [Validators.required]),
      forecast: new FormControl(true, [Validators.required]),
      notes: new FormControl(''),
      passwordhint: new FormControl(''),
      memorableplace: new FormControl(''),
      memorablename: new FormControl(''),
      memorabledate: new FormControl('')
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

  submitCredentials(saving: FormGroup): void {
    if (!saving.valid) {
      console.log('Form is not valid yet, current value:', saving.value);
    } else {
      const credentials: Saving = {
        id: saving.value.id,
        date: this.dateValue,
        name: saving.value.name,
        number: saving.value.number,
        onlineid: saving.value.onlineid,
        passwordhint: saving.value.passwordhint,
        memorableplace: saving.value.memorableplace,
        memorablename: saving.value.memorablename,
        memorabledate: saving.value.memorabledate,
        initialcash: saving.value.initialcash,
        balance: saving.value.balance,
        interest: saving.value.interest,
        annualinterest: saving.value.annualinterest,
        frequency: saving.value.frequency,
        taxable: saving.value.taxable,
        forecast: saving.value.forecast,
        notes: saving.value.notes
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

  onSavingRetrieved(saving: Saving): void {
    this.saving = saving;
    // Update the data on the form
    this.savingsForm.patchValue({
      id: this.saving.id,
      date: format(parseISO(this.saving.date), 'MMM d, yyyy'),
      name: this.saving.name,
      number: this.saving.number,
      onlineid: this.saving.onlineid,
      passwordhint: this.saving.passwordhint,
      memorableplace: this.saving.memorableplace,
      memorablename: this.saving.memorablename,
      memorabledate: this.saving.memorabledate,
      initialcash: this.saving.initialcash,
      balance: this.saving.balance,
      interest: this.saving.interest,
      annualinterest: this.saving.annualinterest,
      frequency: this.saving.frequency,
      taxable: this.saving.taxable,
      forecast: this.saving.forecast,
      notes: this.saving.notes
    });
    this.dateValue = this.saving.date;
    this.formattedDate = format(parseISO(this.saving.date), 'MMM d, yyyy');
  }

  async handleError(error: any): Promise<void> {
    const alert = await this.alertCtrl.create({
      message: error.message,
      buttons: [{ text: 'Ok', role: 'cancel' }]
    });
    await alert.present();
  }
}
