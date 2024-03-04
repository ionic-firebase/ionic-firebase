import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Debt } from 'src/app/models/debt';
import { LoadingController, AlertController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { IonicModule, IonDatetime } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-debt-form',
  templateUrl: './debt-form.component.html',
  styleUrls: ['./debt-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class DebtFormComponent  implements OnInit {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  public loading: HTMLIonLoadingElement;
  public debtForm: FormGroup;
  public debt: Debt;
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
    this.debtForm = this.formBuilder.group({
      id: new FormControl(''),
      date: new FormControl(this.formattedDate, [Validators.required]),
      name: new FormControl('', [Validators.required]),
      number: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwordhint: new FormControl(''),
      memorableplace: new FormControl(''),
      memorablename: new FormControl(''),
      memorabledate: new FormControl(''),
      initialdebt: new FormControl(0, [Validators.required]),
      paymentamount: new FormControl(0, [Validators.required]),
      frequency: new FormControl('Monthly', [Validators.required]),
      notes: new FormControl('')
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

  submitCredentials(debt: FormGroup): void {
    if (!debt.valid) {
      console.log('Form is not valid yet, current value:', debt.value);
    } else {
      const credentials: Debt = {
        id: debt.value.id,
        date: this.dateValue,
        name: debt.value.name,
        number: debt.value.number,
        passwordhint: debt.value.passwordhint,
        memorableplace: debt.value.memorableplace,
        memorablename: debt.value.memorablename,
        memorabledate: debt.value.memorabledate,
        initialdebt: debt.value.initialdebt,
        balance: debt.value.balance,
        paymentamount: debt.value.paymentamount,
        frequency: debt.value.frequency,
        annualpayments: debt.value.annualpayments,
        notes: debt.value.notes
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

  onDebtRetrieved(debt: Debt): void {
    this.debt = debt;
    // Update the data on the form
    this.debtForm.patchValue({
      id: this.debt.id,
      date: format(parseISO(this.debt.date), 'MMM d, yyyy'),
      name: this.debt.name,
      number: this.debt.number,
      passwordhint: this.debt.passwordhint,
      memorableplace: this.debt.memorableplace,
      memorablename: this.debt.memorablename,
      memorabledate: this.debt.memorabledate,
      initialdebt: this.debt.initialdebt,
      balance: this.debt.balance,
      paymentamount: this.debt.paymentamount,
      frequency: this.debt.frequency,
      annualpayments: this.debt.annualpayments,
      notes: this.debt.notes,
    });
    this.dateValue = this.debt.date;
    this.formattedDate = format(parseISO(this.debt.date), 'MMM d, yyyy');
  }

  async handleError(error: any): Promise<void> {
    const alert = await this.alertCtrl.create({
      message: error.message,
      buttons: [{ text: 'Ok', role: 'cancel' }]
    });
    await alert.present();
  }
}
