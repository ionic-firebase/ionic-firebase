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
  selector: 'app-trust-add',
  templateUrl: './trust-add.component.html',
  styleUrls: ['./trust-add.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TrustFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class TrustAddComponent {

  @ViewChild(TrustFormComponent, { static: false }) trustForm: TrustFormComponent;

  currentPortfolio$: Observable<Portfolio> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.portfolioId = params['id'];
      return this.portfolioService.getPortfolio(params['id']);
    })
  );

  public portfolioId: string;
  public portfolioName: string;
  public portfolio: Portfolio;
  public portfolioTransaction: Transaction = new Transaction();
  public trustDate: any;
  public trustCurrentPrice: number;
  public trust: Trust = new Trust();
  public transactionAmount: number;
  public trustValue: number;

  public transactionInitialTrustsCost: number;

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
      this.trust =  {
        id: '',
        parentid: this.portfolioId,
        date: new Date().toISOString(),
        name: '',
        ticker: '',
        quantity: 0,
        price: 0,
        transactioncharge: portfolio.charge,
        tax: 0,
        othercharges: 0,
        trustyield: 0,
        currentprice: 0,
        addbuy: 'Add'
      };
      this.trustForm.onTrustRetrieved(this.trust);
    });
  }

  async addTrust(trust: Trust): Promise<void> {
    try {
      trust.currentprice = trust.price;
      trust.date = new Date(trust.date).toISOString();
      trust.parentid = this.portfolioId;
      trust.addbuy = "Add";
      this.localStorageService.addTicker(trust.ticker, trust.currentprice, 'No', 'Trust', 0, 0, 0);
      const transactionDescription = `ADD ${trust.quantity} ${trust.ticker} @ ${trust.price}p`;
      this.trustValue = Math.round(trust.quantity * trust.price / 100);
      this.transactionInitialTrustsCost = Math.round((this.trustValue + trust.transactioncharge + trust.tax + trust.othercharges) * 1e2) / 1e2;
      this.portfolioTransaction = {
        id: '',
        parentid: this.portfolioId,
        mode: 'Trust',
        date: trust.date,
        description: transactionDescription,
        cashamount: Math.round(0.0 * 1e2) / 1e2,
        type: 'Add trust'
      };
      this.portfolioService.createPortfolioTransaction(this.portfolioId, this.portfolioTransaction);
      this.portfolio.initialtrustsbalance = Math.round((this.portfolio.initialtrustsbalance + this.transactionInitialTrustsCost) * 1e2) / 1e2;
      this.portfolio.trustsbalance =  Math.round((this.portfolio.trustsbalance + this.trustValue) * 1e2) / 1e2;

      this.trustService.createTrust(trust).then(res => {
        this.portfolioService.updatePortfolio(this.portfolioId, this.portfolio).then(res3 => {
          this.toastService.displayToast('Trust added');
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
