import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Salary } from 'src/app/models/salary';
import { LoadingController, AlertController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { IonicModule, IonDatetime } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-salaries-form',
  templateUrl: './salaries-form.component.html',
  styleUrls: ['./salaries-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],  
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class SalariesFormComponent  implements OnInit {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  public loading: HTMLIonLoadingElement;
  public salariesForm: FormGroup;
  public salary: Salary;
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
    this.salariesForm = this.formBuilder.group({
        key: new FormControl(''),
        startdate: new FormControl(this.formattedDate, [Validators.required]),
        employer: new FormControl('', [Validators.required]),
        grossincome: new FormControl(0, [Validators.required, Validators.minLength(6)]),
        netincome: new FormControl(0),
        frequency: new FormControl('Monthly', [Validators.required]),
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

  dateChanged(value: string) {
    this.dateValue = value;
    this.formattedDate = format(parseISO(value), 'MMM d, yyyy');
    this.showPicker = false;
  }

  submitCredentials(salary: FormGroup): void {
    if (!salary.valid) {
      console.log('Form is not valid yet, current value:', salary.value);
    } else {
      const credentials: Salary = {
        id: salary.value.id,
        startdate: this.dateValue,
        employer: salary.value.employer,
        grossincome: salary.value.grossincome,
        netincome: salary.value.netincome,
        grossannualincome: salary.value.grossannualincome,
        netannualincome: salary.value.netannualincome,
        frequency: salary.value.frequency,
        taxable: salary.value.taxable,
        forecast: salary.value.forecast,
        notes: salary.value.notes
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

  onSalaryRetrieved(salary: Salary): void {
    this.salary = salary;
    // Update the data on the form
    this.salariesForm.patchValue({
      id: this.salary.id,
      startdate: format(parseISO(this.salary.startdate), 'MMM d, yyyy'),
      employer: this.salary.employer,
      grossincome: this.salary.grossincome,
      netincome: this.salary.netincome,
      grossannualincome: this.salary.grossannualincome,
      netannualincome: this.salary.netannualincome,
      frequency: this.salary.frequency,
      taxable: this.salary.taxable,
      forecast: this.salary.forecast,
      notes: this.salary.notes
    });
    this.dateValue = this.salary.startdate;
    this.formattedDate = format(parseISO(this.salary.startdate), 'MMM d, yyyy');
  }

  async handleError(error: any): Promise<void> {
      const alert = await this.alertCtrl.create({
          message: error.message,
          buttons: [{ text: 'Ok', role: 'cancel' }]
      });
      await alert.present();
  }
}
