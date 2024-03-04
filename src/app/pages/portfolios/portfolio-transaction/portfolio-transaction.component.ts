import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { PortfolioService } from '../../../services/portfolio/portfolio.service';
import { Transaction } from '../../../models/transaction';
import { Portfolio } from '../../../models/portfolio';
import { ToastService } from '../../../services/toast/toast.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { TransactionFormComponent } from 'src/app/components/transaction-form/transaction-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-portfolio-transaction',
  templateUrl: './portfolio-transaction.component.html',
  styleUrls: ['./portfolio-transaction.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TransactionFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class PortfolioTransactionComponent {
  @ViewChild(TransactionFormComponent, { static: false }) transactionForm: TransactionFormComponent;
  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();
  
  public portfolioId: string;

  currentPortfolio$: Observable<Portfolio> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.portfolioId = params['id'];
      return this.portfolioService.getPortfolio(params['id']);
    })
  );
  public portfolioName: string;
  public portfolioCashBalance: number;
  public fromDate: any;
  public toDate: any;
  public typeDropdowns: any[];
  public portfolioSubscription: any;

  constructor(
    private portfolioService: PortfolioService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.typeDropdowns = [
      {name: 'Cash Transfer In', value: 'Transfer In'},
      {name: 'Cash Withdrawl', value: 'Withdrawl'},
      {name: 'Dividend', value: 'Dividend'},
      {name: 'Management Fee', value: 'Fee'},
      {name: 'Other Cash In', value: 'Other In'},
      {name: 'Other Cash Out', value: 'Other Out'}
    ];
    this.portfolioCashBalance = 0;
    this.toDate = new Date().getFullYear();
    this.toDate = `${(this.toDate + 1)}`;
    this.fromDate = `${(this.toDate - 3)}`;
    this.portfolioSubscription = this.currentPortfolio$.pipe()
    .subscribe((portfolio: Portfolio) => {
      this.portfolioCashBalance = portfolio.balance;
      this.portfolioName = portfolio.name;
    });
  }

  async createPortfolioTransaction(transaction: Transaction): Promise<void> {

    try {
      if (transaction.type === 'Withdrawl' ||
        transaction.type === 'Fee' ||
        transaction.type === 'Other Out') {
        transaction.cashamount = transaction.cashamount * -1;
      }
      this.portfolioCashBalance = this.portfolioCashBalance + transaction.cashamount;
      this.portfolioCashBalance = Math.round(this.portfolioCashBalance * 1e2) / 1e2;

      transaction.id = '';
      transaction.parentid = this.portfolioId;
      transaction.date = new Date(transaction.date).toISOString();
      transaction.mode = 'Cash';
      this.portfolioService.createPortfolioTransaction(this.portfolioId, transaction).then(result => {
        this.portfolioService.updatePortfolioCashBalance(this.portfolioId, this.portfolioCashBalance).then(res2 => {
          this.toastService.displayToast('Cash transaction added');
          this.navController.navigateBack('/portfolios/portfolio-list');
        });
      });
    } catch (error) {
      this.transactionForm.handleError(error);
    }
  }

  ionViewWillLeave() {
    if (this.portfolioSubscription) {
      this.portfolioSubscription.unsubscribe();
    }
  }
}
