import { Component, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { PortfolioService } from '../../../services/portfolio/portfolio.service';
import { SettingsService } from '../../../services/settings/settings.service';
import { StockService } from '../../../services/stock/stock.service';
import { TrustService } from '../../../services/trust/trust.service';
import { Portfolio } from '../../../models/portfolio';
import { Transaction } from '../../../models/transaction';
import { Stock } from '../../../models/stock';
import { Trust } from '../../../models/trust';
import { Reorder } from '../../../models/reorder';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { take } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-portfolio-list',
  templateUrl: './portfolio-list.component.html',
  styleUrls: ['./portfolio-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None

})
export class PortfolioListComponent  implements OnInit {

  slideOpts = {
    initialSlide: 0,
    speed: 300,
    shortSwipes: true
  };
  portfolioList: Portfolio[];
  portfolio: any;
  portfolioId: string;

  portfolioTransactionsList: any[];
  portfolioTransaction: any;
  stockList: Stock[];
  stockList$: Observable<Stock[]>;
  stock: Stock;

  trustList: Trust[];
  trustList$: Observable<Trust[]>;
  trust: Trust;

  portfolioTotalStockBalance: number = 0;
  portfolioTotalTrustBalance: number = 0;
  portfolioTotalCashBalance: number = 0;
  portfolioTotalTotalBalance: number = 0;
  portfolioTotalSIPPBalance: number = 0;
  portfolioTotalISAsBalance: number = 0;
  portfolioTotalTaxableBalance: number = 0;

  portfoliosIsLoaded: boolean = false;
  portfolioStockIsUpdated: boolean = false;
  portfolioTrustIsUpdated: boolean = false;

  portfolioStocksBalance: number = 0;
  portfolioTrustsBalance: number = 0;
  portfolioCashBalance: number = 0;

  private portfoliosSubscription!: Subscription;
  private portfolioTransactionsSubscription!: Subscription;
  private stocksSubscription!: Subscription;
  private trustsSubscription!: Subscription;
  private settingsSubscription!: Subscription;
  
