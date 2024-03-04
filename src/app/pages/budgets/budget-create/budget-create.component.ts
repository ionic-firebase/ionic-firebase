import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { BudgetService } from '../../../services/budget/budget.service';
import { Budget } from '../../../models/budget';
import { BudgetFormComponent } from '../../../components/budget-form/budget-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-budget-create',
  templateUrl: './budget-create.component.html',
  styleUrls: ['./budget-create.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, BudgetFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class BudgetCreateComponent {
  @ViewChild(BudgetFormComponent, { static: false }) budgetForm: BudgetFormComponent;
  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  public budget: Budget = new Budget();
  public submitted = false;
  public budgetType: any;
  public budgetAnnual: number;
  private taxYearId: string;
  constructor(
    private budgetService: BudgetService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private navController: NavController

  ) {}
  ngOnInit() {}

  ionViewWillEnter() {
    this.budgetType = this.route.snapshot.paramMap.get('id');
  }

  async createBudget(budget: Budget): Promise<void> {
    try {
      budget.id = '';
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
      budget.type = this.budgetType;
      this.budgetService.createBudget(budget).then(res => {
        this.toastService.displayToast('Budget item added');
        this.navController.navigateForward('/budgets/budget-list');
      });
    } catch (error) {
      this.budgetForm.handleError(error);
    }
  }
}
