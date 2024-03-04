import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { BudgetService } from '../../../services/budget/budget.service';
import { Budget } from '../../../models/budget';
import { BudgetFormComponent } from '../../../components/budget-form/budget-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-budget-update',
  templateUrl: './budget-update.component.html',
  styleUrls: ['./budget-update.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, BudgetFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class BudgetUpdateComponent {
  @ViewChild(BudgetFormComponent, { static: false }) budgetForm: BudgetFormComponent;

  public budgetId: string;

  currentBudget$: Observable<Budget> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.budgetId = params['id'];
      return this.budgetService.getBudget(params['id']);
    })
  );

  budget: Budget = new Budget();
  budgetType: string;

  private budgetSubscription: any;

  private readonly AuthService = inject(AuthService);
  private readonly user$ = this.AuthService.getUser();

  constructor(
    private budgetService: BudgetService,
    private toastService: ToastService,
    private navController: NavController,
    private route: ActivatedRoute
  ) { }

  ionViewWillEnter() {
    this.budgetSubscription = this.currentBudget$.pipe()
    .subscribe((budget: Budget) => {
      this.budgetType = budget.type;
      this.budgetForm.onBudgetRetrieved(budget);
    });
  }

  async updateBudget(budget: Budget): Promise<void> {

    try {
      budget.id = this.budgetId;
      budget.type = this.budgetType;
      if (budget.frequency === 'Weekly') {
        budget.annual = budget.amount * 52;
      } else {
        if (budget.frequency === 'Monthly') {
          budget.annual = budget.amount * 12;
        } else {
          if (budget.frequency === 'Quarterly') {
            budget.annual = budget.amount * 4;
          } else {
            budget.annual = budget.amount;
          }
        }
      }
      budget.annual = Math.round(budget.annual * 1e2) / 1e2;
      this.budgetService.updateBudget(this.budgetId, budget).then(res => {
        this.toastService.displayToast('Budget item updated');
        this.navController.navigateBack('/budgets/budget-list');
      });
    } catch (error) {
      this.budgetForm.handleError(error);
    }
  }

  ionViewWillLeave() {
    if (this.budgetSubscription) {
      this.budgetSubscription.unsubscribe();
    }
  }
}
