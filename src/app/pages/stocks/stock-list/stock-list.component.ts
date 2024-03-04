import { Component, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/user/auth.service';
import { StockService } from '../../../services/stock/stock.service';
import { PortfolioService } from '../../../services/portfolio/portfolio.service';
import { LocalStorageService } from '../../../services/storage/local-storage.service';
import { Stock } from '../../../models/stock';
import { Portfolio } from '../../../models/portfolio';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../services/toast/toast.service';
import { Observable } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class StockListComponent implements OnInit {

  public portfolioId: string;
  public portfolioName: string;
  public portfolio: Portfolio;
  public cashAmount: number;
  public setupBuy: string;
  public stockTickers: Stock[];
  public stock: Stock;
  public stocks: Stock[];
  public stocks$: Observable<Stock[]>;
  public stocksLoaded: boolean;

  public stockitem: Stock = new Stock();

  public caststock: Stock;
  public stockBuyTotal: number;
  public stockCurrentTotal: number;
  private stocksPortfolioSubscription: any;
  private stockPortfolioSubscription: any;
  private stockTickersSubscription: any;
  private portfolioSubscription: any;

  private readonly AuthService = inject(AuthService);
  private readonly user$ = this.AuthService.getUser();

  constructor(
    private stockService: StockService,
    private portfolioService: PortfolioService,
    private localStorageService: LocalStorageService,
    private actionCtrl: ActionSheetController,
    private alertController: AlertController,
    private navController: NavController,
    private route: ActivatedRoute,
    private toastService: ToastService,
  ) {}
  

  ngOnInit() {}

  ionViewWillEnter() {
    this.stockCurrentTotal = 0;
    this.stockBuyTotal = 0;
    this.getidpromise().then(portfolioId => {
      this.stocksLoaded = false;
      this.portfolioId = portfolioId;
      this.stocks$ = this.stockService.getStockListByPortfolioId(this.portfolioId);
      this.stocksPortfolioSubscription = this.stocks$
      .pipe(take(1))
      .subscribe((stocks: Stock[]) => {
        this.stocks = stocks;
        if(this.stocks != undefined) {
          this.stocks.forEach((stock: Stock) => {
            this.stock = stock;
            if(this.stock != undefined) {
              this.stockBuyTotal = this.stockBuyTotal + (this.stock.price * this.stock.quantity / 100) + this.stock.transactioncharge +
              this.stock.tax + this.stock.othercharges;
              this.stockBuyTotal = Math.round(this.stockBuyTotal * 1e2) / 1e2;
              this.stockCurrentTotal = this.stockCurrentTotal + (this.stock.currentprice * this.stock.quantity / 100);
              this.stockCurrentTotal = Math.round(this.stockCurrentTotal * 1e2) / 1e2;
            }
          });
          this.stocksLoaded = true;
          if(this.stocksLoaded ) {
            this.portfolioSubscription = this.portfolioService.getPortfolio(this.portfolioId).pipe(take(1))
            .subscribe((portfolio: Portfolio) => {
              this.portfolio = portfolio;
              if(this.portfolio != undefined) {
                this.portfolioName = this.portfolio.name;
              }
            });
            this.portfolioService.updatePortfolioStocksBalance(this.portfolioId, this.stockCurrentTotal);
          }
        }
      });
    });
  }

  async getidpromise(): Promise<any> {
    return this.route.snapshot.paramMap.get('id');
  }
  
  addStock() {
    this.navController.navigateForward(`/stocks/stock-add/${this.portfolioId}`);
  }

  buyStock() {
    this.navController.navigateForward(`/stocks/stock-buy/${this.portfolioId}`);
  }

  sellStock(
    sid: string
  ) {
    this.navController.navigateForward(`/stocks/stock-sell/${this.portfolioId}/${sid}`);
  }

  updateStock(
    sid: string
  ) {
    this.navController.navigateForward(`/stocks/stock-update/${this.portfolioId}/${sid}`);
  }


  updateStockPrice(
    id: string,
    ticker: string,
    newPrice: number
  ) {
    if (
      newPrice === undefined
    ) {
      this.toastService.displayToast('Check fields are filled in correctly!');
    } else {
      if (ticker !== undefined && ticker !== '') {
        this.stockTickersSubscription = this.stockService.getRealtimeStockListAll()
        .pipe(take(1))
        .subscribe((stocktickers: Stock[]) => {
          this.stockTickers = stocktickers;
          if (this.stockTickers) {
            this.stockTickers.forEach(stock => {
              this.stock = stock;
              if (this.stock.ticker === ticker) {
                this.stockService.updateCurrentPrice(this.stock.id, newPrice);
              }
            });
          }
        });
        const searchit = '^LON';
        if (ticker.search(searchit) !== -1) {
          this.localStorageService.updateTicker(ticker, newPrice);
        }
      } else {
        this.stockService.updateCurrentPrice(id, newPrice);
      }
      this.stockCurrentTotal = 0;
      this.stockBuyTotal = 0;  
      this.toastService.displayToast('Price updated');
    }
    return;
  }
 
  async deleteStock(
    sid: string
  ) {
    const alert = await this.alertController.create({
      message: `Delete stock transaction?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: blah => {
          },
        },
        {
          text: 'Ok',
          handler: () => {
              this.stockPortfolioSubscription=this.stockService.getStock(sid)
              .pipe(take(1))
              .subscribe((stock: Stock) => {
              this.stockitem = stock
              if(this.stockitem != undefined) {
                this.cashAmount = 0;
                this.cashAmount = (this.stockitem.price * this.stockitem.quantity / 100) + this.stockitem.transactioncharge +
                this.stockitem.othercharges + this.stockitem.tax;
                this.cashAmount = Math.round(this.cashAmount * 1e2) / 1e2;                  
                if (this.stockitem.addbuy === 'Buy') {
                  this.portfolio.balance = Math.round((this.portfolio.balance + this.cashAmount) * 1e2) / 1e2;
                  this.portfolio.stocksbalance =  Math.round((this.portfolio.stocksbalance - this.cashAmount) * 1e2) / 1e2;
                } else {
                  this.portfolio.initialstocksbalance = Math.round((this.portfolio.initialstocksbalance - this.cashAmount) * 1e2) / 1e2;
                  this.portfolio.stocksbalance =  Math.round((this.portfolio.stocksbalance - this.cashAmount) * 1e2) / 1e2;
                }

                this.portfolioService.updatePortfolio(this.portfolioId, this.portfolio).then(res => {
                  this.stockService.deleteStock(sid).then(() => {
                    this.toastService.displayToast('Stock deleted.');
                    this.navController.navigateBack(`/stocks/stock-list/${this.portfolioId}`);
                  });
                });
              }
            });
          },
        }
      ],
    });
    await alert.present();
  }

  openMenu(
    sid: string
  ) {
    this.actionCtrl.create({
      buttons: [
        {
          text: 'Manually delete stock',
          handler: () => {
            this.deleteStock(sid);
          }
        },
        {
          text: 'Modify stock asset',
          handler: () => {
            this.updateStock(sid);
          }
        },
        {
          text: 'Sell stock',
          handler: () => {
            this.sellStock(sid);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(ac => ac.present());
  }

  ionViewWillLeave() {
    if (this.portfolioSubscription) {
      this.portfolioSubscription.unsubscribe();
    }
    if (this.stockPortfolioSubscription) {
      this.stockPortfolioSubscription.unsubscribe();
    }
    if (this.stocksPortfolioSubscription) {
      this.stocksPortfolioSubscription.unsubscribe();
    }
    if (this.stockTickersSubscription) {
      this.stockTickersSubscription.unsubscribe();
    }
  }
}
