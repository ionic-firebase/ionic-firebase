import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { PensionService } from '../../../services/pension/pension.service';
import { Pension } from '../../../models/pension';
import { PensionFormComponent } from '../../../components/pension-form/pension-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-pension-update',
  templateUrl: './pension-update.component.html',
  styleUrls: ['./pension-update.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, PensionFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class PensionUpdateComponent {
  @ViewChild(PensionFormComponent, { static: false }) pensionForm: PensionFormComponent;

  public pensionId: string;

  currentPension$: Observable<Pension> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.pensionId = params['id'];
      return this.pensionService.getPension(params['id']);
    })
  );

  public pension: Pension = new Pension();
  public origBalance: number;
  public origInitialCash: number;
  public toDay: any;
  public fromDate: any;
  public toDate: any;

  public pensionsSubscription: any;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private pensionService: PensionService,
    private toastService: ToastService,
    private navController: NavController,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.toDay = new Date().getFullYear();
    this.toDate = `${(this.toDay + 1)}`;
    this.fromDate = `${(this.toDay - 5)}`;
    this.pensionsSubscription = this.currentPension$.pipe()
    .subscribe((pension: Pension) => {
      this.pensionForm.onPensionRetrieved(pension);
    });
  }

  async updatePension(pension: Pension): Promise<void> {
    try {
      if (pension.frequency === 'Weekly') {
        pension.annualincome = pension.income * 52;
      } else {
        if (pension.frequency === 'Monthly') {
          pension.annualincome = pension.income * 12;
        } else {
          if (pension.frequency === 'Quarterly') {
            pension.annualincome = pension.income * 4;
          } else {
            pension.annualincome = pension.income;
          }
        }
      }
      pension.annualincome = Math.round(pension.annualincome * 1e2) / 1e2;
      this.pensionService.updatePension(this.pensionId, pension).then(res => {
        this.toastService.displayToast('Pension item updated');
        this.navController.navigateBack('/pensions/pension-list');
      });
    } catch (error) {
      this.pensionForm.handleError(error);
    }
  }

  ionViewWDidLeave() {
    if (this.pensionsSubscription) {
      this.pensionsSubscription.unsubscribe();
    }
  }

}

