import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { BondService } from '../../../services/bond/bond.service';
import { Transaction } from '../../../models/transaction';
import { Bond } from '../../../models/bond';
import { ToastService } from '../../../services/toast/toast.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { TransactionFormComponent } from 'src/app/components/transaction-form/transaction-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-bond-transaction',
  templateUrl: './bond-transaction.component.html',
  styleUrls: ['./bond-transaction.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TransactionFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})

export class BondTransactionComponent {
  @ViewChild(TransactionFormComponent, { static: false }) transactionForm: TransactionFormComponent;

  public bondId: string;

  currentBond$: Observable<Bond> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.bondId = params['id'];
      return this.bondService.getBond(params['id']);
    })
  );

  public bondName: string;
  public bondBalance: number;
  public fromDate: any;
  public toDate: any;
  public typeDropdowns: any[];
  public bondSubscription: any;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();
  
  constructor(
    private bondService: BondService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.typeDropdowns = [
      {name: 'Interest', value: 'Interest'},
      {name: 'Cash Transfer In', value: 'Transfer In'},
      {name: 'Cash Withdrawl', value: 'Withdrawl'},
      {name: 'Management Fee', value: 'Fee'},
      {name: 'Other Cash In', value: 'Other In'},
      {name: 'Other Cash Out', value: 'Other Out'}
    ];
    this.bondBalance = 0;
    this.toDate = new Date().getFullYear();
    this.toDate = `${(this.toDate + 1)}`;
    this.fromDate = `${(this.toDate - 3)}`;
    this.bondSubscription = this.currentBond$.pipe()
    .subscribe((bond: Bond) => {
      this.bondBalance = bond.balance;
      this.bondName = bond.name;
    });
  }

  async createBondTransaction(transaction: Transaction): Promise<void> {

    try {
      if (transaction.type === 'Withdrawl' ||
        transaction.type === 'Fee' ||
        transaction.type === 'Other Out') {
        transaction.cashamount = transaction.cashamount * -1;
      }
      this.bondBalance = this.bondBalance + transaction.cashamount;
      this.bondBalance = Math.round(this.bondBalance * 1e2) / 1e2;

      transaction.id = '';
      transaction.parentid = this.bondId;
      transaction.date = new Date(transaction.date).toISOString();
      transaction.mode = 'Cash';
      this.bondService.createBondTransaction(this.bondId, transaction).then(result => {
        this.bondService.updateBondBalance(this.bondId, this.bondBalance).then(res2 => {
          this.toastService.displayToast('Cash transaction added');
          this.navController.navigateBack('/bonds/bond-list');
        });
      });
    } catch (error) {
      this.transactionForm.handleError(error);
    }
  }

  ionViewWillLeave() {
    if (this.bondSubscription) {
      this.bondSubscription.unsubscribe();
    }
  }
}
