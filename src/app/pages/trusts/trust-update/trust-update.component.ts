import { Component, ViewChild, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
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
import { Subscription } from 'rxjs';
import { TrustFormComponent } from 'src/app/components/trust-form/trust-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-trust-update',
  templateUrl: './trust-update.component.html',
  styleUrls: ['./trust-update.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, TrustFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class TrustUpdateComponent {

  @ViewChild(TrustFormComponent, { static: false }) trustForm: TrustFormComponent;

  public portfolioId: string;

  currentPortfolio$: Observable<Portfolio> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.portfolioId = params['id'];
      return this.portfolioService.getPortfolio(params['id']);
    })
  );

  public trustId: string;

  currentTrust$: Observable<Trust> = this.route.params.pipe(
    switchMap((params: { [sid: string]: string }) => {
      this.trustId = params['sid'];
      return this.trustService.getTrust(params['sid']);
    })
  );

  public portfolioTransaction: Transaction = new Transaction();
  public portfolioCashBalance: number;
  public portfolioTrustBalance: number;
  public portfolioInitialTrustsBalance: number;
  public portfolioKey: string;
  public portfolioName: string;
  public portfolio: Portfolio = new Portfolio();

  public trust: Trust = new Trust();
  public trustOrig: Trust = new Trust();
  public trustCurrentTicker: string;
  public trustTransactionCharge: number;
  public trustOtherCharges: number;
  public trustTax: number;
  public trustCurrentQuantity: number;
  public trustQuantity: number;

  public transactionDescription: string;
  public transactionOrigDescription: string;
  public transactionType: string;
  public transactionCashAmount: number;
  public transactionOrigCashAmount: number;
  public transactionInitialTrustsCost: number;
  public transactionOrigInitialTrustsCost: number;

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
    this.portfolioSubscription = this.currentPortfolio$.pipe()
    .subscribe((portfolio: Portfolio) => {
      this.portfolio = portfolio;
      if(this.portfolio !== undefined) {
        this.portfolioName = this.portfolio.name;
        this.portfolioTrustBalance = portfolio.trustsbalance;
        this.portfolioInitialTrustsBalance = portfolio.initialtrustsbalance;
        this.portfolioCashBalance = this.portfolio.balance;
        this.trustTransactionCharge = this.portfolio.charge;
        this.trustSubscription = this.currentTrust$.pipe()
        .subscribe((trust: Trust) => {
          this.trust = trust;
          if(this.trust !== undefined) {
            if ( this.trust.addbuy === 'Add') {
              this.transactionOrigCashAmount = 0;
              this.transactionOrigDescription = `VOID: ADD STOCK ${this.trust.quantity} ${this.trust.ticker} @ ${this.trust.price}p`;
              this.transactionType = 'Add trust';
            } else {
              this.transactionOrigCashAmount = ((this.trust.quantity * this.trust.price / 100) +
              this.trust.transactioncharge + this.trust.tax + this.trust.othercharges);
              this.transactionOrigCashAmount = Math.round(this.transactionOrigCashAmount * 1e2) / 1e2;
              this.transactionOrigDescription = `VOID: BUY STOCK ${this.trust.quantity} ${this.trust.ticker} @ ${this.trust.price}p`;
              this.transactionType = 'Buy trust';
            }
            this.transactionOrigInitialTrustsCost = (this.trust.quantity * this.trust.price / 100) +
            this.trust.transactioncharge + this.trust.tax + this.trust.othercharges;
            this.transactionOrigInitialTrustsCost = Math.round(this.transactionOrigInitialTrustsCost * 1e2) / 1e2;
            this.trustOrig.date = this.trust.date;
            this.trustOrig.parentid = this.portfolioId;
            this.trust.transactioncharge = this.trustTransactionCharge;
            this.trustCurrentQuantity = this.trust.quantity;
            this.trustOrig.currentprice = this.trust.currentprice;
            this.trustOrig.price = this.trust.price;
            this.trustOrig.quantity = this.trust.quantity;
            this.trust.date = new Date().toISOString();
            this.trust.transactioncharge = this.trustTransactionCharge;
            this.trust.tax = 0;
            this.trust.othercharges = 0;
            this.trust.price = 0;
            this.trustForm.onTrustRetrieved(this.trust);
          }
        });
      }
    });
  }

  async updateTrust(trust: Trust): Promise<void> {
    try {
      trust.date = new Date(trust.date).toISOString();
      trust.parentid = this.portfolioId;
      trust.currentprice = this.trustOrig.currentprice;

      if (this.trustOrig.price !== trust.price || this.trustOrig.quantity !== trust.quantity) {
        this.portfolioTransaction = {
          id: '',
          parentid: trust.parentid,
          mode: 'Trust',
          date: this.trustOrig.date,
          description: this.transactionOrigDescription,
          cashamount: this.transactionOrigCashAmount,
          type: this.transactionType
        };
        this.portfolioService.createPortfolioTransaction(this.portfolioId, this.portfolioTransaction).then(transaction => {

          this.transactionInitialTrustsCost = (trust.quantity * trust.price / 100) +
          trust.transactioncharge + trust.tax + trust.othercharges;
          this.transactionInitialTrustsCost = Math.round(this.transactionInitialTrustsCost * 1e2) / 1e2;

          if ( trust.addbuy === 'Add' ) {
            this.transactionCashAmount = 0;
            this.transactionDescription = `UPDATE ADD STOCK ${trust.quantity} ${trust.ticker} @ ${trust.price}p`;
            this.portfolioInitialTrustsBalance = this.portfolioInitialTrustsBalance - this.transactionOrigInitialTrustsCost
            + this.transactionInitialTrustsCost;
          } else {
            this.transactionCashAmount = (((trust.quantity * trust.price / 100) +
            trust.transactioncharge + trust.tax + trust.othercharges) * -1 );
            this.transactionCashAmount = Math.round(this.transactionCashAmount * 1e2) / 1e2;
            this.transactionDescription = `UPDATE BUY STOCK ${trust.quantity} ${trust.ticker} @ ${trust.price}p`;

            this.portfolioInitialTrustsBalance = this.portfolioInitialTrustsBalance + this.transactionOrigInitialTrustsCost
            - this.transactionInitialTrustsCost;
            this.portfolioInitialTrustsBalance = Math.round(this.portfolioInitialTrustsBalance * 1e2) / 1e2;
            this.portfolioCashBalance = this.portfolioCashBalance + this.transactionOrigInitialTrustsCost
            - this.transactionInitialTrustsCost;
            this.portfolioCashBalance = Math.round(this.portfolioCashBalance * 1e2) / 1e2;
            if ( (this.transactionOrigInitialTrustsCost - this.transactionInitialTrustsCost) !== 0 ) {
              this.portfolioService.updatePortfolioCashBalance(this.portfolioId, this.portfolioCashBalance);
            }
          }

          this.portfolioTransaction = {
            id: '',
            parentid: trust.parentid,
            mode: 'Trust',
            date: trust.date,
            description: this.transactionDescription,
            cashamount: this.transactionCashAmount,
            type: this.transactionType
          };

          this.portfolioService.createPortfolioTransaction(this.portfolioId, this.portfolioTransaction).then(transaction1 => {
            this.portfolioService.updatePortfolioInitialTrustsBalance(this.portfolioId, this.portfolioInitialTrustsBalance).then(res3 => {
              this.trustService.updateTrust(this.trustId, trust).then(res1 => {
                this.toastService.displayToast('Trust asset adjusted');
                this.navController.navigateBack(`/trusts/trust-list/${this.portfolioId}`);
              });
            });
          });
        });
      } else {
        this.trustService.updateTrust(this.trustId, trust).then(res1 => {
          this.toastService.displayToast('Trust asset adjusted');
          this.navController.navigateBack(`/trusts/trust-list/${this.portfolioId}`);
        });
      }
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
