import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { PortfolioService } from '../../../services/portfolio/portfolio.service';
import { Portfolio } from '../../../models/portfolio';
import { PortfolioFormComponent } from '../../../components/portfolio-form/portfolio-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-portfolio-update',
  templateUrl: './portfolio-update.component.html',
  styleUrls: ['./portfolio-update.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, PortfolioFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class PortfolioUpdateComponent {
  @ViewChild(PortfolioFormComponent, { static: false }) portfolioForm: PortfolioFormComponent;

  public portfolioId: string;

  currentPortfolio$: Observable<Portfolio> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.portfolioId = params['id'];
      return this.portfolioService.getPortfolio(params['id']);
    })
  );

  public portfolio: Portfolio;
  public portfolioOrigInitialCash: number;
  public portfolioOrigCashBalance: number;
  public portfolioType: string;
  public portfolioAnnual: number;
  public toDay: any;
  public fromDate: any;
  public toDate: any;

  public portfoliosSubscription: any;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private portfolioService: PortfolioService,
    private toastService: ToastService,
    private navController: NavController,
    private route: ActivatedRoute
  ) {}

  ionViewWillEnter() {
    this.toDay = new Date().getFullYear();
    this.toDate = `${(this.toDay + 1)}`;
    this.fromDate = `${(this.toDay - 5)}`;
    this.portfoliosSubscription = this.currentPortfolio$.pipe()
    .subscribe((portfolio: Portfolio) => {
      this.portfolio = portfolio;
      if(this.portfolio != undefined) {
        this.portfolioForm.onPortfolioRetrieved(portfolio);
      }
    });
  }

  async updatePortfolio(portfolio: Portfolio): Promise<void> {
    try {
      portfolio.id = this.portfolioId;
      portfolio.date = new Date(portfolio.date).toISOString();
      this.portfolioService.updatePortfolio(this.portfolioId, portfolio).then(res => {
        this.toastService.displayToast('Portfolio account updated');
        this.navController.navigateBack('/portfolios/portfolio-list');
      });
    } catch (error) {
      this.portfolioForm.handleError(error);
    }
  }

  ionViewWDidLeave() {

    if (this.portfoliosSubscription) {
      this.portfoliosSubscription.unsubscribe();
    }
  }
}
