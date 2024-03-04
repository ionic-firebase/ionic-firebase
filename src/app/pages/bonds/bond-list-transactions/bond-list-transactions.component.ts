import { Component, ViewEncapsulation, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { BondService } from '../../../services/bond/bond.service';
import { ToastService } from '../../../services/toast/toast.service';
import { Bond } from '../../../models/bond';
import { Transaction } from '../../../models/transaction';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransactionFormComponent } from '../../../components/transaction-form/transaction-form.component';
import { AuthService } from '../../../services/user/auth.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Observable, switchMap } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-bond-list-transactions',
  templateUrl: './bond-list-transactions.component.html',
  styleUrls: ['./bond-list-transactions.component.scss'],
  standalone: true,
  imports: [TransactionFormComponent, CommonModule, FormsModule, ReactiveFormsModule, 
    NgxDatatableModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class BondListTransactionsComponent {
  private readonly AuthService = inject(AuthService);
  private readonly user$ = this.AuthService.getUser();
  private readonly bondService = inject(BondService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  bondId: string;
  
  currentBond$: Observable<Bond> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.bondId = params['id'];
      return this.bondService.getBond(params['id']);
    })
  );

  bond: Bond;
  bondTransactionList: Transaction[];
  bondTransaction: Transaction;

  bondName: string;
  bondBalance: number;

  bondDate: string;
  public rowList$: Array<any>;
  private bondSubscription: any;
  private bondTransactionsSubscription: any;

  public columns: any;
  public rows: any = [];
  public isMode: boolean;

  constructor(
    private toastService: ToastService,
    private alertController: AlertController,
    private actionCtrl: ActionSheetController,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.rowList$ = [];
    this.rows = [];
    this.bondSubscription = this.currentBond$.pipe(take(1))
    .subscribe((bond: Bond) => {
      this.bond = bond;
      if(this.bond !== undefined) {
        this.bondBalance = this.bond.initialcash;
        this.bondName = this.bond.name;
        this.rowList$.push({
          date: this.bond.date,
          mode: '',
          type: '',
          ismode: this.isMode,
          description: 'Initial balance setup',
          cashamount: this.bondBalance,
          balance: this.bondBalance,
          id: ''
        });

        this.bondTransactionsSubscription = this.bondService.getBondTransactions(this.bondId)
        .pipe(take(1))
        .subscribe((transactions: Transaction[]) => {
          this.bondTransactionList = transactions;
          if (this.bondTransactionList !== undefined) {
            this.bondTransactionList.forEach(snapTransaction => {
              this.bondTransaction = snapTransaction;
              this.bondBalance = this.bondBalance + this.bondTransaction.cashamount;
              if ( this.bondTransaction.mode === 'Cash') {
                this.isMode = true;
              } else {
                this.isMode = false;
              }
              this.rowList$.push({
                date:  this.bondTransaction.date,
                mode:  this.bondTransaction.mode,
                type:  this.bondTransaction.type,
                ismode: this.isMode,
                description:  this.bondTransaction.description,
                cashamount:  this.bondTransaction.cashamount,
                balance: this.bondBalance,
                id:  this.bondTransaction.id
              });
            });
            this.rows = [...this.rowList$];
          }
        });
      }
    });
  }

  createBondTransaction() {
    this.navController.navigateForward(`/bonds/bond-transaction/${this.bondId}`);
  }

  async deleteBondTransaction(
    transactionId: string,
    mode: string,
    cashamount: number
  ) {
    if (transactionId) {
      const alert = await this.alertController.create({
        message: `Delete cash transaction?`,
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
              if ( mode === 'Cash' ) {
                const newbalance = this.bondBalance - cashamount;
                this.bondService.updateBondBalance(this.bondId, newbalance);
                this.bondService.deleteBondTransaction(this.bondId, transactionId)
                .then(() => {
                  this.toastService.displayToast('Cash transaction deleted.');
                  this.navController.navigateBack(`/bonds/bond-list`);
                });
              }
            },
          },
        ],
      });
      await alert.present();
    }
  }

  openMenu(
    id: string,
    mode: string,
    cashamount: number
  ) {
    this.actionCtrl.create({
      buttons: [
        {
          text: 'Delete bond transaction',
          handler: () => {
            this.deleteBondTransaction(id, mode, cashamount);
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
    if (this.bondTransactionsSubscription) {
      this.bondTransactionsSubscription.unsubscribe();
    }
    if (this.bondSubscription) {
      this.bondSubscription.unsubscribe();
    }
  }
}
