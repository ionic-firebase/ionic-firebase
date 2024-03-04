import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Stock } from 'src/app/models/stock';
import { LoadingController, AlertController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { IonicModule, IonDatetime } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-stock-form',
  templateUrl: './stock-form.component.html',
  styleUrls: ['./stock-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],  
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class StockFormComponent  implements OnInit {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  public loading: HTMLIonLoadingElement;
  public stockForm: FormGroup;
  public stock: Stock;
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
    this.stockForm = this.formBuilder.group({
        id: new FormControl(''),
        date: new FormControl(Date(), [Validators.required]),
        name: new FormControl('', [Validators.required]),
        ticker: new FormControl('', [Validators.required]),
        quantity: new FormControl('0', [Validators.required]),
        price: new FormControl('0', [Validators.required]),
        transactioncharge: new FormControl('0', [Validators.required]),
        othercharges: new FormControl('0', [Validators.required]),
        tax: new FormControl('0', [Validators.required]),
        stockyield: new FormControl('0', [Validators.required]),
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

  submitCredentials(stock: FormGroup): void {
    if (!stock.valid) {
        console.log('Form is not valid yet, current value:', stock.value);
      } else {
        const credentials: Stock = {
          id: stock.value.id,
          parentid: '',
          date: this.dateValue,
          name: stock.value.name,
          ticker: stock.value.ticker,
          quantity: stock.value.quantity,
          price: stock.value.price,
          currentprice: 0,
          transactioncharge: stock.value.transactioncharge,
          othercharges: stock.value.othercharges,
          tax: stock.value.tax,
          stockyield: stock.value.stockyield,
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

  onStockRetrieved(stock: Stock): void {
    this.stock = stock;
    // Update the data on the form
    this.stockForm.patchValue({
      id: this.stock.id,
      parentid: this.stock.parentid,
      date: format(parseISO(this.stock.date), 'MMM d, yyyy'),
      name: this.stock.name,
      ticker: this.stock.ticker,
      quantity: this.stock.quantity,
      price: this.stock.price,
      currentprice: this.stock.currentprice,
      transactioncharge: this.stock.transactioncharge,
      othercharges: this.stock.othercharges,
      tax: this.stock.tax,
      stockyield: this.stock.stockyield,
      addbuy: this.stock.addbuy,
    });
    this.dateValue = this.stock.date;
    this.formattedDate = format(parseISO(this.stock.date), 'MMM d, yyyy');
  }

  async handleError(error: any): Promise<void> {
    const alert = await this.alertCtrl.create({
      message: error.message,
      buttons: [{ text: 'Ok', role: 'cancel' }]
    });
    await alert.present();
  }
}
