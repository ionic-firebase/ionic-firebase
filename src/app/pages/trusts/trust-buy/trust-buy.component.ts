import { Component, ViewChild, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { TrustService } from '../../../services/trust/trust.service';
import { Trust } from '../../../models/trust';
import { Portfolio } from '../../../models/portfolio';
import { Transaction } from '../../../models/transaction';
import { PortfolioService } from '../../../services/portfolio/portfolio.service';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from '../../../services/storage/local-storage.service';
import { TrustFormComponent } from 'src/app/components/trust-form/trust-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, switchMap, take} from 'rxjs';

@Component({
  selector: 'app-trust-buy',
  templateUrl: './trust-buy.component.html',
  styleUrls: ['./trust-buy.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TrustFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class TrustBuyComponent {
  public displaySetupBuy = true;

  @ViewChild(TrustFormComponent, { static: false }) trustForm: TrustFormComponent;

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
  public trustDate: any;
  public trustCurrentPrice: number;
  public trust: Trust = new Trust();
  public transactionCashAmount: number;
  public trustValue: number;
  public transactionCost: number;

  private portfolioSubscription: any;

  public trustSymbols: string [] = [];
  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private trustService: TrustService,
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
        this.trust =  {
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
          trustyield: 0,
          currentprice: 0,
          addbuy: 'Buy'
        };
        this.trustForm.onTrustRetrieved(this.trust);
      }
    });
  }

  async buyTrust(trust: Trust): Promise<void> {
    try {
      trust.currentprice = trust.price;
      trust.date = new Date(trust.date).toISOString();
      trust.parentid = this.portfolioId;
      trust.addbuy = 'Buy';
      this.localStorageService.addTicker(trust.ticker, trust.currentprice, 'No', 'Trust', 0, 0, 0);

      const transactionDescription = `BUY ${trust.quantity} ${trust.ticker} @ ${trust.price}p`;
      this.trustValue = Math.round(trust.quantity * trust.price / 100);
      this.transactionCost = (this.trustValue + trust.transactioncharge + 
        trust.tax + trust.othercharges) * -1;
      this.transactionCost = Math.round(this.transactionCost * 1e2) / 1e2;

      this.portfolioTransaction = {
        id: '',
        parentid: this.portfolioId,
        mode: 'Trust',
        date: trust.date,
        description: transactionDescription,
        cashamount: this.transactionCost,
        type: 'Buy trust'
      };
      this.portfolioService.createPortfolioTransaction(this.portfolioId, this.portfolioTransaction);
      this.portfolio.balance = Math.round((this.portfolio.balance + this.transactionCost) * 1e2) / 1e2;
      this.portfolio.trustsbalance =  Math.round((this.portfolio.trustsbalance + this.trustValue) * 1e2) / 1e2;

      this.trustService.createTrust(trust).then(res => {
        this.portfolioService.updatePortfolio(this.portfolioId, this.portfolio)
          .then(res3 => {
          this.toastService.displayToast('Trust bought');
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
  }
}