import { Component, ViewEncapsulation, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { PortfolioService } from '../../../services/portfolio/portfolio.service';
import { ToastService } from '../../../services/toast/toast.service';
import { Portfolio } from '../../../models/portfolio';
import { Transaction } from '../../../models/transaction';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransactionFormComponent } from '../../../components/transaction-form/transaction-form.component';
import { AuthService } from '../../../services/user/auth.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Observable, switchMap } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-portfolio-list-transactions',
  templateUrl: './portfolio-list-transactions.component.html',
  styleUrls: ['./portfolio-list-transactions.component.scss'],
  standalone: true,
  imports: [TransactionFormComponent, CommonModule, FormsModule, ReactiveFormsModule, 
    NgxDatatableModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class PortfolioListTransactionsComponent {

  portfolioId: string;

  currentPortfolio$: Observable<Portfolio> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.portfolioId = params['id'];
      return this.portfolioService.getPortfolio(params['id']);
    })
  );

  portfolio: Portfolio;
  portfolioTransactionList: Transaction[];
  portfolioTransaction: Transaction;
  portfolioName: string;
  portfolioBalance: number;
  portfolioCashBalance: number;
  portfolioStocksBalance: number;
  portfolioTrustsBalance: number;

  portfolioDate: string;
  public rowList$: Array<any>;
  private portfolioSubscription: any;
  private portfolioTransactionsSubscription: any;

  public columns: any;
  public rows: any;
  public isMode: boolean;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private portfolioService: PortfolioService,
    private toastService: ToastService,
    private alertController: AlertController,
    private actionCtrl: ActionSheetController,
    private route: ActivatedRoute,
    private navController: NavController
  ) { }

  ionViewWillEnter() {
    this.rowList$ = [];
    this.portfolioSubscription = this.currentPortfolio$
    .pipe(take(1))
    .subscribe((portfolio: Portfolio) => {
      this.portfolio = portfolio;
      this.portfolioBalance = this.portfolio.initialcash;
      this.portfolioName = this.portfolio.name;
      this.rowList$.push({
        date: this.portfolio.date,
        mode: '',
        type: '',
        ismode: this.isMode,
        description: 'Initial balance setup',
        cashamount: this.portfolioBalance,
        balance: this.portfolioBalance,
        id: ''
      });
      this.portfolioCashBalance = this.portfolio.balance;
      this.portfolioStocksBalance = this.portfolio.stocksbalance;
      this.portfolioTrustsBalance = this.portfolio.trustsbalance;

      this.portfolioTransactionsSubscription = this.portfolioService.getPortfolioTransactions(this.portfolioId)
      .pipe(take(1))
      .subscribe((transactions: Transaction[]) => {
        this.portfolioTransactionList = transactions;
        if (this.portfolioTransactionList) {
          this.portfolioTransactionList.forEach((snapTransaction: Transaction) => {
            this.portfolioTransaction = snapTransaction;
            this.portfolioBalance = this.portfolioBalance + this.portfolioTransaction.cashamount;
            if ( this.portfolioTransaction.mode === 'Cash') {
              this.isMode = true;
            } else {
              this.isMode = false;
            }
            this.rowList$.push({
              date:  this.portfolioTransaction.date,
              mode:  this.portfolioTransaction.mode,
              type:  this.portfolioTransaction.type,
              ismode: this.isMode,
              description:  this.portfolioTransaction.description,
              cashamount:  this.portfolioTransaction.cashamount,
              balance: this.portfolioBalance,
              id:  this.portfolioTransaction.id
            });
          });
          this.rows = [...this.rowList$];
        }
      });
    });
  }

  async getidpromise(): Promise<any> {
    return this.route.snapshot.paramMap.get('id');
  }

  createPortfolioTransaction() {
    this.navController.navigateForward(`/portfolios/portfolio-transaction/${this.portfolioId}`);
  }

  async deleteTransactionItem(
    transactionId: string,
    mode: string,
    cashamount: number
  ) {
    if (transactionId) {
      const alert = await this.alertController.create({
        message: `Delete cash transaction?`,
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
              if ( mode === 'Cash' ) {
                const newbalance = this.portfolioCashBalance - cashamount;
                this.portfolioService.updatePortfolioCashBalance(this.portfolioId, newbalance);
                this.portfolioService.deletePortfolioTransaction(this.portfolioId, transactionId)
                .then(() => {
                  this.toastService.displayToast('Cash transaction deleted.');
                  this.navController.navigateBack(`/portfolios/portfolio-list`);
                });
              }
            },
          },
        ],
      });
      await alert.present();
    }
  }

  openMenu(
    id: string,
    mode: string,
    cashamount: number
  ) {
    this.actionCtrl.create({
      buttons: [
        {
          text: 'Delete cash transaction',
          handler: () => {
            this.deleteTransactionItem(id, mode, cashamount);
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
    if (this.portfolioTransactionsSubscription) {
      this.portfolioTransactionsSubscription.unsubscribe();
    }
    if (this.portfolioSubscription) {
      this.portfolioSubscription.unsubscribe();
    }
  }
}
