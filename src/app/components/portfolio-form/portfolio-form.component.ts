import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Portfolio } from 'src/app/models/portfolio';
import { LoadingController, AlertController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { IonicModule, IonDatetime } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';


@Component({
  selector: 'app-portfolio-form',
  templateUrl: './portfolio-form.component.html',
  styleUrls: ['./portfolio-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],  
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class PortfolioFormComponent  implements OnInit {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  public loading: HTMLIonLoadingElement;
  public portfolioForm: FormGroup;
  public portfolio: Portfolio = new Portfolio();
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
    this.portfolioForm = this.formBuilder.group({
      id: new FormControl(''),
      date: new FormControl(this.formattedDate, [Validators.required]),
      name: new FormControl('', [Validators.required]),
      onlineid: new FormControl(''),
      number: new FormControl('', [Validators.required, Validators.minLength(6)]),
      passwordhint: new FormControl(''),
      memorableplace: new FormControl(''),
      memorablename: new FormControl(''),
      memorabledate: new FormControl(''),
      charge: new FormControl(0, [Validators.required]),
      initialcash: new FormControl(0, [Validators.required]),
      initialstocksbalance: new FormControl(0, [Validators.required]),
      initialtrustsbalance: new FormControl(0, [Validators.required]),
      taxable: new FormControl('SIPP', [Validators.required]),
      stocksbalance: new FormControl(0, [Validators.required]),
      trustsbalance: new FormControl(0, [Validators.required]),
      balance: new FormControl(0, [Validators.required]),
      notes: new FormControl(''),
      forecast: new FormControl(true, [Validators.required])
    });
  }

  ngOnInit() {
    const toDayYear = new Date().getFullYear();
    this.toDate = `${(toDayYear + 1)}-01-01T11:00:00`;
    this.fromDate = `${(toDayYear - 5)}-01-01T11:00:00`;
  }

  dateChanged(value: any) {
    this.dateValue = value;
    this.formattedDate = format(parseISO(value), 'MMM d, yyyy');
    this.showPicker = false;
  }

  submitCredentials(portfolio: FormGroup): void {
    if (!portfolio.valid) {
      console.log('Form is not valid yet, current value:', portfolio.value);
    } else {
      const credentials: Portfolio = {
        id: portfolio.value.id,
        date: this.dateValue,
        name: portfolio.value.name,
        number: portfolio.value.number,
        onlineid: portfolio.value.onlineid,
        passwordhint: portfolio.value.passwordhint,
        memorableplace: portfolio.value.memorableplace,
        memorablename: portfolio.value.memorablename,
        memorabledate: portfolio.value.memorabledate,
        charge: portfolio.value.charge,
        initialcash: portfolio.value.initialcash,
        initialstocksbalance: portfolio.value.initialstocksbalance,
        initialtrustsbalance: portfolio.value.initialtrustsbalance,
        taxable: portfolio.value.taxable,
        stocksbalance: portfolio.value.stocksbalance,
        trustsbalance: portfolio.value.trustsbalance,
        balance: portfolio.value.balance,
        forecast: portfolio.value.forecast,
        notes: portfolio.value.notes
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

  onPortfolioRetrieved(portfolio: Portfolio): void {
    this.portfolio = portfolio;
    this.portfolioForm.patchValue({
      id: this.portfolio.id,
      date: format(parseISO(this.portfolio.date), 'MMM d, yyyy'),
      name: this.portfolio.name,
      number: this.portfolio.number,
      onlineid: this.portfolio.onlineid,
      passwordhint: this.portfolio.passwordhint,
      memorableplace: this.portfolio.memorableplace,
      memorablename: this.portfolio.memorablename,
      memorabledate: this.portfolio.memorabledate,
      charge: this.portfolio.charge,
      initialcash: this.portfolio.initialcash,
      initialstocksbalance: portfolio.initialstocksbalance,
      initialtrustsbalance: portfolio.initialtrustsbalance,
      taxable: portfolio.taxable,
      stocksbalance: portfolio.stocksbalance,
      trustsbalance: portfolio.trustsbalance,
      balance: portfolio.balance,
      forecast: portfolio.forecast,
      notes: portfolio.notes
    });
    this.dateValue = this.portfolio.date;
    this.formattedDate = format(parseISO(this.portfolio.date), 'MMM d, yyyy');
  }

  async handleError(error: any): Promise<void> {
    const alert = await this.alertCtrl.create({
      message: error.message,
      buttons: [{ text: 'Ok', role: 'cancel' }]
    });
    await alert.present();
  }
}
