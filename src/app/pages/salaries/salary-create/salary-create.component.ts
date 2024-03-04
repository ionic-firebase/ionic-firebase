import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { SalariesService } from '../../../services/salaries/salaries.service';
import { Salary } from '../../../models/salary';
import { SalariesFormComponent } from '../../../components/salaries-form/salaries-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-salary-create',
  templateUrl: './salary-create.component.html',
  styleUrls: ['./salary-create.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, SalariesFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class SalaryCreateComponent {
  @ViewChild(SalariesFormComponent, { static: false }) salariesForm: SalariesFormComponent;
  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  public salary: Salary = new Salary();
  public toDay: any;
  public fromDate: any;
  public toDate: any;

  constructor(
    private salariesService: SalariesService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private navController: NavController

  ) {}
  ngOnInit() {}

  ionViewWillEnter() {
    this.toDay = new Date().getFullYear();
    this.toDate = `${(this.toDay + 1)}`;
    this.fromDate = `${(this.toDay - 30)}`;
  }

  async createSalary(salary: Salary): Promise<void> {

    try {
      salary.id = '';
      salary.startdate = new Date(salary.startdate).toISOString();
      if (salary.frequency === 'Weekly') {
        salary.grossannualincome = salary.grossincome * 52;
        salary.netannualincome = salary.netincome * 52;
      } else {
        if (salary.frequency === 'Monthly') {
          salary.grossannualincome = salary.grossincome * 12;
          salary.netannualincome = salary.netincome * 12;
        } else {
          if (salary.frequency === 'Quarterly') {
            salary.grossannualincome = salary.grossincome * 4;
            salary.netannualincome = salary.netincome * 4;
          } else {
            salary.grossannualincome = salary.grossincome;
            salary.netannualincome = salary.netincome;
          }
        }
      }
      salary.grossannualincome = Math.round(salary.grossannualincome * 1e2) / 1e2;
      salary.netannualincome = Math.round(salary.netannualincome * 1e2) / 1e2;
      this.salariesService.createSalary(salary).then(id => {
        this.toastService.displayToast('Salary added');
        this.navController.navigateBack('/salaries/salary-list');
      });
    } catch (error) {
      this.salariesForm.handleError(error);
    }
  }
}
