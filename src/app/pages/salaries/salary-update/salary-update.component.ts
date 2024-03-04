import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { SalariesService } from '../../../services/salaries/salaries.service';
import { Salary } from '../../../models/salary';
import { SalariesFormComponent } from '../../../components/salaries-form/salaries-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-salary-update',
  templateUrl: './salary-update.component.html',
  styleUrls: ['./salary-update.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, SalariesFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class SalaryUpdateComponent {
  @ViewChild(SalariesFormComponent, { static: false }) salariesForm: SalariesFormComponent;

  salaryId: string;

  currentSalary$: Observable<Salary> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.salaryId = params['id'];
      return this.salariesService.getSalary(params['id']);
    })
  );

  public salaryGrossAnnualIncome: number;
  public salaryNetAnnualIncome: number;
  public salary: Salary = new Salary();

  public toDay: any;
  public fromDate: any;
  public toDate: any;

  private salarySubscription: any;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private salariesService: SalariesService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {

    this.toDay = new Date().getFullYear();
    this.toDate = `${(this.toDay + 1)}`;
    this.fromDate = `${(this.toDay - 30)}`;
    this.salarySubscription = this.currentSalary$.pipe()
    .subscribe((salary: Salary) => {
    this.salaryGrossAnnualIncome = salary.grossannualincome;
    this.salaryNetAnnualIncome = salary.netannualincome;
    this.salariesForm.onSalaryRetrieved(salary);
    });
  }

  async updateSalary(salary: Salary): Promise<void> {
    try {
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
      this.salariesService.updateSalary(this.salaryId, salary).then(key => {
        this.toastService.displayToast('Salary updated');
        this.navController.navigateBack('/salaries/salary-list');
      });
    } catch (error) {
      this.salariesForm.handleError(error);
    }
  }

  ionViewWillLeave() {
    if (this.salarySubscription) {
      this.salarySubscription.unsubscribe();
    }
  }
}
