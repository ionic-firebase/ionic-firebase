import { Component, inject, ViewChild, EventEmitter, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../services/user/auth.service';
import { ToastService } from '../../services/toast/toast.service';
import { PortfolioService } from '../../services/portfolio/portfolio.service';
import { SettingsService } from '../../services/settings/settings.service';
import { StockService } from '../../services/stock/stock.service';
import { TrustService } from '../../services/trust/trust.service';
import { BondService } from '../../services/bond/bond.service';
import { BudgetService } from '../../services/budget/budget.service';
import { LoanService } from '../../services/loan/loan.service';
import { DebtService } from '../../services/debt/debt.service';
import { OneoffsService } from '../../services/oneoffs/oneoffs.service';
import { PensionService } from '../../services/pension/pension.service';
import { PropertyService } from '../../services/property/property.service';
import { SalariesService } from '../../services/salaries/salaries.service';
import { SavingsService } from '../../services/savings/savings.service';
import { Reorder } from '../../models/reorder';
import { take } from 'rxjs/operators';
import { Settings } from 'src/app/models/settings';
import { Budget } from '../../models/budget';
import { Year } from '../../models/year';
import { format, parseISO } from 'date-fns';
import { IonDatetime } from '@ionic/angular';
import { PortfolioFormComponent } from '../../components/portfolio-form/portfolio-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, PortfolioFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class SettingsComponent implements OnInit {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  public settings: Settings = new Settings();
  public settingsActive: any;

  public newsettings: Settings = new Settings();
  private settingsId: string;
  public settingsSubscription: any;
  public currentTaxYearId: string;
  public currentTaxYear: string;

  public newTaxYearId: string;
  public items: Array<Reorder>;
  public years: Year[];
  public newtaxyear: Year;
  public copyBudgetsSubscription: any;
  private budgetList: Budget[];

  public copyPortfoliosSubscription: any;
  private portfolioList: any[];

  public copyStocksSubscription: any;
  private stockList: any[];

  public copyTrustsSubscription: any;
  private trustList: any[];

  public copyBondsSubscription: any;
  private bondList: any[];

  public copyLoansSubscription: any;
  private loanList: any[];

  public copyDebtsSubscription: any;
  private debtList: any[];

  public copyOneoffsSubscription: any;
  private oneoffList: any[];

  public copyPensionsSubscription: any;
  private pensionList: any[];

  public copyPropertiesSubscription: any;
  private propertyList: any[];

  public copySalariesSubscription: any;
  private salaryList: any[];

  public copySavingsSubscription: any;
  private savingList: any[];

  public reorder: Reorder;

  public reorderSubscription: any;
  public reorderList: Reorder[];
  public yearsSubscription: any;
  public yearsList: Year[];
  public yearsListId: string;

  private lastTaxYear = '';

  private newReorderCount: number;
  public count: number;

  public fromDate: any;
  public toDate: any;
  public dateValue = format(new Date(), 'yyyy-MM-dd') + 'T09:00:00.000Z';
  public formattedDate = '';
  showPicker = false;


  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private settingsService: SettingsService,
    private budgetService: BudgetService,
    private portfolioService: PortfolioService,
    private stockService: StockService,
    private trustService: TrustService,
    private bondService: BondService,
    private loanService: LoanService,
    private debtService: DebtService,
    private oneoffsService: OneoffsService,
    private pensionService: PensionService,
    private propertyService: PropertyService,
    private salariesService: SalariesService,
    private savingsService: SavingsService,
    private toastService: ToastService,
    private alertCtrl: AlertController,
    private navController: NavController,
    private route: ActivatedRoute,
    private auth: AuthService
  ) { }

  ngOnInit() {
    const toDayYear = new Date().getFullYear();
    this.toDate = `${(toDayYear + 1)}-01-01T11:00`;
    this.fromDate = `${(toDayYear - 5)}-01-01T11:00`;
    this.settings = {
      activeYear: false,
      firstName: 'Viv',
      lastName: 'Bell',
      birthDate: '010 27, 1961',
      taxyear: '2023',
      enablebudgets: false,
      enableupdates: false,
      enableportfolios: false,
      enablebonds: false,
      enablesavings: false,
      enableoneoffs: false,
      enablepensions: false,
      enablesalaries: false,
      enableproperty: false,
      enableloans: false,
      enabledebts: false,
      Y1CPIRate: 0,
      Y2CPIRate: 0,
      Y3CPIRate: 0,
      Y4CPIRate: 0,
      Y5CPIRate: 0,
      Y6CPIRate: 0,
      Y7CPIRate: 0,
      Y8CPIRate: 0,
      Y9CPIRate: 0,
      Y20CPIRate: 0,
      Y30CPIRate: 0,
      dividendRate: 0,
      investmentGrowthRate: 0,
      propertyGrowthRate: 0,
      Y1PensionRate: 0,
      Y2PensionRate: 0,
      Y3PensionRate: 0,
      Y4PensionRate: 0,
      Y5PensionRate: 0,
      Y6PensionRate: 0,
      Y7PensionRate: 0,
      Y8PensionRate: 0,
      Y9PensionRate: 0,
      Y20PensionRate: 0,
      Y30PensionRate: 0,
      ordercount: 0,
    }
    this.loadSettingsVariables();
  }

  ionViewWillEnter() {
    this.yearsSubscription = this.settingsService.getYearsList()
    .pipe()
    .subscribe(yearsListSnapshot => {
      this.years = [];
      this.yearsList = yearsListSnapshot;
      if (this.yearsList != undefined) {
        this.yearsList.forEach(snapYear => {
          this.lastTaxYear = snapYear.taxyear;
          this.years.push({
            id: snapYear.id,
            taxyear: snapYear.taxyear
          });
        });
        let i = +this.lastTaxYear;
        i++;
        this.lastTaxYear = `${i}`;
        this.years.push({
          id: 'new',
          taxyear: this.lastTaxYear
        });
      }
    });
      
    this.reorderSubscription = this.settingsService.getReorderList()
    .pipe()
    .subscribe(reorderListSnapshot => {
      this.items = [];
      this.reorderList = reorderListSnapshot;
      if (this.reorderList) {
        this.reorderList.forEach(snapReorder => {
          this.items.push({
            id: snapReorder.id,
            name: snapReorder.name,
            type: snapReorder.type,
            itemid: snapReorder.itemid,
            order: snapReorder.order,
            initialvalue: 0,
            ongoingvalue: 0
          });
        });
      }
    });
  }

  reorderItems(event: any) {
    this.count = 0;
    const itemMove = this.items.splice(event.detail.from, 1)[0];
    this.items.splice(event.detail.to, 0, itemMove);
    this.items.forEach(item => {
      this.settingsService.updateReorderOrder(item.id, this.count);
      this.count = this.count + 1;
    });
    this.settingsService.updateOrderCount(this.count);
    this.count = 0;
    event.detail.complete();
  }

  loadSettingsVariables() {
    this.settingsSubscription = this.settingsService.getSettingsActive()
    .pipe(take(1))
    .subscribe(settings => {
      this.settingsActive = settings[0];
      this.settings = settings[0];
      if(this.settingsActive != undefined) {
        this.formattedDate = format(parseISO(this.settings.birthDate), 'MMM d, yyyy');
        this.auth.updateTaxYear(this.settingsActive.id).then(res => {
        });
        this.currentTaxYearId = this.settingsActive.id;
        this.currentTaxYear = this.settingsActive.taxyear;
      }
    });
  }

  async updateFirstName(firstName: string): Promise<void> {
    try {
      if (firstName === undefined) {
        return;
      }
      this.settingsService.updateFirstName(firstName);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateLastName(lastName: string): Promise<void> {
    try {
      if (lastName === undefined) {
        return;
      }
      this.settingsService.updateLastName(lastName);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateDOB(birthDate: string): Promise<void> {
    try {
      if (birthDate === undefined) {
        return;
      }
      this.dateValue = birthDate;
      this.formattedDate = format(parseISO(birthDate), 'MMM d, yyyy');
      this.showPicker = false;
      this.settingsService.updateDOB(birthDate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateTaxYear(taxYearComposite: string, settings: Settings): Promise<void> {
    try {
      const splitted = taxYearComposite.split(':');
      const taxYear = splitted[0];
      const newTaxYearId = splitted[1];
      settings.taxyear = taxYear;
      if (newTaxYearId === undefined || newTaxYearId === this.currentTaxYearId) {
        return;
      }

      if ( newTaxYearId === 'new' ) {
//      disable current activeYear
        this.settingsService.disableActiveYear(this.settingsActive.id).then(res => {
          settings.ordercount = 0;
          this.settingsService.createTaxYear(taxYear, settings).then(createnewtaxyear => {
            this.newTaxYearId = createnewtaxyear.id;
            this.transferBudgets(this.currentTaxYearId, this.newTaxYearId);
            this.transferPortfolios(this.currentTaxYearId, this.newTaxYearId);
            this.transferBonds(this.currentTaxYearId, this.newTaxYearId);
            this.transferLoans(this.currentTaxYearId, this.newTaxYearId);
            this.transferDebts(this.currentTaxYearId, this.newTaxYearId);
            this.transferOneoffs(this.currentTaxYearId, this.newTaxYearId);
            this.transferPensions(this.currentTaxYearId, this.newTaxYearId);
            this.transferProperties(this.currentTaxYearId, this.newTaxYearId);
            this.transferSalaries(this.currentTaxYearId, this.newTaxYearId);
            this.transferSavings(this.currentTaxYearId, this.newTaxYearId);
            this.settingsService.updateTaxYear(this.newTaxYearId);
            this.settingsService.enableActiveYear(this.newTaxYearId).then(res => {
              this.settingsActive.id = this.newTaxYearId;
              this.navController.navigateBack(`/home`);
            });
          });
        });
      } else {
        this.settingsService.disableActiveYear(this.settingsActive.id).then(res => {
          this.settingsService.updateTaxYear(newTaxYearId).then(res1 => {
            this.settingsService.enableActiveYear(newTaxYearId).then(res => {
              if (this.settingsSubscription) {
                this.settingsSubscription.unsubscribe();
              }
              this.loadSettingsVariables();
              this.navController.navigateBack(`/home`);
            });
          });
        });
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async enableBudgets(budgets: boolean): Promise<void> {
    try {
      if (budgets === undefined) {
        return;
      }
      this.settingsService.enableBudgets(budgets);
    } catch (error) {
      this.handleError(error);
    }
  }

  async enableUpdates(updates: boolean): Promise<void> {
    try {
      if (updates === undefined) {
        return;
      }
      this.settingsService.enableUpdates(updates);
    } catch (error) {
      this.handleError(error);
    }
  }

  async enablePortfolios(portfolios: boolean): Promise<void> {
    try {
      if (portfolios === undefined) {
        return;
      }
      this.settingsService.enablePortfolios(portfolios);
    } catch (error) {
      this.handleError(error);
    }
  }

  async enableBonds(bonds: boolean): Promise<void> {
    try {
      if (bonds === undefined) {
        return;
      }
      this.settingsService.enableBonds(bonds);
    } catch (error) {
      this.handleError(error);
    }
  }

  async enableSavings(savings: boolean): Promise<void> {
    try {
      if (savings === undefined) {
        return;
      }
      this.settingsService.enableSavings(savings);
    } catch (error) {
      this.handleError(error);
    }
  }

  async enableOneoffs(oneoffs: boolean): Promise<void> {
    try {
      if (oneoffs === undefined) {
        return;
      }
      this.settingsService.enableOneoffs(oneoffs);
    } catch (error) {
      this.handleError(error);
    }
  }

  async enablePensions(pensions: boolean): Promise<void> {
    try {
      if (pensions === undefined) {
        return;
      }
      this.settingsService.enablePensions(pensions);
    } catch (error) {
      this.handleError(error);
    }
  }

  async enableSalaries(salaries: boolean): Promise<void> {
    try {
      if (salaries === undefined) {
        return;
      }
      this.settingsService.enableSalaries(salaries);
    } catch (error) {
      this.handleError(error);
    }
  }

  async enableProperty(property: boolean): Promise<void> {
    try {
      if (property === undefined) {
        return;
      }
      this.settingsService.enableProperty(property);
    } catch (error) {
      this.handleError(error);
    }
  }

  async enableLoans(loans: boolean): Promise<void> {
    try {
      if (loans === undefined) {
        return;
      }
      this.settingsService.enableLoans(loans);
    } catch (error) {
      this.handleError(error);
    }
  }

  async enableDebts(debts: boolean): Promise<void> {
    try {
      if (debts === undefined) {
        return;
      }
      this.settingsService.enableDebts(debts);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY1CPIRate(Y1CPIRate: number): Promise<void> {
    try {
      if (Y1CPIRate === undefined) {
        return;
      }
      this.settingsService.updateY1CPIRate(Y1CPIRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY2CPIRate(Y2CPIRate: number): Promise<void> {
    try {
      if (Y2CPIRate === undefined) {
        return;
      }
      this.settingsService.updateY2CPIRate(Y2CPIRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY3CPIRate(Y3CPIRate: number): Promise<void> {
    try {
      if (Y3CPIRate === undefined) {
        return;
      }
      this.settingsService.updateY3CPIRate(Y3CPIRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY4CPIRate(Y4CPIRate: number): Promise<void> {
    try {
      if (Y4CPIRate === undefined) {
        return;
      }
      this.settingsService.updateY4CPIRate(Y4CPIRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY5CPIRate(Y5CPIRate: number): Promise<void> {
    try {
      if (Y5CPIRate === undefined) {
        return;
      }
      this.settingsService.updateY5CPIRate(Y5CPIRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY6CPIRate(Y6CPIRate: number): Promise<void> {
    try {
      if (Y6CPIRate === undefined) {
        return;
      }
      this.settingsService.updateY6CPIRate(Y6CPIRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY7CPIRate(Y7CPIRate: number): Promise<void> {
    try {
      if (Y7CPIRate === undefined) {
        return;
      }
      this.settingsService.updateY7CPIRate(Y7CPIRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY8CPIRate(Y8CPIRate: number): Promise<void> {
    try {
      if (Y8CPIRate === undefined) {
        return;
      }
      this.settingsService.updateY8CPIRate(Y8CPIRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY9CPIRate(Y9CPIRate: number): Promise<void> {
    try {
      if (Y9CPIRate === undefined) {
        return;
      }
      this.settingsService.updateY9CPIRate(Y9CPIRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY20CPIRate(twentyYearRate: number): Promise<void> {
    try {
      if (twentyYearRate === undefined) {
        return;
      }
      this.settingsService.updateY20CPIRate(twentyYearRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY30CPIRate(thirtyYearRate: number): Promise<void> {
    try {
      if (thirtyYearRate === undefined) {
        return;
      }
      this.settingsService.updateY30CPIRate(thirtyYearRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateDividendRate(dividendRate: number): Promise<void> {
    try {
      if (dividendRate === undefined) {
        return;
      }
      this.settingsService.updateDividendRate(dividendRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateInvestmentGrowthRate(investmentGrowthRate: number): Promise<void> {
    try {
      if (investmentGrowthRate === undefined) {
        return;
      }
      this.settingsService.updateInvestmentGrowthRate(investmentGrowthRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updatePropertyGrowthRate(propertyGrowthRate: number): Promise<void> {
    try {
      if (propertyGrowthRate === undefined) {
        return;
      }
      this.settingsService.updatePropertyGrowthRate(propertyGrowthRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY1PensionRate(Y1PensionRate: number): Promise<void> {
    try {
      if (Y1PensionRate === undefined) {
        return;
      }
      this.settingsService.updateY1PensionRate(Y1PensionRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY2PensionRate(Y2PensionRate: number): Promise<void> {
    try {
      if (Y2PensionRate === undefined) {
        return;
      }
      this.settingsService.updateY2PensionRate(Y2PensionRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY3PensionRate(Y3PensionRate: number): Promise<void> {
    try {
      if (Y3PensionRate === undefined) {
        return;
      }
      this.settingsService.updateY3PensionRate(Y3PensionRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY4PensionRate(Y4PensionRate: number): Promise<void> {
    try {
      if (Y4PensionRate === undefined) {
        return;
      }
      this.settingsService.updateY4PensionRate(Y4PensionRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY5PensionRate(Y5PensionRate: number): Promise<void> {
    try {
      if (Y5PensionRate === undefined) {
        return;
      }
      this.settingsService.updateY5PensionRate(Y5PensionRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY6PensionRate(Y6PensionRate: number): Promise<void> {
    try {
      if (Y6PensionRate === undefined) {
        return;
      }
      this.settingsService.updateY6PensionRate(Y6PensionRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY7PensionRate(Y7PensionRate: number): Promise<void> {
    try {
      if (Y7PensionRate === undefined) {
        return;
      }
      this.settingsService.updateY7PensionRate(Y7PensionRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY8PensionRate(Y8PensionRate: number): Promise<void> {
    try {
      if (Y8PensionRate === undefined) {
        return;
      }
      this.settingsService.updateY8PensionRate(Y8PensionRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY9PensionRate(Y9PensionRate: number): Promise<void> {
    try {
      if (Y9PensionRate === undefined) {
        return;
      }
      this.settingsService.updateY9PensionRate(Y9PensionRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY20PensionRate(Y20PensionRate: number): Promise<void> {
    try {
      if (Y20PensionRate === undefined) {
        return;
      }
      this.settingsService.updateY20PensionRate(Y20PensionRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateY30PensionRate(Y30PensionRate: number): Promise<void> {
    try {
      if (Y30PensionRate === undefined) {
        return;
      }
      this.settingsService.updateY30PensionRate(Y30PensionRate);
    } catch (error) {
      this.handleError(error);
    }
  }

  async transferBudgets(
    copyTaxYearId: string,
    newTaxYearId: string
  ) {
    const alert =  await this.alertCtrl.create({
      message: `Transfer budgets?`,
      buttons: [
        {
          text: 'No',
          role: 'No',
          handler: blah => {
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.copyBudgetsSubscription = this.budgetService.getCopyBudgets(copyTaxYearId)
            .pipe(take(1))
            .subscribe(budgets => {
              this.budgetList = budgets;
              if(this.budgetList != undefined) {
                budgets.forEach(budget => {
                  this.budgetService.createBudgetById(newTaxYearId, budget);

                });
              }
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async transferPortfolios(
    copyTaxYearKey: string,
    newTaxYearId: string
  ) {
    const alert =  await this.alertCtrl.create({
      message: `Transfer portfolios?`,
      buttons: [
        {
          text: 'No',
          role: 'No',
          handler: blah => {
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.copyPortfoliosSubscription = this.portfolioService.getCopyPortfolios(copyTaxYearKey)
            .pipe()
            .subscribe(portfolios => {
              this.portfolioList = portfolios;
              if( this.portfolioList != undefined) {
                this.portfolioList.forEach(portfolio => {
                  portfolio.initialstocksbalance = portfolio.stockbalance;
                  portfolio.initialtrustsbalance = portfolio.trustbalance;
                  portfolio.initialcash = portfolio.cashbalance;
                  const copyPortfolioId = portfolio.id;
                  this.newReorderCount++;
                  this.portfolioService.createPortfolioById(newTaxYearId, portfolio).then(createportfolio => {
                    this.reorder = {
                      id: '',
                      name: portfolio.name,
                      type: 'Portfolio',
                      itemid: createportfolio.id,
                      order: this.newReorderCount,
                      initialvalue: 0,
                      ongoingvalue: 0
                    };
                    this.settingsService.createReorder(this.reorder);
                    this.settingsService.updateOrderCount(this.newReorderCount);
                    this.copyStocksSubscription = this.stockService.getCopyStocksList(copyPortfolioId, copyTaxYearKey)
                    .pipe(take(1))
                    .subscribe(stocks => {
                      this.stockList = stocks;
                      if(this.stockList != undefined) {
                        stocks.forEach(stock => {
                          stock.parentid = createportfolio.id;
                          this.stockService.createStock(stock);
                        });
                      }
                    });
  
                    this.copyTrustsSubscription = this.trustService.getCopyTrustsList(copyPortfolioId, copyTaxYearKey)
                    .pipe(take(1))
                    .subscribe(trusts => {
                      this.trustList = trusts;
                      if(this.trustList != undefined) {
                        trusts.forEach(trust => {
                          trust.parentid = createportfolio.id;
                          this.trustService.createTrust(trust);
                        });
                      }
                    });
                  });
                });
              }
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async transferBonds(
    copyTaxYearId: string,
    newTaxYearId: string
  ) {
    const alert =  await this.alertCtrl.create({
      message: `Transfer bonds?`,
      buttons: [
        {
          text: 'No',
          role: 'No',
          handler: blah => {
          },
        },
        {
          text: 'Yes',
          handler: () => {

            this.copyBondsSubscription = this.bondService.getCopyBonds(copyTaxYearId)
            .pipe(take(1))
            .subscribe(bonds => {
              this.bondList = bonds;
              if(this.bondList != undefined) {
                this.bondList.forEach(bond => {
                  bond.initialcash = bond.balance;
                  this.newReorderCount++;
                  this.bondService.createBondById(newTaxYearId, bond).then(createbond => {
                    this.reorder = {
                      id: '',
                      name: bond.name,
                      type: 'Bond',
                      itemid: createbond.id,
                      order: this.newReorderCount,
                      initialvalue: 0,
                      ongoingvalue: 0
                    };
                    this.settingsService.createReorder(this.reorder);
                    this.settingsService.updateOrderCount(this.newReorderCount);
                  });
                });
              }
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async transferLoans(
    copyTaxYearId: string,
    newTaxYearId: string
  ) {
    const alert =  await this.alertCtrl.create({
      message: `Transfer loans?`,
      buttons: [
        {
          text: 'No',
          role: 'No',
          handler: blah => {
          },
        },
        {
          text: 'Yes',
          handler: () => {

            this.copyLoansSubscription = this.loanService.getCopyLoans(copyTaxYearId)
            .pipe(take(1))
            .subscribe(loans => {
              this.loanList = loans;
              if(this.loanList != undefined) {
                loans.forEach(loan => {
                  this.loanService.createLoanById(newTaxYearId, loan);
                });
              }
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async transferDebts(
    copyTaxYearId: string,
    newTaxYearId: string
  ) {
    const alert =  await this.alertCtrl.create({
      message: `Transfer debts?`,
      buttons: [
        {
          text: 'No',
          role: 'No',
          handler: blah => {
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.copyDebtsSubscription = this.debtService.getCopyDebts(copyTaxYearId)
            .pipe(take(1))
            .subscribe(debts => {
              this.debtList = debts;
              if(this.debtList != undefined) {
                debts.forEach(debt => {
                  this.debtService.createDebtById(newTaxYearId, debt);
                });
              }
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async transferOneoffs(
    copyTaxYearId: string,
    newTaxYearId: string
  ) {
    const alert =  await this.alertCtrl.create({
      message: `Transfer oneoffs?`,
      buttons: [
        {
          text: 'No',
          role: 'No',
          handler: blah => {
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.copyOneoffsSubscription = this.oneoffsService.getCopyOneoffs(copyTaxYearId)
            .pipe(take(1))
            .subscribe(oneoffs => {
              this.oneoffList = oneoffs;
              oneoffs.forEach(oneoff => {
                this.oneoffsService.createOneoffById(newTaxYearId, oneoff);
              });
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async transferPensions(
    copyTaxYearId: string,
    newTaxYearId: string
  ) {
    const alert =  await this.alertCtrl.create({
      message: `Transfer pensions?`,
      buttons: [
        {
          text: 'No',
          role: 'No',
          handler: blah => {
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.copyPensionsSubscription = this.pensionService.getCopyPensions(copyTaxYearId)
            .pipe(take(1))
            .subscribe(pensions => {
              this.pensionList = pensions;
              if(this.pensionList != undefined) {
                pensions.forEach(pension => {
                  this.pensionService.createPensionById(newTaxYearId, pension);
                });
              }
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async transferProperties(
    copyTaxYearId: string,
    newTaxYearId: string
  ) {
    const alert =  await this.alertCtrl.create({
      message: `Transfer Properties?`,
      buttons: [
        {
          text: 'No',
          role: 'No',
          handler: blah => {
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.copyPropertiesSubscription = this.propertyService.getcopyProperties(copyTaxYearId)
            .pipe(take(1))
            .subscribe(properties => {
              this.propertyList = properties;
              properties.forEach(property => {
                property.initialcash = property.currentcashbalance;
                this.newReorderCount++;
                this.propertyService.createPropertyById(newTaxYearId, property).then(createproperty => {
                  this.reorder = {
                    id: '',
                    name: property.name,
                    type: 'Property',
                    itemid: createproperty.id,
                    order: this.newReorderCount,
                    initialvalue: 0,
                    ongoingvalue: 0
                  };
                  this.settingsService.createReorder(this.reorder);
                  this.settingsService.updateOrderCount(this.newReorderCount);
                });
              });
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async transferSalaries(
    copyTaxYearId: string,
    newTaxYearId: string
  ) {
    const alert =  await this.alertCtrl.create({
      message: `Transfer Salaries?`,
      buttons: [
        {
          text: 'No',
          role: 'No',
          handler: blah => {
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.copySalariesSubscription = this.salariesService.getCopySalaries(copyTaxYearId)
            .pipe(take(1))
            .subscribe(salaries => {
              this.salaryList = salaries;
              if(this.salaryList != undefined) {
                salaries.forEach(salary => {
                  this.salariesService.createSalaryById(newTaxYearId, salary);
                });
              }
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async transferSavings(
    copyTaxYearId: string,
    newTaxYearId: string
  ) {
    const alert =  await this.alertCtrl.create({
      message: `Transfer Savings?`,
      buttons: [
        {
          text: 'No',
          role: 'No',
          handler: blah => {
          },
        },
        {
          text: 'Yes',
          handler: () => {
            this.copySavingsSubscription = this.savingsService.getCopySavings(copyTaxYearId)
            .pipe(take(1))
            .subscribe(savings => {
              this.savingList = savings;
              if(this.savingList != undefined) {
                this.savingList.forEach(saving => {
                  this.newReorderCount ++;
                  saving.initialcash = saving.balance;
                  this.savingsService.createSavingById(newTaxYearId, saving).then(createsavings => {
                    this.reorder = {
                      id: '',
                      name: saving.name,
                      type: 'Savings',
                      itemid: createsavings.id,
                      order: this.newReorderCount,
                      initialvalue: 0,
                      ongoingvalue: 0
                    };
                    this.settingsService.createReorder(this.reorder);
                    this.settingsService.updateOrderCount(this.newReorderCount);
                  });
                });
              }
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async handleError(error: any): Promise<void> {
    const alert = await this.alertCtrl.create({
      message: error.message,
      buttons: [{ text: 'Ok', role: 'cancel' }]
    });
    await alert.present();
  }

  ionViewWillLeave() {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
    if (this.reorderSubscription) {
      this.reorderSubscription.unsubscribe();
    }
    if (this.yearsSubscription) {
      this.yearsSubscription.unsubscribe();
    }
    if (this.copyBudgetsSubscription) {
      this.copyBudgetsSubscription.unsubscribe();
    }
    if (this.copyPortfoliosSubscription) {
      this.copyPortfoliosSubscription.unsubscribe();
    }
    if (this.copyStocksSubscription) {
      this.copyStocksSubscription.unsubscribe();
    }
    if (this.copyTrustsSubscription) {
      this.copyTrustsSubscription.unsubscribe();
    }
    if (this.copyBondsSubscription) {
      this.copyBondsSubscription.unsubscribe();
    }
    if (this.copyLoansSubscription) {
      this.copyLoansSubscription.unsubscribe();
    }
    if (this.copyDebtsSubscription) {
      this.copyDebtsSubscription.unsubscribe();
    }
    if (this.copyOneoffsSubscription) {
      this.copyOneoffsSubscription.unsubscribe();
    }
    if (this.copyPensionsSubscription) {
      this.copyPensionsSubscription.unsubscribe();
    }
    if (this.copyPropertiesSubscription) {
      this.copyPropertiesSubscription.unsubscribe();
    }
    if (this.copySalariesSubscription) {
      this.copySalariesSubscription.unsubscribe();
    }
    if (this.copySavingsSubscription) {
      this.copySavingsSubscription.unsubscribe();
    }
  }
}