  reorder: Reorder[];
  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private portfolioService: PortfolioService,
    private stockService: StockService,
    private trustService: TrustService,
    private settingsService: SettingsService,
    private actionCtrl: ActionSheetController,
    private alertController: AlertController,
    private navController: NavController,
    private toastService: ToastService
  ) { }

  ngOnInit() {}

  ionViewDidEnter() {

    this.portfoliosSubscription = this.portfolioService.getRealtimePortfolios()
    .subscribe({
      next: (portfolios) => {
        this.portfolioList = portfolios;
        this.portfoliosIsLoaded = false;
        this.portfolioStockIsUpdated =  false;
        this.portfolioTrustIsUpdated =  false;
        this.portfolioStocksBalance = 0;
        this.portfolioTrustsBalance = 0;
        this.portfolioTotalCashBalance = 0;
        this.portfolioTotalStockBalance = 0;
        this.portfolioTotalTrustBalance = 0;
        this.portfolioList = portfolios;

        if(this.portfolioList != undefined) {
          this.portfolioList.forEach((portfolio: Portfolio) => {
            this.portfolioStocksBalance = 0;
            this.portfolioTrustsBalance = 0;
            this.portfolioStockIsUpdated =  false;
            this.portfolioTrustIsUpdated = false;
            this.portfolio = portfolio;
            if(this.portfolio) {
              this.portfolioId = this.portfolio.id;
              this.portfolioTotalCashBalance = this.portfolioTotalCashBalance + this.portfolio.balance;
              this.stocksSubscription = this.stockService.getStockListByPortfolioId(this.portfolioId)
              .pipe(take(1))
              .subscribe((stockList: Stock[]) => {
                this.stockList = stockList;
                this.portfolioStocksBalance = 0;
                this.portfolioStockIsUpdated = false;
                if (this.stockList) {
                  this.portfolioStocksBalance = 0;
                  this.stockList.forEach((stock: Stock) => {
                    this.stock = stock;
                    if (this.stock) {
                      this.portfolioStocksBalance = this.portfolioStocksBalance + (this.stock.currentprice * this.stock.quantity / 100);
                    }
                  });
                  if (!this.portfolioStockIsUpdated) {
                    this.portfolioTotalStockBalance = this.portfolioTotalStockBalance + this.portfolioStocksBalance;
                    this.portfolioStockIsUpdated = true;
                    this.portfolioStocksBalance = 0;
                  }
                }
              });

              this.trustsSubscription = this.trustService.getTrustListByPortfolioId(this.portfolioId)
              .pipe(take(1))
              .subscribe((trustList: Trust[]) => {
                this.trustList = trustList;
                this.portfolioTrustsBalance = 0;
                this.portfolioTrustIsUpdated = false;
                if (this.trustList) {
                  this.portfolioTrustsBalance = 0;
                  this.trustList.forEach((trust: Trust) => {
                    this.trust = trust;
                    if (this.trust) {
                      this.portfolioTrustsBalance = this.portfolioTrustsBalance + (this.trust.currentprice * this.trust.quantity / 100);
                    }
                  });
                  if (!this.portfolioTrustIsUpdated) {
                    this.portfolioTotalTrustBalance = this.portfolioTotalTrustBalance + this.portfolioTrustsBalance;
                    this.portfolioTrustIsUpdated = true;
                    this.portfolioTrustsBalance = 0;
                  }
                }
              });

              const totalPortfolio = this.portfolio.balance + this.portfolio.stocksbalance + this.portfolio.trustsbalance;

              if (this.portfolio.taxable === 'Trading') {
                this.portfolioTotalTaxableBalance = this.portfolioTotalTaxableBalance + totalPortfolio;
              } else if (this.portfolio.taxable === 'SIPP') {
                this.portfolioTotalSIPPBalance = this.portfolioTotalSIPPBalance + totalPortfolio;
              } else if (this.portfolio.taxable === 'ISA') {
                this.portfolioTotalISAsBalance = this.portfolioTotalISAsBalance + totalPortfolio;
              }
              this.portfolioTotalTotalBalance = this.portfolioTotalTotalBalance + totalPortfolio;
            }
          });
          this.portfoliosIsLoaded = true;
        }
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  createPortfolio() {
    this.navController.navigateForward('/portfolios/portfolio-create');
  }

  openMenu(
    id: string
  ) {
    this.actionCtrl.create({
      buttons: [
        {
          text: 'List All Portfolio Transactions',
          handler: () => {
            this.navController.navigateForward(`/portfolios/portfolio-list-transactions/${id}`);
          }
        },
        {
          text: 'Add Cash Transactions',
          handler: () => {
            this.navController.navigateForward(`/portfolios/portfolio-transaction/${id}`);
          }
        },
        {
          text: 'Edit Portfolio',
          handler: () => {
            this.navController.navigateForward(`/portfolios/portfolio-update/${id}`);
          }
        },
        {
          text: 'Delete Portfolio',
          handler: () => {
            this.deletePortfolio(id);
          }
        },
        {
          text: 'List Stocks',
          handler: () => {
            this.navController.navigateRoot(`/stocks/stock-list/${id}`);
          }
        },
        {
          text: 'List Trusts',
          handler: () => {
            this.navController.navigateRoot(`/trusts/trust-list/${id}`);
          }
        },
        {
          text: 'Move Funds',
          handler: () => {
            this.navController.navigateForward(`/portfolios/portfolio-move-funds/${id}`);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(ac => ac.present());
  }

  async deletePortfolio(
    portfolioId: string
  ) {
    const alert =  await this.alertController.create({
      message: `Delete portfolio?`,
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
            this.portfolioService.deletePortfolio(portfolioId).then(() => {
              this.portfolioTransactionsSubscription = this.portfolioService.getPortfolioTransactions(portfolioId)
              .pipe(take(1))
              .subscribe((transactions: Transaction[]) => {
                this.portfolioTransactionsList = transactions;
                this.portfolioTransactionsList.forEach((transaction: Transaction) => {
                  this.portfolioTransaction = transaction;
                  const transactionId = this.portfolioTransaction.id;
                  this.portfolioService.deletePortfolioTransaction(portfolioId, transactionId);
                });
              });
              this.reorder = [];
              this.settingsSubscription = this.settingsService.getReorderByItemId(portfolioId)
              .pipe(take(1))
              .subscribe((reorder: Reorder) => {
                this.reorder[0] = reorder;
                if (this.reorder[0] !== undefined) {
                  const id = this.reorder[0].id;
                  if (id !== undefined) {
                    this.settingsService.deleteReorder(id).then(res => {
                      this.toastService.displayToast('Portfolio deleted.');
                      this.navController.navigateBack(`/portfolios/portfolio-list`);
                    });
                  }
                }
              });
            });
          }
        },
      ],
    });
    await alert.present();
  }

  ionViewWDidLeave() {
    if (this.portfoliosSubscription) {
      this.portfoliosSubscription.unsubscribe();
    }
    if (this.portfolioTransactionsSubscription) {
      this.portfolioTransactionsSubscription.unsubscribe();
    }
    if (this.stocksSubscription) {
      this.stocksSubscription.unsubscribe();
    }
    if (this.trustsSubscription) {
      this.trustsSubscription.unsubscribe();
    }
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }
}
