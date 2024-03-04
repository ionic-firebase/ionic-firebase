import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SettingsService } from '../../../services/settings/settings.service';
import { BudgetService } from '../../../services/budget/budget.service';
import { BondService } from '../../../services/bond/bond.service';
import { SavingsService } from '../../../services/savings/savings.service';
import { PortfolioService } from '../../../services/portfolio/portfolio.service';
import { StockService } from '../../../services/stock/stock.service';
import { TrustService } from '../../../services/trust/trust.service';
import { PropertyService } from '../../../services/property/property.service';
import { OneoffsService } from '../../../services/oneoffs/oneoffs.service';
import { PensionService } from '../../../services/pension/pension.service';
import { SalariesService } from '../../../services/salaries/salaries.service';
import { LoanService } from '../../../services/loan/loan.service';
import { ToastService } from '../../../services/toast/toast.service';
import { Reorder } from '../../../models/reorder';
import { Settings } from '../../../models/settings';
import { Budget } from '../../../models/budget';
import { Salary } from '../../../models/salary';
import { Bond } from '../../../models/bond';
import { Saving } from '../../../models/saving';
import { Portfolio } from '../../../models/portfolio';
import { Stock } from '../../../models/stock';
import { Trust } from '../../../models/trust';
import { Property } from '../../../models/property';
import { Pension } from '../../../models/pension';
import { Loan } from '../../../models/loan';
import { Oneoff } from '../../../models/oneoff';
import { take } from 'rxjs/operators';
import { ViewEncapsulation } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Observable, Subscription } from 'rxjs';


