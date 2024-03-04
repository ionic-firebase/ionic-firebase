import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Loan } from 'src/app/models/loan';
import { LoadingController, AlertController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { IonicModule, IonDatetime } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-loan-form',
  templateUrl: './loan-form.component.html',
  styleUrls: ['./loan-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class LoanFormComponent  implements OnInit {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  public loading: HTMLIonLoadingElement;
  public loanForm: FormGroup;
  public loan: Loan;
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
    this.loanForm = this.formBuilder.group({
      id: new FormControl(''),
      date: new FormControl(this.formattedDate, [Validators.required]),
      name: new FormControl('', [Validators.required]),
      number: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwordhint: new FormControl(''),
      memorableplace: new FormControl(''),
      memorablename: new FormControl(''),
      memorabledate: new FormControl(''),
      initialloan: new FormControl(0, [Validators.required]),
      paymentamount: new FormControl(0, [Validators.required]),
      frequency: new FormControl('Monthly', [Validators.required]),
      notes: new FormControl('')
    });
  }

  ngOnInit() {
    const toDayYear = new Date().getFullYear();
    this.toDate = `${(toDayYear + 20)}-01-01T11:00`;
    this.fromDate = `${(toDayYear - 5)}-01-01T11:00`;
  }

  dateChanged(value: any) {
    this.dateValue = value;
    this.formattedDate = format(parseISO(value), 'MMM d, yyyy');
    this.showPicker = false;
  }

  submitCredentials(loan: FormGroup): void {
    if (!loan.valid) {
      console.log('Form is not valid yet, current value:', loan.value);
    } else {
      const credentials: Loan = {
        id: loan.value.id,
        date: this.dateValue,
        name: loan.value.name,
        number: loan.value.number,
        passwordhint: loan.value.passwordhint,
        memorableplace: loan.value.memorableplace,
        memorablename: loan.value.memorablename,
        memorabledate: loan.value.memorabledate,
        initialloan: loan.value.initialloan,
        balance: loan.value.balance,
        paymentamount: loan.value.paymentamount,
        frequency: loan.value.frequency,
        annualpayments: loan.value.annualpayments,
        notes: loan.value.notes
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

  onLoanRetrieved(loan: Loan): void {
    this.loan = loan;
    // Update the data on the form
    this.loanForm.patchValue({
      id: this.loan.id,
      date: format(parseISO(this.loan.date), 'MMM d, yyyy'),
      name: this.loan.name,
      number: this.loan.number,
      passwordhint: this.loan.passwordhint,
      memorableplace: this.loan.memorableplace,
      memorablename: this.loan.memorablename,
      memorabledate: this.loan.memorabledate,
      initialloan: this.loan.initialloan,
      balance: this.loan.balance,
      paymentamount: this.loan.paymentamount,
      frequency: this.loan.frequency,
      annualpayments: this.loan.annualpayments,
      notes: this.loan.notes,
    });
    this.dateValue = this.loan.date;
    this.formattedDate = format(parseISO(this.loan.date), 'MMM d, yyyy');
  }

  async handleError(error: any): Promise<void> {
    const alert = await this.alertCtrl.create({
      message: error.message,
      buttons: [{ text: 'Ok', role: 'cancel' }]
    });
    await alert.present();
  }
}
