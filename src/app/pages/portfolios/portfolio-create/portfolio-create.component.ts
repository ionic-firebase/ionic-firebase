import { Component, inject, ViewChild } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { PortfolioService } from '../../../services/portfolio/portfolio.service';
import { Portfolio } from '../../../models/portfolio';
import { SettingsService } from '../../../services/settings/settings.service';
import { Reorder } from '../../../models/reorder';
import { Settings } from 'src/app/models/settings';
import { PortfolioFormComponent } from '../../../components/portfolio-form/portfolio-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { take} from 'rxjs/operators';

@Component({
  selector: 'app-portfolio-create',
  templateUrl: './portfolio-create.component.html',
  styleUrls: ['./portfolio-create.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, PortfolioFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class PortfolioCreateComponent {
  @ViewChild(PortfolioFormComponent, { static: false }) portfolioForm: PortfolioFormComponent;
  public portfolio: Portfolio = new Portfolio();
  public portfolioType: string;
  public reorder: Reorder;
  public ordercount: number;
  public settingsSubscription: any;
  settings: Settings = new Settings();
  public toDay: any;
  public fromDate: any;
  public toDate: any;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private portfolioService: PortfolioService,
    private settingsService: SettingsService,
    private toastService: ToastService,
    private navController: NavController
  ) {
  }


  ionViewWillEnter() {
    this.toDay = new Date().getFullYear();
    this.toDate = `${(this.toDay + 1)}`;
    this.fromDate = `${(this.toDay - 5)}`;
    this.settingsSubscription = this.settingsService.getSettings()
    .pipe(take(1))
    .subscribe(settings => {
    this.settings = settings;
    });
  }

  async createPortfolio(portfolio: Portfolio): Promise<void> {
    try {
      portfolio.stocksbalance = 0;
      portfolio.trustsbalance = 0;
      portfolio.balance = portfolio.initialcash;
      portfolio.date = new Date(portfolio.date).toISOString();
      this.portfolioService.createPortfolio(portfolio).then(portfolioId => {
        this.reorder = {
          id: '',
          name: portfolio.name,
          type: `${portfolio.taxable}`,
          itemid: portfolioId.id,
          order: this.settings.ordercount,
          initialvalue: 0,
          ongoingvalue: 0
        };

        this.settingsService.createReorder(this.reorder);
        const ordercount = this.settings.ordercount + 1;
        this.settingsService.updateOrderCount(ordercount);
        this.toastService.displayToast('Portfolio account added');
        this.navController.navigateBack('/portfolios/portfolio-list');
      });
    } catch (error) {
      this.portfolioForm.handleError(error);
    }
  }

  ionViewWDidLeave() {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }
}
