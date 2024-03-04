import { Component, ViewChild, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ToastService } from '../../../services/toast/toast.service';
import { TrustService } from '../../../services/trust/trust.service';
import { Trust } from '../../../models/trust';
import { Portfolio } from '../../../models/portfolio';
import { Transaction } from '../../../models/transaction';
import { PortfolioService } from '../../../services/portfolio/portfolio.service';
import { ActivatedRoute } from '@angular/router';
import { TrustFormComponent } from 'src/app/components/trust-form/trust-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { take} from 'rxjs';

@Component({
  selector: 'app-trust-sell',
  templateUrl: './trust-sell.component.html',
  styleUrls: ['./trust-sell.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TrustFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})

export class TrustSellComponent {

  @ViewChild(TrustFormComponent, { static: false }) trustForm: TrustFormComponent;
  public trustTransaction: Trust = new Trust();
  public portfolioTransaction: Transaction = new Transaction();

  public portfolioId: string;
  public portfolioName: string;
  public portfolio: Portfolio = new Portfolio();

  public portfolioTransactionKey: string;
  public displaySetupBuy = false;

  public trustId: string;
  public trustDate: string;
  public trust: Trust = new Trust();
  public trustCurrentQuantity: number;
  public trustQuantity: number;

  public trustCurrentTicker: string;
  public trustTransactionCharge: number;
  public trustOtherCharges: number;
  public trustTax: number;

  public transactionCashAmount: number;
  public portfolioCashBalance: number;
  
  private portfolioSubscription: any;
  private trustSubscription: any;

  constructor(
    private trustService: TrustService,
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
          this.trustTransactionCharge = this.portfolio.charge;
          this.getsidpromise().then(result2 => {
            this.trustId = result2;
            this.trustSubscription = this.trustService.getTrust(this.trustId)
            .pipe(take(1))
            .subscribe((trust: Trust) => {
              this.trust = trust;
              if(this.trust !== undefined) {
                this.trust.transactioncharge = this.trustTransactionCharge;
                this.trustCurrentQuantity = this.trust.quantity;
                this.trust.date = new Date().toISOString();
                this.trust.tax = 0;
                this.trust.othercharges = 0;
                this.trust.price = 0;

                this.trustForm.onTrustRetrieved(this.trust);
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

  async sellTrust(trust: Trust): Promise<void> {
    try {
      trust.date = new Date(trust.date).toISOString();
      this.transactionCashAmount = (trust.quantity * trust.price / 100) -
        trust.transactioncharge - trust.othercharges - trust.tax;
      this.transactionCashAmount = Math.round(this.transactionCashAmount * 1e2) / 1e2;
      const transactionDescription = `SELL ${trust.quantity} ${trust.ticker} @ ${trust.price}p`;
      this.portfolioTransaction = {
        id: '',
        parentid: this.portfolioId,
        mode: 'Trust',
        date: trust.date,
        description: transactionDescription,
        cashamount: this.transactionCashAmount,
        type: 'Sell trust'
      };
      this.portfolioService.createPortfolioTransaction(this.portfolioId, this.portfolioTransaction).then(res => {
        this.portfolioCashBalance = this.portfolioCashBalance + this.transactionCashAmount;
        this.portfolioCashBalance = Math.round(this.portfolioCashBalance * 1e2) / 1e2;
        this.portfolioService.updatePortfolioCashBalance(this.portfolioId, this.portfolioCashBalance).then(res2 => {
          if ( this.trustCurrentQuantity === trust.quantity) {
            this.trustService.deleteTrust(this.trustId);
          } else {
            const newQuantity = this.trustCurrentQuantity - trust.quantity;
            this.trustService.updateQuantity(this.trustId, newQuantity);
          }
          this.toastService.displayToast('Trust asset sold');
          this.navController.navigateBack(`/trusts/trust-list/${this.portfolioId}`);
        });
      });
    } catch (error) {
      this.trustForm.handleError(error);
    }
  }

  ionViewWillLeave() {
    if (this.portfolioSubscription) {
      this.portfolioSubscription.unsubscribe();
    }
    if (this.trustSubscription) {
      this.trustSubscription.unsubscribe();
    }
  }

}
