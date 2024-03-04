import { Component, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/user/auth.service';
import { SettingsService } from '../../services/settings/settings.service';
import { BondService } from '../../services/bond/bond.service';
import { SavingsService } from '../../services/savings/savings.service';
import { PortfolioService } from '../../services/portfolio/portfolio.service';
import { StockService } from '../../services/stock/stock.service';
import { TrustService } from '../../services/trust/trust.service';
import { OneoffsService } from '../../services/oneoffs/oneoffs.service';
import { PensionService } from '../../services/pension/pension.service';
import { PropertyService } from '../../services/property/property.service';
import { LoanService } from '../../services/loan/loan.service';
import { DebtService } from '../../services/debt/debt.service';
import { SalariesService } from '../../services/salaries/salaries.service';
import { BudgetService } from '../../services/budget/budget.service';
import { map, take } from 'rxjs/operators';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Portfolio } from '../../models/portfolio';
import { Stock } from '../../models/stock';
import { Trust } from '../../models/trust';
import { Bond } from '../../models/bond';
import { Saving } from '../../models/saving';
import { Oneoff } from '../../models/oneoff';
import { Salary } from '../../models/salary';
import { Pension } from '../../models/pension';
import { Property } from '../../models/property';
import { Loan } from '../../models/loan';
import { Debt } from '../../models/debt';
import { Budget } from '../../models/budget';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class SummaryComponent  implements OnInit {

  public portfolioCashBalance: number;
  public stockDividend: number;
  public stocksBalance: number;
  public trustDividend: number;
  public trustsBalance: number;
  public bondBalance: number;
  public bondIncome: number;
  public propertyIncome: number;
  public propertyBalance: number;
  public loansPayments: number;
  public loansBalance: number;
  public debtsPayments: number;
  public debtsBalance: number;
  public savingsIncome: number;
  public savingsBalance: number;
  public oneoffsBalance: number;
  public pensionIncome: number;
  public salaryIncome: number;
  public budgetSpends: number;

  public settingsSubscription: any;
  public portfolioSubscription: any;
  public salariesSubscription: any;
  public stockSubscription: any;
  public trustSubscription: any;
  public oneoffsSubscription: any;
  public bondSubscription: any;
  public pensionsSubscription: any;
  public savingsSubscription: any;
  public propertiesSubscription: any;
  public loansSubscription: any;
  public debtsSubscription: any;
  public budgetsSubscription: any;

  public enablesalaries: boolean;
  public enableportfolios: boolean;
  public enablebonds: boolean;
  public enablepensions: boolean;
  public enablesavings: boolean;
  public enableoneoffs: boolean;
  public enableproperty: boolean;
  public enableloans: boolean;
  public enabledebts: boolean;
  public enablebudgets: boolean;

  public taxyear: number;

  public portfolioList: Portfolio[];
  public trustList: Trust[];
  public stockList: Stock[];
  public bondList: Bond[];
  public savingsList: Saving[];
  public oneoffsList: Oneoff[];
  public salaryList: Salary[];
  public pensionList: Pension[];
  public propertyList: Property[];
  public loansList: Loan[];
  public debtsList: Debt[];
  public budgetsList: Budget[];


  private readonly AuthService = inject(AuthService);
  private readonly user$ = this.AuthService.getUser();
//  readonly portfolioList$: Observable<Portfolio[]> = this.portfolioService.getPortfolios();
//  readonly bondList$: Observable<Bond[]> = this.bondService.getBonds();
//  readonly savingsList$: Observable<Saving[]> = this.savingsService.getSavings();
//  readonly debtsList$: Observable<Debt[]> = this.debtService.getDebts();
//  readonly loansList$: Observable<Loan[]> = this.loanService.getLoans();
//  readonly oneoffsList$: Observable<Oneoff[]> = this.oneoffsService.getOneoffs();
//  readonly pensionsList$: Observable<Pension[]> = this.pensionService.getPensions();
//  readonly propertyList$: Observable<Property[]> = this.propertyService.getProperties();
//  readonly salariesList$: Observable<Salary[]> = this.salariesService.getSalaries();
//  readonly stocksList$: Observable<Stock[]> = this.stockService.getStockListAll();
//  readonly trustsList$: Observable<Trust[]> = this.trustService.getTrustListAll();

  constructor(
    private settingsService: SettingsService,
    private bondService: BondService,
    private savingsService: SavingsService,
    private oneoffsService: OneoffsService,
    private portfolioService: PortfolioService,
    private stockService: StockService,
    private trustService: TrustService,
    private pensionService: PensionService,
    private propertyService: PropertyService,
    private loanService: LoanService,
    private debtService: DebtService,
    private salariesService: SalariesService,
    private budgetService: BudgetService,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewDidEnter() {

    this.settingsSubscription = this.settingsService.getSettings()
    .pipe(take(1))
    .subscribe(settings => {
      this.enablesalaries = settings.enablesalaries;
      this.enableportfolios = settings.enableportfolios;
      this.enablebonds = settings.enablebonds;
      this.enablepensions = settings.enablepensions;
      this.enablesavings = settings.enablesavings;
      this.enableoneoffs = settings.enableoneoffs;
      this.enableproperty = settings.enableproperty;
      this.enableloans = settings.enableloans;
      this.enabledebts = settings.enabledebts;
      this.enablebudgets = settings.enablebudgets;
      this.taxyear = +settings.taxyear;

      if (this.enablesalaries) {
        this.salariesSubscription = this.salariesService.getRealtimeSalaries()
        .subscribe(salaryListSnapshot => {
          this.salaryIncome = 0;
          this.salaryList = salaryListSnapshot;
          if (this.salaryList) {
            this.salaryList.forEach(snapSalary => {
              let salaryAnnual = 0;
              if (snapSalary.frequency === 'Weekly') {
                salaryAnnual = 52 * snapSalary.netincome;
              } else {
                if (snapSalary.frequency === 'Monthly') {
                  salaryAnnual = 12 * snapSalary.netincome;
                } else {
                  if (snapSalary.frequency === 'Quarterly') {
                    salaryAnnual = 4 * snapSalary.netincome;
                  } else {
                    salaryAnnual = snapSalary.netincome;
                  }
                }
              }
              this.salaryIncome = this.salaryIncome + salaryAnnual;
            });
          }
        });
      } else {
        this.salaryIncome = 0;
      }

      if (this.enableoneoffs) {
        this.oneoffsSubscription = this.oneoffsService.getRealtimeOneoffs()
        .subscribe(oneoffsListSnapshot => {
          this.oneoffsBalance = 0;
          this.oneoffsList = oneoffsListSnapshot;
          if (this.oneoffsList) {
            this.oneoffsList.forEach(snapOneoff => {
              if (snapOneoff.type === 'Repayment' || snapOneoff.type === 'Out') {
                this.oneoffsBalance = this.oneoffsBalance - snapOneoff.amount;
              } else {
                this.oneoffsBalance = this.oneoffsBalance + snapOneoff.amount;
              }
            });
          }
        });
      } else {
        this.oneoffsBalance = 0;
      }

      if (this.enableportfolios) {

        this.portfolioSubscription = this.portfolioService.getRealtimePortfolios()
        .subscribe(portfolioListSnapshot => {
          this.portfolioCashBalance = 0;
          this.portfolioList = portfolioListSnapshot;
          if (this.portfolioList) {
            this.portfolioList.forEach(snapPortfolio => {
              this.portfolioCashBalance = this.portfolioCashBalance + snapPortfolio.balance;
            });
          }
        });

        this.stockSubscription = this.stockService.getRealtimeStockListAll()
        .pipe(take(1))
        .subscribe(stockListSnapshot => {
          this.stockList = stockListSnapshot;
          this.stockDividend = 0;
          this.stocksBalance = 0;
          if (stockListSnapshot) {
            stockListSnapshot.forEach(snapStock => {
              const newStockDividend = (snapStock.quantity * snapStock.stockyield * snapStock.price / 10000);
              const newStockDividendNumber = Math.round((newStockDividend) * 1e2) / 1e2;
              this.stockDividend = this.stockDividend + newStockDividendNumber;
              const newStockBalance = snapStock.currentprice * snapStock.quantity / 100;
              const newStockBalanceNumber = Math.round((newStockBalance) * 1e2) / 1e2;
              this.stocksBalance = this.stocksBalance + newStockBalanceNumber;
            });
          }
        });

        this.trustSubscription = this.trustService.getRealtimeTrustListAll()
        .pipe(take(1))
        .subscribe(trustListSnapshot => {
          this.trustList = trustListSnapshot;
          this.trustDividend = 0;
          this.trustsBalance = 0;
          if (trustListSnapshot) {
            trustListSnapshot.forEach(snapTrust => {
              const newTrustDividend = (snapTrust.quantity * snapTrust.trustyield * snapTrust.price / 10000);
              const newTrustDividendNumber = Math.round((newTrustDividend) * 1e2) / 1e2;
              this.trustDividend = this.trustDividend + newTrustDividendNumber;
              const newTrustBalance = snapTrust.currentprice * snapTrust.quantity / 100;
              const newTrustBalanceNumber = Math.round((newTrustBalance) * 1e2) / 1e2;
              this.trustsBalance = this.trustsBalance + newTrustBalanceNumber;
            });
          }
        });
      }

      if (this.enablebonds) {
        this.bondSubscription = this.bondService.getRealtimeBonds()
        .subscribe(bondListSnapshot => {
          this.bondIncome = 0;
          this.bondBalance = 0;
          this.bondList = bondListSnapshot;
          this.bondList.forEach(snapBond => {
            const initialcash = snapBond.initialcash;
            const interest = snapBond.annualinterest;
            const balance = snapBond.balance;
            const newBondInterestNumber = Math.round(interest * 1e2) / 1e2;
            this.bondIncome = this.bondIncome + newBondInterestNumber;
            this.bondBalance = this.bondBalance + balance;
          });
        });
      } else {
        this.bondIncome = 0;
        this.bondBalance = 0;
      }

      if (this.enablepensions) {
        this.pensionsSubscription = this.pensionService.getRealtimePensions()
        .subscribe(pensionListSnapshot => {
          this.pensionList = pensionListSnapshot;
          this.pensionIncome = 0;
          this.pensionList.forEach(snapPension => {
            const income = snapPension.annualincome;
            this.pensionIncome = this.pensionIncome + income;
          });
        });
      } else {
        this.pensionIncome = 0;
      }

      if (this.enablesavings) {
        this.savingsSubscription = this.savingsService.getRealtimeSavings()
        .subscribe(savingsListSnapshot => {
          this.savingsIncome = 0;
          this.savingsBalance = 0;
          this.savingsList = savingsListSnapshot;
          this.savingsList.forEach(snapSavings => {
            const balance = snapSavings.balance;
            const interest = snapSavings.interest;
            const newSavingsIncome = Math.round((balance * interest / 100) * 1e2) / 1e2;
            this.savingsIncome = this.savingsIncome + newSavingsIncome;
            this.savingsBalance = this.savingsBalance + balance;
          });
        });
      } else {
        this.savingsIncome = 0;
        this.savingsBalance = 0;
      }

      if (this.enableproperty) {
        this.propertiesSubscription = this.propertyService.getRealtimeProperties()
        .subscribe(propertyListSnapshot => {
          this.propertyList = propertyListSnapshot;
          this.propertyIncome = 0;
          this.propertyBalance = 0;
          this.propertyList.forEach(snapProperty => {
            let netrentalIncome = snapProperty.budgetannualincome
              -snapProperty.budgetinsurance-snapProperty.budgetmaintenance
              -snapProperty.budgetmanagement-snapProperty.budgetmortgage
              -snapProperty.budgetothercosts-snapProperty.budgetutilities;;
            netrentalIncome = Math.round((netrentalIncome) * 1e2) / 1e2;
            this.propertyIncome = this.propertyIncome + netrentalIncome;
            this.propertyBalance = this.propertyBalance + snapProperty.currentvalue;
          });
        });
      } else {
        this.propertyIncome = 0;
        this.propertyBalance = 0;
      }

      if (this.enableloans) {
        this.loansSubscription = this.loanService.getRealtimeLoans()
        .subscribe(loansListSnapshot => {
          this.loansList = loansListSnapshot;
          this.loansPayments = 0;
          this.loansBalance = 0;
          this.loansList.forEach(snapLoans => {
            const balance = snapLoans.balance;

            const loanspayment = snapLoans.annualpayments;
            const newLoansPayment = Math.round(loanspayment * 1e2) / 1e2;
            this.loansPayments = this.loansPayments + newLoansPayment;
            this.loansBalance = this.loansBalance + balance;
          });
        });
      } else {
        this.loansPayments = 0;
        this.loansBalance = 0;
      }

      if (this.enabledebts) {
        this.debtsSubscription = this.debtService.getRealtimeDebts()
        .subscribe(debtsListSnapshot => {
          this.debtsList = debtsListSnapshot;
          this.debtsPayments = 0;
          this.debtsBalance = 0;
          this.debtsList.forEach(snapDebts => {
            const balance = snapDebts.balance;

            const debtspayment = snapDebts.annualpayments;
            const newDebtsPayment = Math.round(debtspayment * 1e2) / 1e2;
            this.debtsPayments = this.debtsPayments + newDebtsPayment;
            this.debtsBalance = this.debtsBalance + balance;
          });
        });
      } else {
        this.debtsPayments = 0;
        this.debtsBalance = 0;
      }

      if (this.enablebudgets) {
        this.budgetsSubscription = this.budgetService.getRealtimeBudgets()
        .pipe()
        .subscribe(budgetsListSnapshot => {
          this.budgetsList = budgetsListSnapshot;
          this.budgetSpends = 0;
          this.budgetsList.forEach(snapBudget => {
            this.budgetSpends = +snapBudget.annual + this.budgetSpends;
          });
        });
      }
    });

  }

  summaryDetails() {
    this.navController.navigateForward('/summary/summary-detail');
  }

  forecast() {
    this.navController.navigateForward('/summary/forecast');
  }

  ionViewWillLeave() {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
    if (this.salariesSubscription) {
      this.salariesSubscription.unsubscribe();
    }
    if (this.portfolioSubscription) {
      this.portfolioSubscription.unsubscribe();
    }
    if (this.stockSubscription) {
      this.stockSubscription.unsubscribe();
    }
    if (this.trustSubscription) {
      this.trustSubscription.unsubscribe();
    }
    if (this.oneoffsSubscription) {
      this.oneoffsSubscription.unsubscribe();
    }
    if (this.bondSubscription) {
      this.bondSubscription.unsubscribe();
    }
    if (this.pensionsSubscription) {
      this.pensionsSubscription.unsubscribe();
    }
    if (this.savingsSubscription) {
      this.savingsSubscription.unsubscribe();
    }
    if (this.propertiesSubscription) {
      this.propertiesSubscription.unsubscribe();
    }
    if (this.loansSubscription) {
      this.loansSubscription.unsubscribe();
    }
    if (this.debtsSubscription) {
      this.debtsSubscription.unsubscribe();
    }
    if (this.budgetsSubscription) {
      this.budgetsSubscription.unsubscribe();
    }
  }

}
