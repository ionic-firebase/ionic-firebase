import { Component, ViewChild, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
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
import { StockFormComponent } from 'src/app/components/stock-form/stock-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { take} from 'rxjs';

@Component({
  selector: 'app-stock-sell',
  templateUrl: './stock-sell.component.html',
  styleUrls: ['./stock-sell.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, StockFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})

export class StockSellComponent {

  @ViewChild(StockFormComponent, { static: false }) stockForm: StockFormComponent;
  public stockTransaction: Stock = new Stock();
  public portfolioTransaction: Transaction = new Transaction();

  public portfolioId: string;
  public portfolioName: string;
  public portfolio: Portfolio = new Portfolio();

  public stockId: string;
  public stockDate: string;
  public stock: Stock = new Stock();
  public stockCurrentQuantity: number;
  public stockQuantity: number;
  public stockCurrentTicker: string;
  public stockTransactionCharge: number;
  public stockOtherCharges: number;
  public stockTax: number;

  public transactionCashAmount: number;
  public portfolioCashBalance: number;

  private portfolioSubscription: any;
  private stockSubscription: any;

  constructor(
    private stockService: StockService,
    private portfolioService: PortfolioService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.getidpromise().then(result => {
      this.portfolioId = result;
      this.portfolioSubscription = this.portfolioService.getPortfolio(this.portfolioId)
      .pipe(take(1))
      .subscribe((portfolio: Portfolio) => {
        this.portfolio = portfolio;
        if(this.portfolio !== undefined) {
          this.portfolioName = this.portfolio.name;
          this.portfolioCashBalance = this.portfolio.balance;
          this.stockTransactionCharge = this.portfolio.charge;
          this.getsidpromise().then(result2 => {
            this.stockId = result2;
            this.stockSubscription = this.stockService.getStock(this.stockId)
            .pipe(take(1))
            .subscribe((stock: Stock) => {
              this.stock = stock;
              if(this.stock !== undefined) {
                this.stock.transactioncharge = this.stockTransactionCharge;
                this.stockCurrentQuantity = this.stock.quantity;
                this.stock.date = new Date().toISOString();
                this.stock.tax = 0;
                this.stock.othercharges = 0;
                this.stock.price = 0;

                this.stockForm.onStockRetrieved(this.stock);
              }
            });
          });
        }
      });
    });
  }

  async getidpromise(): Promise<any> {
    return this.route.snapshot.paramMap.get('id');
  }

  async getsidpromise(): Promise<any> {
    return this.route.snapshot.paramMap.get('sid');
  }

  async sellStock(stock: Stock): Promise<void> {
    try {
      stock.date = new Date(stock.date).toISOString();
      this.transactionCashAmount = (stock.quantity * stock.price / 100) -
        stock.transactioncharge - stock.othercharges - stock.tax;
      this.transactionCashAmount = Math.round(this.transactionCashAmount * 1e2) / 1e2;
      const transactionDescription = `SELL ${stock.quantity} ${stock.ticker} @ ${stock.price}p`;
      this.portfolioTransaction = {
        id: '',
        parentid: this.portfolioId,
        mode: 'Stock',
        date: stock.date,
        description: transactionDescription,
        cashamount: this.transactionCashAmount,
        type: 'Sell stock'
      };
      this.portfolioService.createPortfolioTransaction(this.portfolioId, this.portfolioTransaction).then(res => {
        this.portfolioCashBalance = this.portfolioCashBalance + this.transactionCashAmount;
        this.portfolioCashBalance = Math.round(this.portfolioCashBalance * 1e2) / 1e2;
        this.portfolioService.updatePortfolioCashBalance(this.portfolioId, this.portfolioCashBalance).then(res2 => {
          if ( this.stockCurrentQuantity === stock.quantity) {
            this.stockService.deleteStock(this.stockId);
          } else {
            const newQuantity = this.stockCurrentQuantity - stock.quantity;
            this.stockService.updateQuantity(this.stockId, newQuantity);
          }
          this.toastService.displayToast('Stock asset sold');
          this.navController.navigateBack(`/stocks/stock-list/${this.portfolioId}`);
        });
      });
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
