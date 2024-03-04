import { Component, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/user/auth.service';
import { TrustService } from '../../../services/trust/trust.service';
import { PortfolioService } from '../../../services/portfolio/portfolio.service';
import { LocalStorageService } from '../../../services/storage/local-storage.service';
import { Trust } from '../../../models/trust';
import { Portfolio } from '../../../models/portfolio';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../services/toast/toast.service';
import { Observable} from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-trust-list',
  templateUrl: './trust-list.component.html',
  styleUrls: ['./trust-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class TrustListComponent implements OnInit {

  public portfolioId: string;
  public portfolioName: string;
  public portfolio: Portfolio;
  public cashAmount: number;
  public setupBuy: string;
  public trustTickers: Trust[];
  public trust: Trust;
  public trusts: Trust[];
  public trusts$: Observable<Trust[]>;
  public trustsLoaded: boolean;

  public trustitem: Trust = new Trust();

  public casttrust: Trust;
  public trustBuyTotal: number;
  public trustCurrentTotal: number;
  private trustsPortfolioSubscription: any;
  private trustPortfolioSubscription: any;
  private trustTickersSubscription: any;
  private portfolioSubscription: any;

  private readonly AuthService = inject(AuthService);
  private readonly user$ = this.AuthService.getUser();

  constructor(
    private trustService: TrustService,
    private portfolioService: PortfolioService,
    private localStorageService: LocalStorageService,
    private actionCtrl: ActionSheetController,
    private alertController: AlertController,
    private navController: NavController,
    private route: ActivatedRoute,
    private toastService: ToastService,
  ) {
  }
  
  ngOnInit() {}

  ionViewDidEnter() {
        
    this.getidpromise().then(portfolioId => {
      this.portfolioId = portfolioId;
      this.trustsLoaded = false;
      this.trusts$ = this.trustService.getTrustListByPortfolioId(this.portfolioId);
      this.trustsPortfolioSubscription = this.trusts$
      .pipe(take(1))
      .subscribe((trusts: Trust[]) => {
        this.trustCurrentTotal = 0;
        this.trustBuyTotal = 0; 
        this.trusts = trusts;
        if(this.trusts != undefined) {
          this.trusts.forEach((trust: Trust) => {
            this.trustBuyTotal = this.trustBuyTotal + (trust.price * trust.quantity / 100) + trust.transactioncharge +
            trust.tax + trust.othercharges;
            this.trustBuyTotal = Math.round(this.trustBuyTotal * 1e2) / 1e2;
            this.trustCurrentTotal = this.trustCurrentTotal + (trust.currentprice * trust.quantity / 100);
            this.trustCurrentTotal = Math.round(this.trustCurrentTotal * 1e2) / 1e2;
          });
          this.trustsLoaded = true;
          if(this.trustsLoaded) {
            this.portfolioSubscription = this.portfolioService.getPortfolio(this.portfolioId).pipe(take(1))
            .subscribe((portfolio: Portfolio) => {
              this.portfolio = portfolio;
              if(this.portfolio != undefined) {
                this.portfolioName = this.portfolio.name;
              }
            });
            this.portfolioService.updatePortfolioTrustsBalance(this.portfolioId, this.trustCurrentTotal);
          }
        }
      });
    });
  }

  async getidpromise(): Promise<any> {
    return this.route.snapshot.paramMap.get('id');
  }
  
  addTrust() {
    this.navController.navigateForward(`/trusts/trust-add/${this.portfolioId}`);
  }

  buyTrust() {
    this.navController.navigateForward(`/trusts/trust-buy/${this.portfolioId}`);
  }

  sellTrust(
    sid: string
  ) {
    this.navController.navigateForward(`/trusts/trust-sell/${this.portfolioId}/${sid}`);
  }

  updateTrust(
    sid: string
  ) {
    this.navController.navigateForward(`/trusts/trust-update/${this.portfolioId}/${sid}`);
  }

  updateTrustPrice(
    id: string,
    ticker: string,
    newPrice: number
  ) {
    if (newPrice === undefined) {
      this.toastService.displayToast('Check fields are filled in correctly!');
    } else {
      if (ticker !== undefined && ticker !== '') {
        this.trustTickersSubscription = this.trustService.getRealtimeTrustListAll()
        .pipe(take(1))
        .subscribe(trusttickers => {
          this.trustTickers = trusttickers;
          if (this.trustTickers) {
            this.trustTickers.forEach(trust => {
              this.trust = trust;
              if (this.trust.ticker === ticker) {
                this.trustService.updateCurrentPrice(this.trust.id, newPrice);
              }
            });
          }
        });
        const searchit = '^LON';
        if (ticker.search(searchit) !== -1) {
          this.localStorageService.updateTicker(ticker, newPrice);
        }
      } else {
        this.trustService.updateCurrentPrice(id, newPrice);
      }
      this.trustCurrentTotal = 0;
      this.trustBuyTotal = 0; 
      this.toastService.displayToast('Price updated');
    }
    return;
  }
 
  async deleteTrust(
    sid: string
  ) {
    const alert = await this.alertController.create({
      message: `Delete trust transaction?`,
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
              this.trustPortfolioSubscription = this.trustService.getTrust(sid)
              .pipe(take(1))
              .subscribe((trust: Trust) => {
              this.trustitem = trust
              if(this.trustitem != undefined) {
              this.cashAmount = 0;
              this.cashAmount = (this.trustitem.price * this.trustitem.quantity / 100) + this.trustitem.transactioncharge +
              this.trustitem.othercharges + this.trustitem.tax;
              this.cashAmount = Math.round(this.cashAmount * 1e2) / 1e2;
              if (this.setupBuy === 'Buy') {
                this.portfolio.balance = Math.round((this.portfolio.balance + this.cashAmount) * 1e2) / 1e2;
                this.portfolio.trustsbalance =  Math.round((this.portfolio.trustsbalance - this.cashAmount) * 1e2) / 1e2;
              } else {
                this.portfolio.initialtrustsbalance = Math.round((this.portfolio.initialtrustsbalance - this.cashAmount) * 1e2) / 1e2;
                this.portfolio.trustsbalance =  Math.round((this.portfolio.trustsbalance - this.cashAmount) * 1e2) / 1e2;
              }

              this.portfolioService.updatePortfolio(this.portfolioId, this.portfolio).then(res => {
                this.trustService.deleteTrust(sid).then(() => {
                  this.toastService.displayToast('Trust deleted.');
                  this.navController.navigateBack(`/trusts/trust-list/${this.portfolioId}`);
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
          text: 'Manually delete trust',
          handler: () => {
            this.deleteTrust(sid);
          }
        },
        {
          text: 'Modify trust asset',
          handler: () => {
            this.updateTrust(sid);
          }
        },
        {
          text: 'Sell trust',
          handler: () => {
            this.sellTrust(sid);
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
    if (this.trustPortfolioSubscription) {
      this.trustPortfolioSubscription.unsubscribe();
    }
    if (this.trustsPortfolioSubscription) {
      this.trustsPortfolioSubscription.unsubscribe();
    }
    if (this.trustTickersSubscription) {
      this.trustTickersSubscription.unsubscribe();
    }
  }
}
