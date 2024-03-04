import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Budget } from 'src/app/models/budget';
import { LoadingController, AlertController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { IonicModule, IonDatetime } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';


@Component({
  selector: 'app-budget-form',
  templateUrl: './budget-form.component.html',
  styleUrls: ['./budget-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class BudgetFormComponent implements OnInit {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  public loading: HTMLIonLoadingElement;
  public budgetForm: FormGroup;
  public budget: Budget;
  @Input() actionButtonText: string;
  @Output() formSubmitted = new EventEmitter<any>();
  public fromDate: any;
  public toDate: any;
  public dateValue = format(new Date(), 'yyyy-MM-dd') + 'T09:00:00.000Z';
  public reviewValue = format(new Date(), 'yyyy-MM-dd') + 'T09:00:00.000Z';
  public formattedDate = format(new Date(), 'MMM dd, yyyy');
  public formattedReviewDate = format(new Date(), 'MMM dd, yyyy');
  showPicker = false;

  constructor(
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {

    this.budgetForm = this.formBuilder.group({
      id: new FormControl(''),
      date: new FormControl(this.formattedDate, [Validators.required]),
      description: new FormControl('', [Validators.required]),
      amount: new FormControl(0, [Validators.required]),
      frequency: new FormControl('Annual', [Validators.required]),
      review: new FormControl(this.formattedReviewDate, [Validators.required]),
      notes: new FormControl('')
    });
  }

  ngOnInit() {
    const toDayYear = new Date().getFullYear();
    this.toDate = `${(toDayYear + 5)}-01-01T11:00`;
    this.fromDate = `${(toDayYear - 5)}-01-01T11:00`;
  }

  dateChanged(value: any) {
    this.dateValue = value;
    this.formattedDate = format(parseISO(value), 'MMM d, yyyy');
    this.showPicker = false;
  }

  reviewChanged(value: any) {
    this.reviewValue = value;
    this.formattedReviewDate = format(parseISO(value), 'MMM d, yyyy');
    this.showPicker = false;
  }

  submitCredentials(budget: FormGroup): void {
    if (!budget.valid) {
      console.log('Form is not valid yet, current value:', budget.value);
    } else {
      const credentials: Budget = {
        id: '',
        date: this.dateValue,
        type: '',
        description: budget.value.description,
        amount: budget.value.amount,
        frequency: budget.value.frequency,
        annual: 0,
        review: this.reviewValue,
        notes: budget.value.notes
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

  onBudgetRetrieved(budget: Budget): void {
    this.budget = budget;
    // Update the data on the form
    this.budgetForm.patchValue({
      id: '',
      date: format(parseISO(this.budget.date), 'MMM d, yyyy'),
      type: '',
      description: this.budget.description,
      amount: this.budget.amount,
      frequency: this.budget.frequency,
      annual: this.budget.annual,
      review: format(parseISO(this.budget.review), 'MMM d, yyyy'),
      notes: this.budget.notes
    });
    this.dateValue = this.budget.date;
    this.reviewValue = this.budget.review;
    this.formattedDate = format(parseISO(this.budget.date), 'MMM d, yyyy');
    this.formattedReviewDate = format(parseISO(this.budget.review), 'MMM d, yyyy');
  }

  async handleError(error: any): Promise<void> {
    const alert = await this.alertCtrl.create({
      message: error.message,
      buttons: [{ text: 'Ok', role: 'cancel' }]
    });
    await alert.present();
  }

}