@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.scss'],
  standalone: true,
  imports: [CommonModule, NgxDatatableModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class ForecastComponent  implements OnInit {

  private dividendRate: number;
  private Y1CPIRate: number;
  private Y2CPIRate: number;
  private Y3CPIRate: number;
  private Y4CPIRate: number;
  private Y5CPIRate: number;
  private Y6CPIRate: number;
  private Y7CPIRate: number;
  private Y8CPIRate: number;
  private Y9CPIRate: number;
  private Y20CPIRate: number;
  private Y30CPIRate: number;
  private taxYear: number;
  private Y1PensionRate: number;
  private Y2PensionRate: number;
  private Y3PensionRate: number;
  private Y4PensionRate: number;
  private Y5PensionRate: number;
  private Y6PensionRate: number;
  private Y7PensionRate: number;
  private Y8PensionRate: number;
  private Y9PensionRate: number;
  private Y20PensionRate: number;
  private Y30PensionRate: number;
  private orderCount: number;
  private settingsLoaded: boolean;
  private settings: Settings = new Settings();

  public reorderList: Reorder[];
  public reorderLoaded: boolean;

  public rowList: Array<any>;
  public rows: any;
  public columns: any;

  public budgetTotal: number;
  public budgetList: Budget[];
  public budget: Budget;
  private budgetLoaded: boolean;

  public salaryList: Salary[];
  public salary: Salary;
  private salaryIncome: number;
  private salariesLoaded: boolean;

  public  savingsList: Saving[];
  public  saving: Saving;
  private savingsIncome: number;
  private savingsAssets: number;
  private savingsBalance: number = 0;
  private savingsLoaded: boolean;

  public bondList: Bond[];
  public bond: Bond;
  private bondIncome: number = 0;
  private bondAssets: number = 0;
  private bondBalance: number = 0;
  private bondsLoaded: boolean;
  private savingsbondIncome: number = 0;

  private portfolioList: Portfolio[];
  private portfolio: Portfolio;

  private portfoliosLoaded: boolean;
  private incomeSet: boolean;

  private totalCashBalance: number = 0;

  private totalTradingIncome: number;
  private totalTradingAssets: number;
  private totalTradingBalance: number;

  private totalSIPPIncome: number;
  private totalSIPPAssets: number;
  private totalSIPPBalance: number;
  private SIPPIncome: number = 0;

  private totalISAIncome: number;
  private totalISAAssets: number;
  private totalISABalance: number;
  private ISAIncome: number = 0;

  private stockList: Stock[];

  private stock: Stock = new Stock();
  private stocksLoaded: boolean;

  private trustList: Trust[];
  private trust: Trust = new Trust();
  private trustsLoaded: boolean;

  private investmentGrowthRate: number;

  private remainder: number;
  private reorderIndex: number;

  public propertyList: Property[];
  public property: Property;
  private propertyIncome: number;
  private propertyAssets: number = 0;
  private propertyBalance: number = 0;
  private propertiesLoaded: boolean;
  private propertyGrowthRate: number;
  private propertySold: boolean = false;

  public pensionsList: Pension[];
  public pension: Pension;
  private pensionsIncome: number = 0;
  private pensionsIndex: number;
  private pensionsLoaded: boolean;
  private pensionPaymentList: number[] = [0];
  private pensionIncome: number;

  private oneoffsAmount: number;
  private oneoffsIndex: number;
  private oneoffsLoaded: boolean;
  private oneoffsList: Oneoff[];
  private oneoff: Oneoff;
  private oneoffsAmountList: number[] = [0];
  private oneoffAmount: number = 0;

  private loansAmount: number;
  private loansIndex: number;
  private loansLoaded: boolean;
  private loansList: Loan[];
  private loan: Loan;
  private loansAmountList: number[] = [0];
  private loanAmount: number = 0;

  private totalDividends: number = 0;
  private annualIncome: number = 0;
  private annualChange: number = 0;
  private totalBalance: number = 0;
  private tradingIncome: number = 0;
  
  private myzero: number = 0;
  private yearClock: number;

  public settingsSubscription: any;
  public bondsSubscription: any;
  public budgetSubscription: any;
  public salariesSubscription: any;
  public savingsSubscription: any;
  public pensionSubscription: any;
  public loansSubscription: any;
  public oneoffsSubscription: any;
  public propertySubscription: any;
  public portfolioSubscription: any;
  public stocksSubscription: any;
  public trustsSubscription: any;
  public reorderLSubscription: any;

//  readonly portfolioList$: Observable<Portfolio[]> = this.portfolioService.getPortfolios();
//  readonly bondList$: Observable<Bond[]> = this.bondService.getBonds();
//  readonly savingsList$: Observable<Saving[]> = this.savingsService.getSavings();
//  readonly debtsList$: Observable<Debt[]> = this.debtService.getRealtimeDebts();
//  readonly loansList$: Observable<Loan[]> = this.loanService.getLoans();
//  readonly oneoffsList$: Observable<Oneoff[]> = this.oneoffsService.getOneoffs();
//  readonly pensionsList$: Observable<Pension[]> = this.pensionService.getPensions();
//  readonly propertyList$: Observable<Property[]> = this.propertyService.getProperties();
//  readonly salaryList$: Observable<Salary[]> = this.salariesService.getSalaries();

  constructor(
    private settingsService: SettingsService,
    private budgetService: BudgetService,
    private salariesService: SalariesService,
    private savingsService: SavingsService,
    private bondService: BondService,
    private portfolioService: PortfolioService,
    private propertyService: PropertyService,
    private stockService: StockService,
    private trustService: TrustService,
    private pensionService: PensionService,
    private loanService: LoanService,
    private toastService: ToastService,
    private oneoffsService: OneoffsService
  ) { }

  ngOnInit() {}

  ionViewDidEnter() {

    this.settingsLoaded = false;
    this.portfoliosLoaded = false;
    this.budgetLoaded = false;
    this.salariesLoaded = false;
    this.savingsLoaded = false;
    this.bondsLoaded = false;
    this.propertiesLoaded = false;
    this.pensionsLoaded = false;
    this.loansLoaded = false;
    this.oneoffsLoaded = false;
    this.stocksLoaded = false;
    this.trustsLoaded = false;

    this.totalCashBalance = 0;
    this.totalTradingIncome = 0;
    this.totalTradingAssets = 0;
    this.totalTradingBalance = 0;

    this.totalSIPPIncome = 0;
    this.totalSIPPAssets = 0;
    this.totalSIPPBalance = 0;

    this.totalISAIncome = 0;
    this.totalISAAssets = 0;
    this.totalISABalance = 0;

    this.pensionPaymentList = [];
    this.oneoffsList = [];

    this.remainder = 0;
    this.reorderIndex = 0;


    this.toastService.displayToast('Loading data, please wait ....');
    this.yearClock = 1;

    if(this.settingsLoaded == false) {
      this.settingsSubscription = this.settingsService.getSettings()
      .pipe(take(1))
      .subscribe(settings => {
        this.settings = settings;
        this.settingsLoaded = true;
        if(this.settings != undefined) {
          this.dividendRate = this.settings.dividendRate;
          this.investmentGrowthRate = this.settings.investmentGrowthRate;
          this.propertyGrowthRate = this.settings.propertyGrowthRate;
          this.Y1CPIRate = this.settings.Y1CPIRate;
          this.Y2CPIRate = this.settings.Y2CPIRate;
          this.Y3CPIRate = this.settings.Y3CPIRate;
          this.Y4CPIRate = this.settings.Y4CPIRate;
          this.Y5CPIRate = this.settings.Y5CPIRate;
          this.Y6CPIRate = this.settings.Y6CPIRate;
          this.Y7CPIRate = this.settings.Y7CPIRate;
          this.Y8CPIRate = this.settings.Y8CPIRate;
          this.Y9CPIRate = this.settings.Y9CPIRate;
          this.Y20CPIRate = this.settings.Y20CPIRate;
          this.Y30CPIRate = this.settings.Y30CPIRate;
          this.taxYear = +this.settings.taxyear;
          this.Y1PensionRate = this.settings.Y1PensionRate;
          this.Y2PensionRate = this.settings.Y2PensionRate;
          this.Y3PensionRate = this.settings.Y3PensionRate;
          this.Y4PensionRate = this.settings.Y4PensionRate;
          this.Y5PensionRate = this.settings.Y5PensionRate;
          this.Y6PensionRate = this.settings.Y6PensionRate;
          this.Y7PensionRate = this.settings.Y7PensionRate;
          this.Y8PensionRate = this.settings.Y8PensionRate;
          this.Y9PensionRate = this.settings.Y9PensionRate;
          this.Y20PensionRate = this.settings.Y20PensionRate;
          this.Y30PensionRate = this.settings.Y30PensionRate;
          this.orderCount = this.settings.ordercount;


          // Get bond totals

          if(this.bondsLoaded == false) {
            this.bondIncome = 0;
            this.bondAssets = 0;
            this.bondsSubscription = this.bondService.getRealtimeBonds()
            .pipe(take(1))
            .subscribe(bonds => {
              this.bondList = bonds;
              if(this.bondList != undefined) {
                this.bondIncome = 0;
                this.bondAssets = 0;
                this.bondBalance = 0;

                this.bondList.forEach(bond => {
                  this.bond = bond
                  if (this.bond.forecast) {
                    this.bondIncome = this.bondIncome + this.bond.annualinterest;
                    this.bondAssets = this.bondAssets + this.bond.balance;
                  }
                });
                this.bondBalance = this.bondAssets;
                this.bondsLoaded = true;
              }
            });
          }

          // Get budget total income first

          if(this.budgetLoaded ==false) {
            this.budgetTotal = 0;
            this.budgetSubscription = this.budgetService.getRealtimeBudgets()
            .pipe(take(1))
            .subscribe(budgets => {
              this.budgetList = budgets;
              if(this.budgetList != undefined) {

                this.budgetList.forEach(budget => {
                  this.budget = budget;
                  if(this.budget != undefined) {
                    this.budgetTotal = this.budgetTotal + this.budget.annual;
                  }
                });
                this.budgetLoaded = true;
              }
            });
          }

          // Get salary totals

          if(this.salariesLoaded == false) {
            this.salaryIncome = 0;
            this.salariesSubscription = this.salariesService.getRealtimeSalaries()
            .pipe(take(1))
            .subscribe(salaries => {
              this.salaryList = salaries;
              if (this.salaryList != undefined) {
    
                this.salaryList.forEach(snapSalary => {
                  this.salary = snapSalary;
                  if(this.salary != undefined){
                    if (this.salary.forecast) {
                      if (this.salary.frequency === 'Weekly') {
                        this.salaryIncome = this.salaryIncome + 52 * this.salary.netincome;
                      } else {
                        if (this.salary.frequency === 'Monthly') {
                          this.salaryIncome = this.salaryIncome + 12 * this.salary.netincome;
                        } else {
                          if (this.salary.frequency === 'Quarterly') {
                            this.salaryIncome = this.salaryIncome + 4 * this.salary.netincome;
                          } else {
                            this.salaryIncome = this.salaryIncome + this.salary.netincome;
                          }
                        }
                      }
                    }
                  }
                });
                this.salariesLoaded = true;
              }
            });
          }
          

          // Get savings totals

          if(this.savingsLoaded == false) {
            this.savingsIncome = 0;
            this.savingsAssets = 0;
            this.savingsBalance = 0;
            this.savingsSubscription = this.savingsService.getRealtimeSavings()
            .pipe(take(1))
            .subscribe(savings => {
              this.savingsList = savings;
              if (this.savingsList != undefined) {
    
                this.savingsList.forEach(snapSaving => {
                  this.saving = snapSaving;
                  if(this.saving != undefined){
                    if (this.saving.forecast) {
                      this.savingsIncome = this.savingsIncome + (this.saving.balance * this.saving.interest / 100);
                      this.savingsAssets = this.savingsAssets + this.saving.balance;
                    }
                  }
                });
                this.savingsBalance = this.savingsAssets;
                this.savingsLoaded = true;
              }
            });
          }


          // Get pensions income

          if(this.pensionsLoaded == false) {
            this.pensionsIncome = 0;
            for (let i = 0; i < 50; i++) {
              this.pensionPaymentList[i] = this.myzero;
            }
    
            this.pensionSubscription = this.pensionService.getRealtimePensions()
            .pipe(take(1))
            .subscribe(pensions => {
              this.pensionsList = pensions;
              if (this.pensionsList != undefined) {
                this.pensionsList.forEach(snapPension => {
                  this.pension = snapPension;
                  if(this.pension != undefined) {
                    if (this.pension.forecast) {
                      const startyear = new Date(this.pension.startdate).getFullYear();
                      const startmonth = new Date(this.pension.startdate).getMonth();
                      this.pensionsIndex = 0;
                      for (let years = this.taxYear; years < (this.taxYear + 50); years++) {
                        if(years < startyear) {
                          this.pensionsIncome = 0;
                          this.pensionPaymentList[this.pensionsIndex] = this.pensionPaymentList[this.pensionsIndex] + 0;
                        } else {
                          if(years === startyear) {
                            this.pensionsIncome = this.pension.annualincome;
                            this.pensionPaymentList[this.pensionsIndex] = this.pensionPaymentList[this.pensionsIndex]
                            + (this.pensionsIncome * (12 - startmonth) / 12);
                          } else {
                            this.pensionPaymentList[this.pensionsIndex] = this.pensionPaymentList[this.pensionsIndex]
                            + this.pensionsIncome;
                          }
                          if ((years + 1 - this.taxYear) < 10) {
                            switch (years + 1 - this.taxYear) {
                              case 1: {
                                this.pensionsIncome = this.pensionsIncome * (1 + (this.Y1PensionRate / 100));
                                break;
                              }
                              case 2: {
                                this.pensionsIncome = this.pensionsIncome * (1 + (this.Y2PensionRate / 100));
                                break;
                              }
                              case 3: {
                                this.pensionsIncome = this.pensionsIncome * (1 + (this.Y3PensionRate / 100));
                                break;
                              }
                              case 4: {
                                this.pensionsIncome = this.pensionsIncome * (1 + (this.Y4PensionRate / 100));
                                break;
                              }
                              case 5: {
                                this.pensionsIncome = this.pensionsIncome * (1 + (this.Y5PensionRate / 100));
                                break;
                              }
                              case 6: {
                                this.pensionsIncome = this.pensionsIncome * (1 + (this.Y6PensionRate / 100));
                                break;
                              }
                              case 7: {
                                this.pensionsIncome = this.pensionsIncome * (1 + (this.Y7PensionRate / 100));
                                break;
                              }
                              case 8: {
                                this.pensionsIncome = this.pensionsIncome * (1 + (this.Y8PensionRate / 100));
                                break;
                              }
                              case 9: {
                                this.pensionsIncome = this.pensionsIncome * (1 + (this.Y9PensionRate / 100));
                                break;
                              }
                            }
                            
                          } else {
                            if ((years - this.taxYear + 1) < 20) {
                              this.pensionsIncome = this.pensionsIncome * (1 + (this.Y20PensionRate / 100));
                              } else {
                              this.pensionsIncome = this.pensionsIncome * (1 + (this.Y30PensionRate / 100));                          }
                          }
                          
                        }
                        this.pensionsIndex++;
                      }
                    }
                  }
                });
                this.pensionsLoaded = true;
              }
            });
          }
          

          // Get oneoff payments

          if(this.oneoffsLoaded == false) {
            this.myzero = 0;
            this.oneoffsAmount = 0;
            for (let i = 0; i < 40; i++) {
              this.oneoffsAmountList[i] = this.myzero;
            }
            this.oneoffsSubscription = this.oneoffsService.getRealtimeOneoffs()
            .pipe(take(1))
            .subscribe(oneoffs => {
              this.oneoffsList = oneoffs;
              if (this.oneoffsList != undefined) {
                this.oneoffsList.forEach(oneoff => {
                  this.oneoff = oneoff;
                  if(this.oneoff != undefined) {
                    if (this.oneoff.forecast) {
                      this.oneoffsIndex = 0;
                      for (let ooyears = this.taxYear; ooyears < (this.taxYear + 40); ooyears++) {
                        const eventstart = new Date(`${ooyears}-04-06`).toISOString();
                        const eventend = new Date(`${ooyears+1}-04-05`).toISOString();
                        if ((this.oneoff.eventdate > eventstart) &&  (this.oneoff.eventdate < eventend)) {
                          if (this.oneoff.type === 'Repayment' || this.oneoff.type === 'Out') {
                            this.oneoffsAmount =  this.oneoff.amount * -1;
                          } else {
                            this.oneoffsAmount =  this.oneoff.amount;
                          }
                          if(this.oneoffsAmount == undefined) {
                            this.oneoffsAmount = 0;
                          }
                          this.oneoffsAmountList[this.oneoffsIndex] = this.oneoffsAmountList[this.oneoffsIndex] + this.oneoffsAmount;
                        }
                        this.oneoffsIndex++;
                      }
                    }
                  }
                });
                this.oneoffsLoaded = true;
              }
            });
          }


          // Get loan repayments

          if(this.loansLoaded == false) {
            this.myzero = 0;
            this.loansAmount = 0;
            for (let i = 0; i < 40; i++) {
              this.loansAmountList[i] = this.myzero;
            }
            this.loansSubscription = this.loanService.getRealtimeLoans()
            .pipe(take(1))
            .subscribe(loans => {
              this.loansList = loans;
              if (this.loansList != undefined) {
                this.loansList.forEach(loan => {
                  this.loan = loan;
                  if(this.loan != undefined) {
                    this.loansIndex = 0;
                    let loanAnnualPayment = this.loan.annualpayments;
                    let loanTally = this.loan.balance
                    for (let loanyears = this.taxYear; loanyears < (this.taxYear + 40); loanyears++) {
                      if(loanTally < 0) {
                        loanAnnualPayment = 0
                        this.loansAmountList[this.loansIndex-1] = this.loansAmountList[this.loansIndex-1] + loanTally;
                        loanTally = 0;
                      } else {
                        this.loansAmountList[this.loansIndex] = this.loansAmountList[this.loansIndex] + loanAnnualPayment;
                        loanTally = loanTally - loanAnnualPayment;
                      }
                      this.loansIndex++;
                    }
                  }
                });
                this.loansLoaded = true;
              }
            });
          }


          // Get properties totals

          if(this.propertiesLoaded == false) {
            this.propertySubscription = this.propertyService.getRealtimeProperties()
            .pipe(take(1))
            .subscribe(properties => {
              this.propertyList = properties;
              if (this.propertyList != undefined) {
                this.propertyIncome = 0;
                this.propertyAssets = 0;
                this.propertyBalance = 0;
                this.propertyList.forEach(snapProperty => {
                  this.property = snapProperty;
                  if(this.property != undefined) {
                    if (this.property.forecast) {
                      this.propertyIncome = this.propertyIncome + this.property.budgetrentalincome
                      -this.property.budgetinsurance-this.property.budgetmaintenance
                      -this.property.budgetmanagement-this.property.budgetmortgage
                      -this.property.budgetothercosts-this.property.budgetutilities;
                      this.propertyAssets = this.propertyAssets + this.property.currentvalue;
                    }
                  }
                });
                this.propertyBalance = this.propertyAssets;
                this.propertiesLoaded = true;
              }
            });
          }
          

          // Load portfolio SIPP, ISAa and trading income and assets

          if(this.portfoliosLoaded == false) {
            this.totalCashBalance = 0;
            this.totalSIPPAssets = 0;
            this.totalTradingAssets = 0;
            this.totalISAAssets = 0;
            this.totalTradingIncome = 0;
            this.totalSIPPIncome = 0;
            this.totalISAIncome =0;

            this.portfolioSubscription = this.portfolioService.getRealtimePortfolios()
            .pipe(take(1))
            .subscribe(portfolios => {
              this.portfolioList = portfolios;
              if (this.portfolioList != undefined) {
                if( this.portfolioSubscription.lastValueFrom) {
                  this.portfoliosLoaded = true;
                }
                this.portfolioList.forEach(portfolio => {
                  this.portfolio = portfolio;
                  this.stocksLoaded = false;
                  this.trustsLoaded = false;
                  const portfolioId = this.portfolio.id;

                  if((this.portfolio != undefined) && this.portfolio.forecast) {
                    this.totalCashBalance = this.totalCashBalance + this.portfolio.balance;
                    if (this.portfolio.taxable === 'Trading') {
                      this.totalTradingAssets = this.totalTradingAssets + this.portfolio.balance +
                        this.portfolio.stocksbalance + this.portfolio.trustsbalance;
                    }
                    if (this.portfolio.taxable === 'SIPP') {
                      this.totalSIPPAssets = this.totalSIPPAssets + this.portfolio.balance +
                        this.portfolio.stocksbalance + this.portfolio.trustsbalance;
                    }
                    if (this.portfolio.taxable === 'ISA') {
                      this.totalISAAssets = this.totalISAAssets + this.portfolio.balance +
                        this.portfolio.stocksbalance + this.portfolio.trustsbalance;
                    }
                    if(this.stocksLoaded == false) {
                      this.stocksSubscription = this.stockService.getStockListByPortfolioId(portfolioId)
                      .pipe(take(1))
                      .subscribe(stocks => {
                        this.stockList = stocks;
                        if (this.stockList != undefined) {
                          this.stockList.forEach((stock: Stock) => {
                            this.stock = stock;
                            if(this.stock != undefined) {
                              if (this.portfolio.taxable === 'Trading') {
                                this.totalTradingIncome = this.totalTradingIncome + (this.stock.price *
                                  this.stock.quantity * this.stock.stockyield / 10000);
                              }
                              if (this.portfolio.taxable === 'SIPP') {
                                this.totalSIPPIncome = this.totalSIPPIncome + (this.stock.price *
                                  this.stock.quantity * this.stock.stockyield / 10000);
                              }
                              if (this.portfolio.taxable === 'ISA') {
                                this.totalISAIncome = this.totalISAIncome + (this.stock.price *
                                  this.stock.quantity * this.stock.stockyield / 10000);
                              }
                            }
                          });
                        }
                        this.stocksLoaded = true;
                      });
                    }
                    
    
                    if(this.trustsLoaded == false) {
                      this.trustsSubscription = this.trustService.getTrustListByPortfolioId(portfolioId)
                      .pipe(take(1))
                      .subscribe(trusts => {
                        this.trustList = trusts;
                        if (this.trustList != undefined) {
                          this.trustList.forEach(snapTrust => {
                            this.trust = snapTrust;
                            if(this.trust != undefined) {
                              if (portfolio.taxable === 'Trading') {
                                this.totalTradingIncome = this.totalTradingIncome + (snapTrust.price *
                                  snapTrust.quantity * snapTrust.trustyield / 10000);
                              }
                              if (portfolio.taxable === 'SIPP') {
                                this.totalSIPPIncome = this.totalSIPPIncome + (snapTrust.price *
                                  snapTrust.quantity * snapTrust.trustyield / 10000);
                              }
                              if (portfolio.taxable === 'ISA') {
                                this.totalISAIncome = this.totalISAIncome + (snapTrust.price *
                                  snapTrust.quantity * snapTrust.trustyield / 10000);
                              }
                            }
                          });
                        }
                        this.trustsLoaded = false;
                      });
                    }
                  }
                });
                this.totalTradingBalance = this.totalTradingAssets;
                this.totalSIPPBalance = this.totalSIPPAssets;
                this.totalISABalance = this.totalISAAssets;
                this.portfoliosLoaded = true;
              }
            });
          }
          for (let i = 5; i > 1; i--) {
            this.createDelay(3000).then(res => {
              this.toastService.displayToast(`Loading data, please wait .... ${i}`);
            });
          }
          this.createDelay(3000).then(res => {
            this.settingsService.getReorderListPromise().then((reorderList: Reorder[]) => {
              if(this.settingsLoaded && this.budgetLoaded && this.salariesLoaded
                && this.savingsLoaded && this.bondsLoaded && this.propertiesLoaded
                && this.portfoliosLoaded && this.pensionsLoaded && this.oneoffsLoaded) {

                // Adjust SIPP balance for crystalisation
                const sippTaxFree = this.totalSIPPAssets / 4;
                const sippNetofTax = this.totalSIPPAssets * 0.82 * 3 / 4;
                this.totalSIPPAssets = sippTaxFree + sippNetofTax;
                this.totalSIPPBalance = this.totalSIPPAssets;

                if(this.budgetTotal == undefined) {
                  this.budgetTotal = 0;
                }
                if(this.savingsbondIncome == undefined) {
                  this.savingsbondIncome = 0;
                }
                if(this.totalDividends == undefined) {
                  this.totalDividends = 0;
                }
                if(this.propertyIncome == undefined) {
                  this.propertyIncome = 0;
                }
                if(this.pensionIncome == undefined) {
                  this.pensionIncome = 0;
                }
                if(this.oneoffAmount == undefined) {
                  this.oneoffAmount = 0;
                }
                if(this.annualIncome == undefined) {
                  this.annualIncome = 0;
                }
                if(this.annualChange == undefined) {
                  this.annualChange = 0;
                }
                if(this.savingsBalance == undefined) {
                  this.savingsBalance = 0;
                }
                if(this.totalTradingBalance == undefined) {
                  this.totalTradingBalance = 0;
                }
                if(this.bondBalance == undefined) {
                  this.bondBalance = 0;
                }
                if(this.totalSIPPBalance == undefined) {
                  this.totalSIPPBalance = 0;
                }
                if(this.totalISABalance == undefined) {
                  this.totalISABalance = 0;
                }
                if(this.propertyBalance == undefined) {
                  this.propertyBalance = 0;
                }

                // Now build spreadsheet table list

                this.SIPPIncome = this.totalSIPPIncome;
                this.ISAIncome = this.totalISAIncome;
                this.tradingIncome = this.totalTradingIncome;
                this.incomeSet = false;
                this.reorderList = reorderList;

                this.rowList = [];
                if (this.reorderList && !this.reorderLoaded) {
                  this.reorderIndex = 0;
                  this.remainder = 0;
                  for (let years = this.taxYear; years < (this.taxYear + 40); years++) {
                    if(this.reorderList[this.reorderIndex].type == 'Property') {
                      this.propertySold = true;
                    }
                    if(!this.incomeSet) {
                      this.annualIncome = 0;
                      this.savingsbondIncome = 0;
                      this.totalDividends = 0;
                      this.savingsIncome = 0;
                      this.pensionIncome = 0;
                      this.oneoffAmount = 0;

                      if(this.savingsAssets > 0 && this.savingsAssets != undefined) {
                        this.annualIncome = this.annualIncome + this.savingsIncome;
                        this.savingsbondIncome = this.savingsbondIncome + this.savingsIncome;
                      }
  
                      if(this.bondAssets > 0 && this.bondAssets != undefined) {
                        this.annualIncome = this.annualIncome + this.bondIncome;
                        this.savingsbondIncome = this.savingsbondIncome + this.bondIncome;
                      }
  
                      if(this.totalISAAssets != 0 && this.totalISAAssets != undefined) {
                        this.annualIncome = this.annualIncome + this.ISAIncome;
                        this.totalDividends = this.totalDividends + this.ISAIncome;              
                      }
  
                      if(this.totalTradingAssets != 0 && this.totalTradingAssets != undefined) {
                        this.annualIncome = this.annualIncome + this.tradingIncome;
                        this.totalDividends = this.totalDividends + this.tradingIncome;
                      }
  
                      if(this.propertyAssets != 0 && this.propertyAssets != undefined && this.propertySold == false) {
                        this.annualIncome = this.annualIncome + this.propertyIncome;
                      }
  
                      if(this.pensionPaymentList[this.yearClock] != 0 && this.pensionPaymentList[this.yearClock] != undefined) {
                        this.pensionIncome = this.pensionPaymentList[this.yearClock];
                        this.annualIncome = this.annualIncome + this.pensionIncome;
                      } else {
                        this.pensionIncome = 0;
                      }
  
                      if(this.oneoffsAmountList[this.yearClock] != 0 && this.oneoffsAmountList[this.yearClock] != undefined) {
                        this.oneoffAmount = this.oneoffsAmountList[this.yearClock];
                        this.annualIncome = this.annualIncome + this.oneoffAmount;
                      } else {
                        this.oneoffAmount = 0;
                      }

                      if(this.loansAmountList[this.yearClock] != 0 && this.loansAmountList[this.yearClock] != undefined) {
                        this.loanAmount = this.loansAmountList[this.yearClock];
                        this.annualIncome = this.annualIncome + this.loanAmount;
                      } else {
                        this.loanAmount = 0;
                      }

                      this.annualIncome = this.annualIncome + this.salaryIncome;
                      this.annualChange = this.annualIncome - this.budgetTotal;

                      this.totalBalance = this.annualChange + this.savingsBalance + this.bondBalance
                        + this.totalSIPPBalance + this.totalISABalance + this.totalTradingBalance + 
                        this.propertyBalance;
                        
                      this.incomeSet = true;
                    }
                    let indexFlagUp = false;
                    switch(this.reorderList[this.reorderIndex].type) {
                      case 'SIPP': {
                        if (this.totalSIPPBalance === 0) {
                          indexFlagUp = true;
                        } else {
                          if (this.totalSIPPBalance < (this.annualChange * -1)) {
                            if (this.remainder < 0) {
                              this.remainder = this.remainder + this.totalSIPPBalance;
                            } else {
                              this.remainder = this.totalSIPPBalance + this.annualChange;
                            }
                            this.totalSIPPBalance = 0;
                            indexFlagUp = true;
                          } else {
                            if (this.remainder < 0) {
                              this.totalSIPPBalance = this.totalSIPPBalance + this.remainder;
                            } else {
                              this.totalSIPPBalance = this.totalSIPPBalance + this.annualChange;
                            }
                            this.remainder = 0;
                          }
                        }
                        break;
                      }

                      case 'ISA': {

                        if (this.totalISABalance === 0) {
                          indexFlagUp = true;
                        } else {
                          if (this.totalISABalance < (this.annualChange * -1)) {
                            if (this.remainder < 0) {
                              this.remainder = this.remainder + this.totalISABalance;
                            } else {
                              this.remainder = this.totalISABalance + this.annualChange;
                            }
                            this.totalISABalance = 0;
                            indexFlagUp = true;
                          } else {
                            if (this.remainder < 0) {
                              this.totalISABalance = this.totalISABalance + this.remainder;
                            } else {
                              this.totalISABalance = this.totalISABalance + this.annualChange;
                            }
                            this.remainder = 0;
                          }
                        }
                        break;
                      }

                      case 'Trading': {

                        if (this.totalTradingBalance === 0) {
                          indexFlagUp = true;
                        } else {
                          if (this.totalTradingBalance < (this.annualChange * -1)) {
                            if (this.remainder < 0) {
                              this.remainder = this.remainder + this.totalTradingBalance;
                            } else {
                              this.remainder = this.totalTradingBalance + this.annualChange;
                            }
                            this.totalTradingBalance = 0;
                            indexFlagUp = true;
                          } else {
                            if (this.remainder < 0) {
                              this.totalTradingBalance = this.totalTradingBalance + this.remainder;
                            } else {
                              this.totalTradingBalance = this.totalTradingBalance + this.annualChange;
                            }
                            this.remainder = 0;
                          }
                        }
                        break;
                      }


                      case 'Savings': {

                        if (this.savingsBalance === 0) {
                          indexFlagUp = true;
                        } else {
                          if (this.savingsBalance < (this.annualChange * -1)) {
                            if (this.remainder < 0) {
                              this.remainder = this.remainder = this.savingsBalance;
                            } else {
                              this.remainder = this.savingsBalance + this.annualChange;
                            }
                            this.savingsBalance = 0;
                            indexFlagUp = true;
                          } else {
                            if (this.remainder < 0) {
                              this.savingsBalance = this.savingsBalance + this.remainder;
                            } else {
                              this.savingsBalance = this.savingsBalance + this.annualChange;
                            }
                            this.remainder = 0;
                          }
                        }
                        break;
                      }

                      case 'Property': {

                        if (this.propertyBalance === 0) {
                          indexFlagUp = true;
                        } else {
                          if (this.propertyBalance < (this.annualChange * -1)) {
                            if (this.remainder < 0) {
                              this.remainder = this.remainder + this.propertyBalance;
                            } else {
                              this.remainder = this.propertyBalance + this.annualChange;
                            }
                            this.propertyBalance = 0;
                            indexFlagUp = true;
                          } else {
                            if (this.remainder < 0) {
                              this.propertyBalance = this.propertyBalance + this.remainder;
                            } else {
                              this.propertyBalance = this.propertyBalance + this.annualChange;
                            }
                            this.remainder = 0;
                          }
                        }
                        break;
                      }

                      case 'Bond': {

                        if (this.bondBalance === 0) {
                          indexFlagUp = true;
                        } else {
                          if (this.bondBalance < (this.annualChange * -1)) {
                            if (this.remainder < 0) {
                              this.remainder = this.remainder + this.bondBalance;
                            } else {
                              this.remainder = this.bondBalance + this.annualChange;
                            }
                            this.bondBalance = 0;
                            indexFlagUp = true;
                          } else {
                            if (this.remainder < 0) {
                              this.bondBalance = this.bondBalance + this.remainder;
                            } else {
                              this.bondBalance = this.bondBalance + this.annualChange;
                            }
                            this.remainder = 0;
                          }
                        }
                        break;
                      }

                      default: {
                      }
                    }

                    if (this.remainder == 0) {
                      this.rowList.push({
                        year: years,
                        budget: this.budgetTotal.toFixed(2),
                        savingIncome: this.savingsbondIncome.toFixed(2),
                        dividends: this.totalDividends.toFixed(2),
                        salaries: this.salaryIncome.toFixed(2),
                        propertiesIncome: this.propertyIncome.toFixed(2),
                        pensionsIncome: this.pensionIncome.toFixed(2),
                        loansIncome: this.loanAmount.toFixed(2),
                        oneoffs: this.oneoffAmount.toFixed(2),
                        income: this.annualIncome.toFixed(2),
                        change: this.annualChange.toFixed(2),
                        savings: this.savingsBalance.toFixed(2),
                        trading: this.totalTradingBalance.toFixed(2),
                        bonds: this.bondBalance.toFixed(2),
                        sipps: this.totalSIPPBalance.toFixed(2),
                        isas: this.totalISABalance.toFixed(2),
                        property: this.propertyBalance.toFixed(2),
                        assets: this.totalBalance.toFixed(2),
                        itemid: this.reorderList[this.reorderIndex].itemid,
                        id: this.reorderList[this.reorderIndex].id
                      });
                      this.savingsIncome = this.savingsIncome * this.savingsBalance / this.savingsAssets;                
                      this.bondIncome = this.bondIncome * this.bondBalance / this.bondAssets;               
                      this.propertyIncome = this.propertyIncome + (this.propertyGrowthRate * this.propertyIncome / 100);
                      this.propertyBalance = this.propertyBalance * (1 + (this.propertyGrowthRate / 100));
                      this.totalSIPPBalance = this.totalSIPPBalance * (1 + (this.investmentGrowthRate / 100)) + this.SIPPIncome;
                      this.totalISABalance = this.totalISABalance * (1 + (this.investmentGrowthRate / 100));
                      this.totalTradingBalance = this.totalTradingBalance * (1 + (this.investmentGrowthRate / 100));
                      this.ISAIncome = this.totalISAIncome * (1 + this.dividendRate/100) * this.totalISABalance / this.totalISAAssets;   
                      this.tradingIncome = this.totalTradingIncome * (1 + this.dividendRate/100) * this.totalTradingBalance / this.totalTradingAssets;                

                      if(this.totalSIPPAssets != 0 && this.totalSIPPAssets != undefined) {
                        this.totalSIPPBalance = this.totalSIPPBalance + this.SIPPIncome;
                        this.SIPPIncome = this.totalSIPPIncome * (1 + this.dividendRate/100) * this.totalSIPPBalance / this.totalSIPPAssets;
                      }

                      // now do the maths for each budget year

                      if (this.yearClock < 10) {
                        switch (this.yearClock) {
                          case 1: {
                            this.budgetTotal = this.budgetTotal * (1 + (this.Y1CPIRate / 100));
                            break;
                          }
                          case 2: {
                            this.budgetTotal = this.budgetTotal * (1 + (this.Y2CPIRate / 100));
                            break;
                          }
                          case 3: {
                            this.budgetTotal = this.budgetTotal * (1 + (this.Y3CPIRate / 100));
                            break;
                          }
                          case 4: {
                            this.budgetTotal = this.budgetTotal * (1 + (this.Y4CPIRate / 100));
                            break;
                          }
                          case 5: {
                            this.budgetTotal = this.budgetTotal * (1 + (this.Y5CPIRate / 100));
                            break;
                          }
                          case 6: {
                            this.budgetTotal = this.budgetTotal * (1 + (this.Y6CPIRate / 100));
                            break;
                          }
                          case 7: {
                            this.budgetTotal = this.budgetTotal * (1 + (this.Y7CPIRate / 100));
                            break;
                          }
                          case 8: {
                            this.budgetTotal = this.budgetTotal * (1 + (this.Y8CPIRate / 100));
                            break;
                          }
                          case 9: {
                            this.budgetTotal = this.budgetTotal * (1 + (this.Y9CPIRate / 100));
                            break;
                          }
                        }
                        
                      } else {
                        if (this.yearClock < 20) {
                          this.budgetTotal = this.budgetTotal * (1 + (this.Y20CPIRate / 100));
                        } else {
                          this.budgetTotal = this.budgetTotal * (1 + (this.Y30CPIRate / 100));
                        }
                      }
                      this.yearClock++;
                      this.incomeSet = false;
                    }

                    if (indexFlagUp) {
                      this.reorderIndex++;
                    }
                    if (this.remainder !== 0) {
                      years--;
                      this.incomeSet = true;
                    }
                    if (this.reorderIndex > this.orderCount - 2) {
                      years = this.taxYear + 40;
                    }
                  }
                  this.rows = this.rowList;
                  this.reorderLoaded = true;
                }
              } else {
                this.toastService.displayToast('Loading data failed, try again.');
              }
            });
          });
        }
      });
    }
  }

  async createDelay(ms: number): Promise<any> {
    // Do something before delay
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  ionViewWillLeave() {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
    if (this.bondsSubscription) {
      this.bondsSubscription.unsubscribe();
    }
    if (this.budgetSubscription) {
      this.budgetSubscription.unsubscribe();
    }
    if (this.salariesSubscription) {
      this.salariesSubscription.unsubscribe();
    }
    if (this.savingsSubscription) {
      this.savingsSubscription.unsubscribe();
    }
    if (this.pensionSubscription) {
      this.pensionSubscription.unsubscribe();
    }
    if (this.loansSubscription) {
      this.loansSubscription.unsubscribe();
    }
    if (this.oneoffsSubscription) {
      this.oneoffsSubscription.unsubscribe();
    }
    if (this.propertySubscription) {
      this.propertySubscription.unsubscribe();
    }
    if (this.portfolioSubscription) {
      this.portfolioSubscription.unsubscribe();
    }
    if (this.stocksSubscription) {
      this.stocksSubscription.unsubscribe();
    }
    if (this.trustsSubscription) {
      this.trustsSubscription.unsubscribe();
    }
    if (this.reorderLSubscription) {
      this.reorderLSubscription.unsubscribe();
    }
  }
}
