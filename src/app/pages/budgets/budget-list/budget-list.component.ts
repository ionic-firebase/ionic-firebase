import { Component, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { BudgetService } from '../../../services/budget/budget.service';
import { Budget } from '../../../models/budget';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ToastService } from '../../../services/toast/toast.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-budget-list',
  templateUrl: './budget-list.component.html',
  styleUrls: ['./budget-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class BudgetListComponent  implements OnInit {
  slideOpts = {
    initialSlide: 0,
    speed: 300,
    shortSwipes: true
  };

  budgetList: Budget[];
  budgetMandatoryList: Budget[];
  budgetOngoingList: Budget[];
  budgetLuxuryList: Budget[];
  budgetMandatory: number;
  budgetOngoing: number;
  budgetLuxury: number;
  budgetTotal: number;
  private budgetSubscription: any;
  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private budgetService: BudgetService,
    private toastService: ToastService,
    private actionCtrl: ActionSheetController,
    private alertController: AlertController,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.budgetSubscription = this.budgetService.getRealtimeBudgets()
    .pipe(take(1))
    .subscribe((budgets: Budget[]) => {
      this.budgetMandatory = 0;
      this.budgetOngoing = 0;
      this.budgetLuxury = 0;
      this.budgetTotal = 0;
      this.budgetMandatoryList = [];
      this.budgetOngoingList = [];
      this.budgetLuxuryList = [];
      this.budgetList = budgets;
      if (this.budgetList) {
        this.budgetList.forEach(budget => {
          const temp: number = + budget.annual;
          this.budgetTotal = this.budgetTotal + temp;
          if (budget.type === 'Mandatory') {
            this.budgetMandatoryList.push(budget);
            const tempMandatory: number = + budget.annual;
            this.budgetMandatory = this.budgetMandatory + tempMandatory;
          }
          if (budget.type === 'Ongoing') {
            this.budgetOngoingList.push(budget);
            const tempOngoing: number = + budget.annual;
            this.budgetOngoing = this.budgetOngoing + tempOngoing;
          }
          if (budget.type === 'Luxury') {
            this.budgetLuxuryList.push(budget);
            const tempLuxury: number = + budget.annual;
            this.budgetLuxury = this.budgetLuxury + tempLuxury;
          }
        });
      }
    });
  }

  addBudget(
    budgetType: string,
  ) {
    this.navController.navigateForward(`/budgets/budget-create/${budgetType}`);
  }

  async deleteBudget(
    budgetId: string,
  ) {
    const alert = await this.alertController.create({
      message: `Delete budget item?`,
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
            this.budgetService.deleteBudget(budgetId)
            .then(() => {
              this.toastService.displayToast('Budget item deleted');
              this.navController.navigateForward('/budgets/budget-list');
            });
          },
        },
      ],
    });

    await alert.present();
  }

  openMenu(id: string) {
    this.actionCtrl.create({
      buttons: [
        {
          text: 'Edit Budget',
          handler: () => {
            this.navController.navigateForward(`/budgets/budget-update/${id}`);
          }
        },
        {
          text: 'Delete Budget',
          handler: () => {
            this.deleteBudget(id);
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
    if (this.budgetSubscription) {
      this.budgetSubscription.unsubscribe();
    }
  }
}
