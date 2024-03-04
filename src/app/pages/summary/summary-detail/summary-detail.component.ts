import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SettingsService } from '../../../services/settings/settings.service';
import { BondService } from '../../../services/bond/bond.service';
import { SavingsService } from '../../../services/savings/savings.service';
import { PortfolioService } from '../../../services/portfolio/portfolio.service';
import { PropertyService } from '../../../services/property/property.service';
import { LoanService } from '../../../services/loan/loan.service';
import { DebtService } from '../../../services/debt/debt.service';
import { Portfolio } from '../../../models/portfolio';
import { Bond } from '../../../models/bond';
import { Saving } from '../../../models/saving';
import { Property } from '../../../models/property';
import { Loan } from '../../../models/loan';
import { Debt } from '../../../models/debt';
import { map, take } from 'rxjs/operators';
import { ViewEncapsulation } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-summary-detail',
  templateUrl: './summary-detail.component.html',
  styleUrls: ['./summary-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, NgxDatatableModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class SummaryDetailComponent  implements OnInit {
  public settingsSubscription: any;
  public portfolioSubscription: any;
  public bondSubscription: any;
  public savingsSubscription: any;
  public propertiesSubscription: any;
  public loanSubscription: any;
  public debtSubscription: any;

  public enableportfolios: boolean;
  public enablebonds: boolean;
  public enablesavings: boolean;
  public enableproperty: boolean;
  public enableloans: boolean;
  public enabledebts: boolean;

  public taxyear: number;

  public portfolioList: Portfolio[];
  public portfolio: Portfolio;
  public bondList: Bond[];
  public bond: Bond;
  public savingsList: Saving[];
  public saving: Saving;
  public propertiesList: Property[];
  public property: Property;
  public loansList: Loan[];
  public loan: Loan;
  public debtsList: Debt[];
  public debt: Debt;

  public rowSIPPList: Array<any>;
  public rowISAList: Array<any>;
  public rowTradingList: Array<any>;
  public rowBondsList: Array<any>;
  public rowSavingsList: Array<any>;
  public rowPropertiesList: Array<any>;
  public rowLoansList: Array<any>;
  public rowDebtsList: Array<any>;
  public rowTotalsList: Array<any>;


  public columns: any;
  public rowssipps: any;
  public rowsisas: any;
  public rowstrading: any;
  public rowsbonds: any;
  public rowssavings: any;
  public rowsproperties: any;
  public rowsloans: any;
  public rowsdebts: any;
  public rowstotals: any;


  public totalInitialSipps: number;
  public totalInitialIsas: number;
  public totalInitialTrading: number;
  public totalInitialBonds: number;
  public totalInitialSavings: number;
  public totalInitialProperties: number;
  public totalInitialLoans: number;
  public totalInitialDebts: number;
  public totalInitialTotals: number;

  public isPortfoliosLoaded: boolean;
  public isBondsLoaded: boolean;
  public isSavingsLoaded: boolean;
  public isPropertiesLoaded: boolean;
  public isLoansLoaded: boolean;
  public isDebtsLoaded: boolean;

  public totalCashSipps: number;
  public totalCashIsas: number;
  public totalCashTrading: number;

  public totalCashTotals: number;


  public totalInvestedSipps: number;
  public totalInvestedIsas: number;
  public totalInvestedTrading: number;
  public totalInvestedBonds: number;
  public totalInvestedSavings: number;
  public totalInvestedProperties: number;
  public totalLoans: number;
  public totalDebts: number;
  public totalInvestedTotals: number;

  readonly settingsList$ = this.settingsService.getSettings();
//  readonly bondList$ = this.bondService.getBonds();
//  readonly savingsList$ = this.savingsService.getSavings();
//  readonly propertyList$ = this.propertyService.getProperties();
//  readonly portfolioList$ = this.portfolioService.getPortfolios();
//  readonly loanList$ = this.loanService.getLoans();
//  readonly debtList$ = this.debtService.getDebts();
//  readonly reorderList$ = this.settingsService.getReorderList();

  constructor(
    private settingsService: SettingsService,
    private bondService: BondService,
    private savingsService: SavingsService,
    private portfolioService: PortfolioService,
    private propertyService: PropertyService,
    private loanService: LoanService,
    private debtService: DebtService,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewDidEnter() {
      this.settingsSubscription = this.settingsList$.pipe(take(1))
      .subscribe(settings => {
        this.enableportfolios = settings.enableportfolios;
        this.enablebonds = settings.enablebonds;
        this.enablesavings = settings.enablesavings;
        this.enableproperty = settings.enableproperty;
        this.enableloans = settings.enableloans;
        this.enabledebts = settings.enabledebts;
        this.taxyear = +settings.taxyear;
        this.totalInitialTotals = 0;
        this.totalCashTotals = 0;
        this.totalInvestedTotals = 0;
        this.rowTotalsList = [];
        this.isPortfoliosLoaded = false;
        this.isBondsLoaded = false;
        this.isSavingsLoaded = false;
        this.isPropertiesLoaded = false;
        this.isLoansLoaded = false;
        this.isDebtsLoaded = false;

        if (this.enableportfolios) {

          this.portfolioSubscription = this.portfolioService.getRealtimePortfolios()
          .subscribe(portfolioListSnapshot => {
            this.portfolioList = portfolioListSnapshot;
            this.rowSIPPList = [];
            this.rowISAList = [];
            this.rowTradingList = [];

            this.totalInitialSipps = 0;
            this.totalInitialIsas = 0;
            this.totalInitialTrading = 0;
            this.totalCashSipps = 0;
            this.totalCashIsas = 0;
            this.totalCashTrading = 0;
            this.totalInvestedSipps = 0;
            this.totalInvestedIsas = 0;
            this.totalInvestedTrading = 0;

            if (this.portfolioList) {
              this.portfolioList.forEach(snapPortfolio => {
                this.portfolio = snapPortfolio;
                const initial = this.portfolio.initialcash +
                  this.portfolio.initialstocksbalance + this.portfolio.initialtrustsbalance;
                const investedamount = this.portfolio.stocksbalance + this.portfolio.trustsbalance;
                const totalamount = this.portfolio.balance + investedamount;
                const profitamount = totalamount - initial;
                const percentprofit = profitamount / initial;

                if (this.portfolio.taxable === 'SIPP') {
                  this.rowSIPPList.push({
                    account: this.portfolio.name,
                    initialamount: initial,
                    cash: this.portfolio.balance,
                    invested: investedamount,
                    total: totalamount,
                    profit: profitamount,
                    percent: percentprofit
                  });
                  this.totalInitialSipps = this.totalInitialSipps + initial;
                  this.totalCashSipps = this.totalCashSipps + this.portfolio.balance;
                  this.totalInvestedSipps = this.totalInvestedSipps + investedamount;
                }
                if (this.portfolio.taxable === 'ISA') {
                  this.rowISAList.push({
                    account: this.portfolio.name,
                    initialamount: initial,
                    cash: this.portfolio.balance,
                    invested: investedamount,
                    total: totalamount,
                    profit: profitamount,
                    percent: percentprofit
                  });
                  this.totalInitialIsas = this.totalInitialIsas + initial;
                  this.totalCashIsas = this.totalCashIsas + this.portfolio.balance;
                  this.totalInvestedIsas = this.totalInvestedIsas + investedamount;
                }
                if (this.portfolio.taxable === 'Trading') {
                  this.rowTradingList.push({
                    account: this.portfolio.name,
                    initialamount: initial,
                    cash: this.portfolio.balance,
                    invested: investedamount,
                    total: totalamount,
                    profit: profitamount,
                    percent: percentprofit
                  });
                  this.totalInitialTrading = this.totalInitialTrading + initial;
                  this.totalCashTrading = this.totalCashTrading + this.portfolio.balance;
                  this.totalInvestedTrading = this.totalInvestedTrading + investedamount;
                }
              });
              this.isPortfoliosLoaded =  true;
              const SIPPtotalamount = this.totalCashSipps + this.totalInvestedSipps;
              const SIPPprofitamount = SIPPtotalamount - this.totalInitialSipps;
              const SIPPpercentprofit = SIPPprofitamount / this.totalInitialSipps;
              this.addTotals(this.totalInitialSipps, this.totalCashSipps, this.totalInvestedSipps);
              this.rowSIPPList.push({
                account: 'TOTAL:',
                initialamount: this.totalInitialSipps,
                cash: this.totalCashSipps,
                invested: this.totalInvestedSipps,
                total: SIPPtotalamount,
                profit: SIPPprofitamount,
                percent: SIPPpercentprofit
              });
              this.isPortfoliosLoaded =  true;
              const ISAtotalamount = this.totalCashIsas + this.totalInvestedIsas;
              const ISAprofitamount = ISAtotalamount - this.totalInitialIsas;
              const ISApercentprofit = ISAprofitamount / this.totalInitialIsas;
              this.addTotals(this.totalInitialIsas, this.totalCashIsas, this.totalInvestedIsas);
              this.rowISAList.push({
                account: 'TOTAL:',
                initialamount: this.totalInitialIsas,
                cash: this.totalCashIsas,
                invested: this.totalInvestedIsas,
                total: ISAtotalamount,
                profit: ISAprofitamount,
                percent: ISApercentprofit
              });
              this.isPortfoliosLoaded =  true;
              const Tradingtotalamount = this.totalCashTrading + this.totalInvestedTrading;
              const Tradingprofitamount = Tradingtotalamount - this.totalInitialTrading;
              const Tradingpercentprofit = Tradingprofitamount / this.totalInitialTrading;
              this.addTotals(this.totalInitialTrading, this.totalCashTrading, this.totalInvestedTrading);
              this.rowTradingList.push({
                account: 'TOTAL:',
                initialamount: this.totalInitialTrading,
                cash: this.totalCashTrading,
                invested: this.totalInvestedTrading,
                total: Tradingtotalamount,
                profit: Tradingprofitamount,
                percent: Tradingpercentprofit
              });
              this.rowssipps = this.rowSIPPList;
              this.rowsisas = this.rowISAList;
              this.rowstrading = this.rowTradingList;

            }
          });
        }

        if (this.enablebonds) {
          this.bondSubscription = this.bondService.getRealtimeBonds()
          .subscribe(bondListSnapshot => {
            this.bondList = bondListSnapshot;
            this.rowBondsList = [];
            this.totalInitialBonds = 0;
            this.totalInvestedBonds = 0;

            this.bondList.forEach(snapBond => {
              this.bond = snapBond;
              const initial = this.bond.initialcash;
              const investedamount = this.bond.balance;
              const totalamount = this.bond.balance;
              const profitamount = totalamount - initial;
              const percentprofit = profitamount / initial;

              this.rowBondsList.push({
                account: this.bond.name,
                initialamount: initial,
                cash: '0',
                invested: investedamount,
                total: totalamount,
                profit: profitamount,
                percent: percentprofit
              });
              this.totalInitialBonds = this.totalInitialBonds + initial;
              this.totalInvestedBonds = this.totalInvestedBonds + investedamount;

            });
            this.isBondsLoaded =  true;
            const Bondtotalamount = this.totalInvestedBonds;
            const Bondprofitamount = Bondtotalamount - this.totalInitialBonds;
            const Bondpercentprofit = Bondprofitamount / this.totalInitialBonds;
            this.addTotals(this.totalInitialBonds, 0, this.totalInvestedBonds);

            this.rowBondsList.push({
              account: 'TOTAL:',
              initialamount: this.totalInitialBonds,
              cash: '0',
              invested: this.totalInvestedBonds,
              total: Bondtotalamount,
              profit: Bondprofitamount,
              percent: Bondpercentprofit
            });
            this.rowsbonds = this.rowBondsList;
          });
        }

        if (this.enablesavings) {
          this.savingsSubscription = this.savingsService.getRealtimeSavings()
          .subscribe(savingListSnapshot => {
            this.savingsList = savingListSnapshot;
            this.rowSavingsList = [];
            this.totalInitialSavings = 0;
            this.totalInvestedSavings = 0;

            this.savingsList.forEach(snapSaving => {
              this.saving = snapSaving;
              const initial = this.saving.initialcash;
              const investedamount = this.saving.balance;
              const totalamount = this.saving.balance;
              const profitamount = totalamount - initial;
              const percentprofit = profitamount / initial;

              this.rowSavingsList.push({
                account: this.saving.name,
                initialamount: initial,
                cash: '0',
                invested: investedamount,
                total: totalamount,
                profit: profitamount,
                percent: percentprofit
              });
              this.totalInitialSavings = this.totalInitialSavings + initial;
              this.totalInvestedSavings = this.totalInvestedSavings + investedamount;

            });

            this.isSavingsLoaded =  true;
            const savingTotalAmount = this.totalInvestedSavings;
            const savingProfitAmount = savingTotalAmount - this.totalInitialSavings;
            const savingPercentProfit = savingProfitAmount / this.totalInitialSavings;
            this.addTotals(this.totalInitialSavings, 0, this.totalInvestedSavings);

            this.rowSavingsList.push({
              account: 'TOTAL:',
              initialamount: this.totalInitialSavings,
              cash: '0',
              invested: this.totalInvestedSavings,
              total: savingTotalAmount,
              profit: savingProfitAmount,
              percent: savingPercentProfit
            });
            this.rowssavings = this.rowSavingsList;
          });
        }

        if (this.enableproperty) {
          this.propertiesSubscription = this.propertyService.getRealtimeProperties()
          .subscribe(propertyListSnapshot => {
            this.propertiesList = propertyListSnapshot;
            this.rowPropertiesList = [];
            this.totalInitialProperties = 0;
            this.totalInvestedProperties = 0;

            this.propertiesList.forEach(snapProperty => {
              this.property = snapProperty;
              const initial = this.property.initialcash + this.property.purchasevalue;
              const investedamount = this.property.currentvalue;
              const totalamount = this.property.currentcashbalance + this.property.currentvalue;
              const profitamount = totalamount - initial;
              const percentprofit = profitamount / initial;

              this.rowPropertiesList.push({
                account: this.property.name,
                initialamount: this.property.purchasevalue,
                cash: '0',
                invested: investedamount,
                total: totalamount,
                profit: profitamount,
                percent: percentprofit
              });
              this.totalInitialProperties = this.totalInitialProperties + initial;
              this.totalInvestedProperties = this.totalInvestedProperties + investedamount;

            });

            this.isPropertiesLoaded =  true;
            const propertyTotalAmount = this.totalInvestedProperties;
            const propertyProfitAmount = propertyTotalAmount - this.totalInitialProperties;
            const propertyPercentProfit = propertyProfitAmount / this.totalInitialProperties;
            this.addTotals(this.totalInitialProperties, 0, this.totalInvestedProperties);

            this.rowPropertiesList.push({
              account: 'TOTAL:',
              initialamount: this.totalInitialProperties,
              cash: '0',
              invested: this.totalInvestedProperties,
              total: propertyTotalAmount,
              profit: propertyProfitAmount,
              percent: propertyPercentProfit
            });
            this.rowsproperties = this.rowPropertiesList;
          });
        }

        if (this.enableloans) {
          this.loanSubscription = this.loanService.getRealtimeLoans()
          .subscribe(loansListSnapshot => {
            this.loansList = loansListSnapshot;
            this.rowLoansList = [];
            this.totalInitialLoans = 0;
            this.totalLoans = 0;

            this.loansList.forEach(snapLoan => {
              this.loan = snapLoan;
              const initial = this.loan.initialloan;
              const totalamount = this.loan.balance;

              this.rowLoansList.push({
                account: this.loan.name,
                initialamount: initial,
                cash: 0,
                invested: totalamount,
                total: totalamount,
                profit: 0,
                percent: 0
              });
              this.totalInitialLoans = this.totalInitialLoans + initial;
              this.totalLoans = this.totalLoans + totalamount;
            });

            this.isLoansLoaded =  true;
            this.addTotals(this.totalInitialLoans, 0, this.totalLoans);

            this.rowLoansList.push({
              account: 'TOTAL:',
              initialamount: this.totalInitialLoans,
              cash: 0,
              invested: 0,
              total: this.totalLoans,
              profit: 0,
              percent: 0
            });
            this.rowsloans = this.rowLoansList;
          });
        }

        if (this.enabledebts) {
          this.debtSubscription = this.debtService.getRealtimeDebts()
          .subscribe(debtsListSnapshot => {
            this.debtsList = debtsListSnapshot;
            this.rowDebtsList = [];
            this.totalInitialDebts = 0;
            this.totalDebts = 0;

            this.debtsList.forEach(snapDebt => {
              this.debt = snapDebt;
              const initial = this.debt.initialdebt;
              const totalamount = this.debt.balance;

              this.rowDebtsList.push({
                account: this.debt.name,
                initialamount: initial,
                cash: 0,
                invested: totalamount,
                total: totalamount,
                profit: 0,
                percent: 0
              });
              this.totalInitialDebts = this.totalInitialDebts + initial;
              this.totalDebts = this.totalDebts + totalamount;
            });

            this.isDebtsLoaded = true;
            this.addTotals(this.totalInitialDebts, 0, this.totalDebts);

            this.rowDebtsList.push({
              account: 'TOTAL:',
              initialamount: this.totalInitialDebts,
              cash: 0,
              invested: 0,
              total: this.totalDebts,
              profit: 0,
              percent: 0
            });
            this.rowsdebts = this.rowDebtsList;
          });
        }
      });
  }

  forecast() {
    this.navController.navigateForward('/summary/forecast');
  }

  addTotals(
    initial: number,
    cash: number,
    invested: number
  ) {
    if (this.isDebtsLoaded) {
      this.totalInitialTotals = this.totalInitialTotals - initial;
      this.totalInvestedTotals = this.totalInvestedTotals - invested;
      const nettotals = this.totalCashTotals + this.totalInvestedTotals;
      const netprofits = nettotals - this.totalInitialTotals;
      const netpercents = netprofits / this.totalInitialTotals;
      this.rowTotalsList.push({
        account: 'LESS DEBTS:',
        initialamount: initial,
        cash: 0,
        invested: 0,
        total: invested,
        profit: (initial - invested),
        percent: 0
      });
      this.rowTotalsList.push({
        account: 'NET ASSETS:',
        initialamount: this.totalInitialTotals,
        cash: this.totalCashTotals,
        invested: this.totalInvestedTotals,
        total: nettotals,
        profit: netprofits,
        percent: netpercents
      });
      this.rowstotals = this.rowTotalsList;
    } else {
      this.totalInitialTotals = this.totalInitialTotals + initial;
      this.totalCashTotals = this.totalCashTotals + cash;
      this.totalInvestedTotals = this.totalInvestedTotals + invested;
      const totals = this.totalCashTotals + this.totalInvestedTotals;
      const profits = totals - this.totalInitialTotals;
      const percents = profits / this.totalInitialTotals;

      if (this.isLoansLoaded) {
        this.rowTotalsList.push({
          account: 'LOAN ASSETS:',
          initialamount: initial,
          cash: '',
          invested: invested,
          total: invested,
          profit: '',
          percent: ''
        });
        this.rowTotalsList.push({
          account: 'GROSS ASSETS:',
          initialamount: this.totalInitialTotals,
          cash: this.totalCashTotals,
          invested: this.totalInvestedTotals,
          total: totals,
          profit: profits,
          percent: percents,
        });
      } else {
        if (this.isPropertiesLoaded) {
          const initialproperties = initial;
          const investedproperties = invested;
          const propertiesprofits = investedproperties - initialproperties;
          const propertiespercents = propertiesprofits / initialproperties;
          this.rowTotalsList.push({
            account: 'PROPERTY ASSETS:',
            initialamount: initialproperties,
            cash: 0,
            invested: investedproperties,
            total: investedproperties,
            profit: propertiesprofits,
            percent: propertiespercents
          });
        } else {
          if (this.isSavingsLoaded) {
            this.rowTotalsList.push({
              account: 'NON-PROPERTY ASSETS:',
              initialamount: this.totalInitialTotals,
              cash: this.totalCashTotals,
              invested: this.totalInvestedTotals,
              total: totals,
              profit: profits,
              percent: percents
            });
          }
        }
      }
    }
  }

  ionViewWillLeave() {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
    if (this.portfolioSubscription) {
      this.portfolioSubscription.unsubscribe();
    }
    if (this.bondSubscription) {
      this.bondSubscription.unsubscribe();
    }
    if (this.savingsSubscription) {
      this.savingsSubscription.unsubscribe();
    }
    if (this.propertiesSubscription) {
      this.propertiesSubscription.unsubscribe();
    }
    if (this.loanSubscription) {
      this.loanSubscription.unsubscribe();
    }
    if (this.debtSubscription) {
      this.debtSubscription.unsubscribe();
    }
  }
}
