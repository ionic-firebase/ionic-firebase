import { Component, ViewChild, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { StockService } from '../../../services/stock/stock.service';
import { Stock } from '../../../models/stock';
import { Portfolio } from '../../../models/portfolio';
import { Transaction } from '../../../models/transaction';
import { PortfolioService } from '../../../services/portfolio/portfolio.service';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from '../../../services/storage/local-storage.service';
import { StockFormComponent } from 'src/app/components/stock-form/stock-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, switchMap, take} from 'rxjs';


@Component({
  selector: 'app-stock-buy',
  templateUrl: './stock-buy.component.html',
  styleUrls: ['./stock-buy.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, StockFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class StockBuyComponent {
  public displaySetupBuy = true;

  @ViewChild(StockFormComponent, { static: false }) stockForm: StockFormComponent;

  currentPortfolio$: Observable<Portfolio> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.portfolioId = params['id'];
      return this.portfolioService.getPortfolio(params['id']);
    })
  );

  public portfolioId: string;
  public portfolio: Portfolio;
  public portfolioName: string;
  public portfolioTransaction: Transaction = new Transaction();
  public stockDate: any;
  public stockCurrentPrice: number;
  public stock: Stock = new Stock();
  public transactionCashAmount: number;
  public transactionInitialStocksCost: number;

  private portfolioSubscription: any;

  public stockSymbols: string [] = [];
  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

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
    this.portfolioSubscription = this.currentPortfolio$
    .pipe(take(1))
    .subscribe((portfolio: Portfolio) => {
      this.portfolio = portfolio;
      this.portfolioName = portfolio.name;
      if(this.portfolio != undefined) {
        this.stock =  {
          id: '',
          parentid: this.portfolioId,
          date: new Date().toISOString(),
          name: '',
          ticker: '',
          quantity: 0,
          price: 0,
          transactioncharge: this.portfolio.charge,
          tax: 0,
          othercharges: 0,
          stockyield: 0,
          currentprice: 0,
          addbuy: 'Buy'
        };
        this.stockForm.onStockRetrieved(this.stock);
      }
    });
  }

  async buyStock(stock: Stock): Promise<void> {
    try {
      stock.currentprice = stock.price;
      stock.date = new Date(stock.date).toISOString();
      stock.parentid = this.portfolioId;
      stock.addbuy = 'Buy';
      this.localStorageService.addTicker(stock.ticker, stock.currentprice, 'No', 'Stock', 0, 0, 0);

      const transactionDescription = `BUY ${stock.quantity} ${stock.ticker} @ ${stock.price}p`;
      this.transactionInitialStocksCost = ((stock.quantity * stock.price / 100) +
        stock.transactioncharge + stock.tax + stock.othercharges) * -1;
      this.transactionInitialStocksCost = Math.round(this.transactionInitialStocksCost * 1e2) / 1e2;

      this.portfolioTransaction = {
        id: '',
        parentid: this.portfolioId,
        mode: 'Stock',
        date: stock.date,
        description: transactionDescription,
        cashamount: this.transactionInitialStocksCost,
        type: 'Buy stock'
      };
      this.portfolioService.createPortfolioTransaction(this.portfolioId, this.portfolioTransaction);
      this.portfolio.balance = Math.round((this.portfolio.balance - this.transactionInitialStocksCost) * 1e2) / 1e2;
      this.portfolio.stocksbalance =  Math.round((this.portfolio.stocksbalance + this.transactionInitialStocksCost) * 1e2) / 1e2;

      this.stockService.createStock(stock).then(res => {
        this.portfolioService.updatePortfolio(this.portfolioId, this.portfolio)
          .then(res3 => {
          this.toastService.displayToast('Stock bought');
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
  }
}