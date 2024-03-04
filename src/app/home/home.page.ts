import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NavController } from '@ionic/angular';
import { AuthService } from '../services/user/auth.service';
import { LocalStorageService } from '../services/storage/local-storage.service';
import { Stock} from '../models/stock';
import { Trust } from '../models/trust';
import { Settings } from '../models/settings';
import { ToastService } from '../services/toast/toast.service';
import { StockService } from '../services/stock/stock.service';
import { TrustService } from '../services/trust/trust.service';
import { SettingsService } from '../services/settings/settings.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, NgxDatatableModule, FormsModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})


export class HomePage {

  sort: any = 'multi';

  settings: Settings = new Settings();
  private rowsLoaded: boolean;
  public taxyear: string = '';
  public trustList: Trust[];
  public trust: Trust;
  public stocks: any[];
  public stockList: Stock[];
  public stockFoundList: Array<any>;
  public stockRowList: Array<any>;
  public stockRows: any;
  public trustFoundList: Array<any>;
  public trustRowList: Array<any>;
  public trustRows: any;
  public rows: Array<any>;
  public stock: Stock;

  isLoading = false;

  private stocksSubscription: any;
  private trustsSubscription: any;
  private settingsSubscription: any;


  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();
//  readonly stockList$ = this.stockService.getStockListAll();
//  readonly trustList$ = this.trustService.getTrustListAll();

  constructor(
    private localStorageService: LocalStorageService,
    private afsAuth: AuthService,
    private navController: NavController,
    private toastService: ToastService,
    private stockService: StockService,
    private settingsService: SettingsService,
    private trustService: TrustService,

  ) {
    this.localStorageService.clearStorage();
    this.stockFoundList = [];
    this.stocksSubscription = this.stockService.getRealtimeStockListAll()
    .pipe(take(1))
    .subscribe((stocks: Stock[]) => {
      this.stockList = stocks;
      this.stockList.forEach(stock => {
        this.stock = stock;
        if (this.stock) {
          if(typeof this.stock.ticker !== undefined) {
            this.isLoading = true;
            let foundStock = false;
            this.stockFoundList.forEach(eachStock => {
              if (eachStock.ticker === this.stock.ticker) {
                foundStock = true;
              }
            });
            if (foundStock === false) {
              this.localStorageService.addTicker(this.stock.ticker, this.stock.currentprice, 'No', 'Stock', 0, 0, 0);
              this.stockFoundList.push({
                id: this.stock.id,
                name: this.stock.name,
                ticker: this.stock.ticker,
                currentprice: this.stock.currentprice,
                lastprice: this.stock.currentprice,
                isupdated: 'No',
                type: 'Stock',
                buyprice: this.stock.price,
                stockyield: this.stock.stockyield
              });
            }
          }
        }
      });
    });

    this.trustFoundList = [];
    this.trustsSubscription = this.trustService.getRealtimeTrustListAll()
    .pipe(take(1))
    .subscribe((trusts: Trust[]) => {
      this.trustList = trusts;
      this.trustList.forEach(trust => {
        this.trust = trust;
        if (this.trust) {
          if(typeof this.trust.ticker !== undefined) {
            this.isLoading = true;
            let foundTrust = false;
            this.trustFoundList.forEach(eachTrust => {
              if (eachTrust.ticker === this.trust.ticker) {
                foundTrust= true;
              }
            });
            if (foundTrust === false) {
              this.localStorageService.addTicker(this.trust.ticker, this.trust.currentprice, 'No', 'Stock', 0, 0, 0);
              this.trustFoundList.push({
                id: this.trust.id,
                name: this.trust.name,
                ticker: this.trust.ticker,
                currentprice: this.trust.currentprice,
                lastprice: this.trust.currentprice,
                isupdated: 'No',
                type: 'Stock',
                buyprice: this.trust.price,
                trustyield: this.trust.trustyield
              });
            }
          }
        }
      });
    });
    this.toastService.displayToast('Loaded stocks and trusts into memory');
    this.rowsLoaded = true;
    this.settingsSubscription = this.settingsService.getSettingsActive()
    .pipe(take(1))
    .subscribe((settings: Settings[]) => {
      this.settings = settings[0];
    });
  }

  goSettings() {
      this.navController.navigateForward('/settings');
  }

  updateStocksArray(ticker: string, currentprice: number) {
    this.stockList.forEach(stock => {
      if(stock.ticker == ticker) {
        this.stockService.updateCurrentPrice(stock.id, currentprice);
      }

    });
    this.toastService.displayToast('Stock prices updated');
  }

  updateStocksDivArray(ticker: string, stockyield: number) {
    this.stockList.forEach(stock => {
      if(stock.ticker == ticker) {
        this.stockService.updateCurrentYield(stock.id, stockyield);
      }

    });
    this.toastService.displayToast('Stock yield updated');
  }

  updateTrustsArray(ticker: string, currentprice: number) {
    this.trustList.forEach(trust => {
      if(trust.ticker == ticker) {
        this.trustService.updateCurrentPrice(trust.id, currentprice);
      }
    });
    this.toastService.displayToast('Trust prices updated');
  }

  updateTrustsDivArray(ticker: string, trustyield: number) {
    this.trustList.forEach(trust => {
      if(trust.ticker == ticker) {
        this.trustService.updateCurrentYield(trust.id, trustyield);
      }
    });
    this.toastService.displayToast('Trust yield updated');
  }

  logOut() {
      this.afsAuth.logout();
      this.navController.navigateForward('/auth/login');
  }
  ionViewWillLeave() {
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
