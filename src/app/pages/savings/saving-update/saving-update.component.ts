import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { SavingsService } from '../../../services/savings/savings.service';
import { Saving } from '../../../models/saving';
import { SavingsFormComponent } from '../../../components/savings-form/savings-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-saving-update',
  templateUrl: './saving-update.component.html',
  styleUrls: ['./saving-update.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, SavingsFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class SavingUpdateComponent {
  @ViewChild(SavingsFormComponent, { static: false }) savingsForm: SavingsFormComponent;

  savingId: string;

  currentSaving$: Observable<Saving> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.savingId = params['id'];
      return this.savingsService.getSaving(params['id']);
    })
  );

  public saving: Saving = new Saving();

  public origBalance: number;
  public origInitialCash: number;

  public toDay: any;
  public fromDate: any;
  public toDate: any;

  private savingSubscription: any;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private savingsService: SavingsService,
    private toastService: ToastService,
    private navController: NavController,
    private route: ActivatedRoute
  ) {

  }

  ionViewWillEnter() {
    this.toDay = new Date().getFullYear();
    this.toDate = `${(this.toDay + 1)}`;
    this.fromDate = `${(this.toDay - 5)}`;
    this.savingSubscription = this.currentSaving$.pipe()
    .subscribe(saving => {
      this.origBalance = saving.balance;
      this.origInitialCash = saving.initialcash;
      this.savingsForm.onSavingRetrieved(saving);
    });
  }


  async updateSaving(saving: Saving): Promise<void> {

    try{
      saving.balance = this.origBalance + saving.initialcash - this.origInitialCash;
      if (saving.frequency === 'Weekly') {
        saving.annualinterest = (saving.interest * 52);
      } else {
        if (saving.frequency === 'Monthly') {
          saving.annualinterest = (saving.interest * 12);
        } else {
          if (saving.frequency === 'Quarterly') {
            saving.annualinterest = (saving.interest * 4);
          } else {
            saving.annualinterest = saving.interest;
          }
        }
      }
      saving.date = new Date(saving.date).toISOString();
      saving.annualinterest = Math.round(saving.annualinterest * 1e2) / 1e2;
      saving.balance = Math.round(saving.balance * 1e2) / 1e2;

      this.savingsService.updateSaving(this.savingId, saving).then(res => {
        this.toastService.displayToast('Savings account updated');
        this.navController.navigateBack('/savings/saving-list');
      });
    } catch (error) {
      this.savingsForm.handleError(error);
    }
  }

  ionViewWDidLeave() {

    if (this.savingSubscription) {
      this.savingSubscription.unsubscribe();
    }
  }
}
