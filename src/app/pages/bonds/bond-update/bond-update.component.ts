import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { BondService } from '../../../services/bond/bond.service';
import { Bond } from '../../../models/bond';
import { BondFormComponent } from '../../../components/bond-form/bond-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-bond-update',
  templateUrl: './bond-update.component.html',
  styleUrls: ['./bond-update.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, BondFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class BondUpdateComponent {
  @ViewChild(BondFormComponent, { static: false }) bondForm: BondFormComponent;

  currentBond$: Observable<Bond> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.bondId = params['id'];
      return this.bondService.getBond(params['id']);
    })
  );

  public bondId: string;
  public bondOrigInitialCash: number;
  public bondOrigBalance: number;
  public bondType: string;
  public bondAnnual: number;
  public toDay: any;
  public fromDate: any;
  public toDate: any;


  public bondsSubscription: any;

  private readonly AuthService = inject(AuthService);
  private readonly user$ = this.AuthService.getUser();

  constructor(
    private bondService: BondService,
    private toastService: ToastService,
    private navController: NavController,
    private route: ActivatedRoute
  ) { }

  ionViewWillEnter() {
    this.toDay = new Date().getFullYear();
    this.toDate = `${(this.toDay + 1)}`;
    this.fromDate = `${(this.toDay - 5)}`;
    this.bondsSubscription = this.currentBond$.pipe()
    .subscribe((bond: Bond) => {
      this.bondForm.onBondRetrieved(bond);
      this.bondOrigInitialCash = bond.initialcash;
      this.bondOrigBalance = bond.balance;
    });
  }

  async updateBond(bond: Bond): Promise<void> {
    try {
      bond.id = this.bondId;
      bond.date = new Date(bond.date).toISOString();
      if ( this.bondOrigInitialCash !== bond.initialcash) {
        bond.balance = bond.balance + bond.initialcash - this.bondOrigInitialCash;
      }
      if (bond.frequency === 'Weekly') {
        bond.interestpayable = (bond.balance * bond.interestrate / 5200)
        bond.annualinterest = (bond.interestpayable * 52);
      } else {
        if (bond.frequency === 'Monthly') {
          bond.interestpayable = (bond.balance * bond.interestrate / 1200)
          bond.annualinterest = (bond.interestpayable * 12);
        } else {
          if (bond.frequency === 'Quarterly') {
            bond.interestpayable = (bond.balance * bond.interestrate / 400)
            bond.annualinterest = (bond.interestpayable * 4);
          } else {
            bond.interestpayable = (bond.balance * bond.interestrate / 100)
            bond.annualinterest = bond.interestpayable;
          }
        }
      }
      this.bondService.updateBond(this.bondId, bond).then(res => {
        this.toastService.displayToast('Bond account updated');
        this.navController.navigateBack('/bonds/bond-list');
      });
    } catch (error) {
      this.bondForm.handleError(error);
    }
  }

  ionViewWDidLeave() {

    if (this.bondsSubscription) {
      this.bondsSubscription.unsubscribe();
    }
  }
}
