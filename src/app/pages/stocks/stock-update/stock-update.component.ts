import { Component, ViewChild, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ToastService } from '../../../services/toast/toast.service';
import { StockService } from '../../../services/stock/stock.service';
import { Stock } from '../../../models/stock';
import { Portfolio } from '../../../models/portfolio';

import { Transaction } from '../../../models/transaction';
import { PortfolioService } from '../../../services/portfolio/portfolio.service';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from '../../../services/storage/local-storage.service';
import { Subscription } from 'rxjs';
import { StockFormComponent } from 'src/app/components/stock-form/stock-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-stock-update',
  templateUrl: './stock-update.component.html',
  styleUrls: ['./stock-update.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, StockFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class StockUpdateComponent {

  @ViewChild(StockFormComponent, { static: false }) stockForm: StockFormComponent;

  public portfolioId: string;

  currentPortfolio$: Observable<Portfolio> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.portfolioId = params['id'];
      return this.portfolioService.getPortfolio(params['id']);
    })
  );

  public stockId: string;

  currentStock$: Observable<Stock> = this.route.params.pipe(
    switchMap((params: { [sid: string]: string }) => {
      this.stockId = params['sid'];
      return this.stockService.getStock(params['sid']);
    })
  );

  public portfolioTransaction: Transaction = new Transaction();
  public portfolioCashBalance: number;
  public portfolioStocksBalance: number;
  public portfolioInitialStocksBalance: number;
  public portfolioKey: string;
  public portfolioName: string;
  public portfolio: Portfolio = new Portfolio();

  public stock: Stock = new Stock();
  public stockOrig: Stock = new Stock();
  public stockCurrentTicker: string;
  public stockTransactionCharge: number;
  public stockOtherCharges: number;
  public stockTax: number;
  public stockCurrentQuantity: number;
  public stockQuantity: number;

  public transactionDescription: string;
  public transactionOrigDescription: string;
  public transactionType: string;
  public transactionCashAmount: number;
  public transactionOrigCashAmount: number;
  public transactionInitialStocksCost: number;
  public transactionOrigInitialStocksCost: number;

  private portfolioSubscription: any;
  private stockSubscription: any;

  constructor(
    private stockService: StockService,
    private localStorageService: LocalStorageService,
    private portfolioService: PortfolioService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.portfolioSubscription = this.currentPortfolio$.pipe()
    .subscribe(portfolio => {
      this.portfolio = portfolio;
      if(this.portfolio !== undefined) {
        this.portfolioName = this.portfolio.name;
        this.portfolioStocksBalance = portfolio.stocksbalance;
        this.portfolioInitialStocksBalance = portfolio.initialstocksbalance;
        this.portfolioCashBalance = this.portfolio.balance;
        this.stockTransactionCharge = this.portfolio.charge;
        this.stockSubscription = this.currentStock$.pipe()
        .subscribe(stock => {
          this.stock = stock;
          if(this.stock !== undefined) {
            if ( this.stock.addbuy === 'Add') {
              this.transactionOrigCashAmount = 0;
              this.transactionOrigDescription = `VOID: ADD STOCK ${this.stock.quantity} ${this.stock.ticker} @ ${this.stock.price}p`;
              this.transactionType = 'Add stock';
            } else {
              this.transactionOrigCashAmount = ((this.stock.quantity * this.stock.price / 100) +
              this.stock.transactioncharge + this.stock.tax + this.stock.othercharges);
              this.transactionOrigCashAmount = Math.round(this.transactionOrigCashAmount * 1e2) / 1e2;
              this.transactionOrigDescription = `VOID: BUY STOCK ${this.stock.quantity} ${this.stock.ticker} @ ${this.stock.price}p`;
              this.transactionType = 'Buy stock';
            }
            this.transactionOrigInitialStocksCost = (this.stock.quantity * this.stock.price / 100) +
            this.stock.transactioncharge + this.stock.tax + this.stock.othercharges;
            this.transactionOrigInitialStocksCost = Math.round(this.transactionOrigInitialStocksCost * 1e2) / 1e2;
            this.stockOrig.date = this.stock.date;
            this.stockOrig.parentid = this.portfolioId;
            this.stock.transactioncharge = this.stockTransactionCharge;
            this.stockCurrentQuantity = this.stock.quantity;
            this.stockOrig.currentprice = this.stock.currentprice;
            this.stockOrig.price = this.stock.price;
            this.stockOrig.quantity = this.stock.quantity;
            this.stock.date = new Date().toISOString();
            this.stock.transactioncharge = this.stockTransactionCharge;
            this.stock.tax = 0;
            this.stock.othercharges = 0;
            this.stock.price = 0;
            this.stockForm.onStockRetrieved(this.stock);
          }
        });
      }
    });
  }

  async updateStock(stock: Stock): Promise<void> {
    try {
    stock.date = new Date(stock.date).toISOString();
    stock.parentid = this.portfolioId;
    stock.currentprice = this.stockOrig.currentprice;

    if (this.stockOrig.price !== stock.price || this.stockOrig.quantity !== stock.quantity) {
      this.portfolioTransaction = {
        id: '',
        parentid: stock.parentid,
        mode: 'Stock',
        date: this.stockOrig.date,
        description: this.transactionOrigDescription,
        cashamount: this.transactionOrigCashAmount,
        type: this.transactionType
      };
      this.portfolioService.createPortfolioTransaction(this.portfolioId, this.portfolioTransaction).then(transaction => {

        this.transactionInitialStocksCost = (stock.quantity * stock.price / 100) +
        stock.transactioncharge + stock.tax + stock.othercharges;
        this.transactionInitialStocksCost = Math.round(this.transactionInitialStocksCost * 1e2) / 1e2;

        if ( stock.addbuy === 'Add' ) {
          this.transactionCashAmount = 0;
          this.transactionDescription = `UPDATE ADD STOCK ${stock.quantity} ${stock.ticker} @ ${stock.price}p`;
          this.portfolioInitialStocksBalance = this.portfolioInitialStocksBalance - this.transactionOrigInitialStocksCost
          + this.transactionInitialStocksCost;
        } else {
          this.transactionCashAmount = (((stock.quantity * stock.price / 100) +
          stock.transactioncharge + stock.tax + stock.othercharges) * -1 );
          this.transactionCashAmount = Math.round(this.transactionCashAmount * 1e2) / 1e2;
          this.transactionDescription = `UPDATE BUY STOCK ${stock.quantity} ${stock.ticker} @ ${stock.price}p`;

          this.portfolioInitialStocksBalance = this.portfolioInitialStocksBalance + this.transactionOrigInitialStocksCost
          - this.transactionInitialStocksCost;
          this.portfolioInitialStocksBalance = Math.round(this.portfolioInitialStocksBalance * 1e2) / 1e2;
          this.portfolioCashBalance = this.portfolioCashBalance + this.transactionOrigInitialStocksCost
          - this.transactionInitialStocksCost;
          this.portfolioCashBalance = Math.round(this.portfolioCashBalance * 1e2) / 1e2;
          if ( (this.transactionOrigInitialStocksCost - this.transactionInitialStocksCost) !== 0 ) {
            this.portfolioService.updatePortfolioCashBalance(this.portfolioId, this.portfolioCashBalance);
          }
        }

        this.portfolioTransaction = {
          id: '',
          parentid: stock.parentid,
          mode: 'Stock',
          date: stock.date,
          description: this.transactionDescription,
          cashamount: this.transactionCashAmount,
          type: this.transactionType
        };

        this.portfolioService.createPortfolioTransaction(this.portfolioId, this.portfolioTransaction).then(transaction1 => {
          this.portfolioService.updatePortfolioInitialStocksBalance(this.portfolioId, this.portfolioInitialStocksBalance)
          .then(res3 => {
            this.stockService.updateStock(this.stockId, stock).then(res1 => {
              this.toastService.displayToast('Stock asset adjusted');
              this.navController.navigateBack(`/stocks/stock-list/${this.portfolioId}`);
            });
          });
        });
      });
    } else {
      this.stockService.updateStock(this.stockId, stock).then(res1 => {
        this.toastService.displayToast('Stock asset adjusted');
        this.navController.navigateBack(`/stocks/stock-list/${this.portfolioId}`);
      });
    }
    } catch (error) {
      this.stockForm.handleError(error);
    }
  }

  ionViewWillLeave() {
    if (this.portfolioSubscription) {
      this.portfolioSubscription.unsubscribe();
    }
    if (this.stockSubscription) {
      this.stockSubscription.unsubscribe();
    }
  }
}
