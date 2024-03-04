import { Component, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { SalariesService } from '../../../services/salaries/salaries.service';
import { Salary } from '../../../models/salary';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ToastService } from '../../../services/toast/toast.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-salary-list',
  templateUrl: './salary-list.component.html',
  styleUrls: ['./salary-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class SalaryListComponent  implements OnInit {
  salaryList: Salary[];
  salary: Salary;

  salaryGrossIncomeTotal: number;
  salaryNetIncomeTotal: number;

  private salariesSubscription: any;
  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private salariesService: SalariesService,
    private toastService: ToastService,
    private actionCtrl: ActionSheetController,
    private alertController: AlertController,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.salariesSubscription = this.salariesService.getRealtimeSalaries()
    .subscribe((salaries: Salary[]) => {
      this.salaryGrossIncomeTotal = 0;
      this.salaryNetIncomeTotal = 0;
      this.salaryList = salaries;
      if (this.salaryList) {
        this.salaryList.forEach((salary: Salary) => {
          this.salary = salary;
          this.salaryGrossIncomeTotal = this.salaryGrossIncomeTotal + salary.grossannualincome;
          this.salaryNetIncomeTotal = this.salaryNetIncomeTotal + salary.netannualincome;
        });
      }
    });
  }

  createSalary() {
    this.navController.navigateForward('/salaries/salary-create');
  }

  async deleteSalaryItem(
    salaryId: string,
  ) {
    const alert = await this.alertController.create({
      message: `Delete salary?`,
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
            this.salariesService.deleteSalary(salaryId)
            .then(() => {
              this.toastService.displayToast('Salary deleted.');
              this.navController.navigateBack(`/salaries/salary-list`);
            });
          },
        },
      ],
    });

    await alert.present();
  }

  openMenu(
    id: string,
    name: string
  ) {
    this.actionCtrl.create({
      buttons: [
        {
          text: 'Edit Salary',
          handler: () => {
            this.navController.navigateForward(`/salaries/salary-update/${id}`);
          }
        },
        {
          text: 'Delete Salary',
          handler: () => {
            this.deleteSalaryItem(id);
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
    if (this.salariesSubscription) {
      this.salariesSubscription.unsubscribe();
    }
  }
}
