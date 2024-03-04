import { Component, ViewEncapsulation, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../../services/property/property.service';
import { ToastService } from '../../../services/toast/toast.service';
import { Property } from '../../../models/property';
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
  selector: 'app-property-list-transactions',
  templateUrl: './property-list-transactions.component.html',
  styleUrls: ['./property-list-transactions.component.scss'],
  standalone: true,
  imports: [TransactionFormComponent, CommonModule, FormsModule, ReactiveFormsModule,  
    NgxDatatableModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class PropertyListTransactionsComponent {

  propertyId: string;

  propertyBond$: Observable<Property> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.propertyId = params['id'];
      return this.propertyService.getProperty(params['id']);
    })
  );

  propertyName: string;
  private isUpdated: boolean;

  public propertyBalance: number;
  public rowList: Array<any>;
  propertyTransactionId: string;

  public property: Property;

  propertyTransactionList: Transaction[];
  private propertyTransaction: Transaction;

  propertySubscription: any;
  propertyTransactionsSubscription: any;
  propertyTransactionSubscription: any;

  public columns: any;
  public rows: any;
  public isMode: boolean;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private propertyService: PropertyService,
    private toastService: ToastService,
    private alertController: AlertController,
    private actionCtrl: ActionSheetController,
    private route: ActivatedRoute,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.isMode = false;
    this.propertySubscription = this.propertyBond$.pipe(take(1))
    .subscribe((property: Property) => {
      this.property = property;
      this.propertyName = this.property.name;
      this.propertyBalance = this.property.initialcash;

      this.rowList = [];
      this.rowList.push({
        date: property.purchasedate,
        type: '',
        ismode: this.isMode,
        description: 'Initial cash setup',
        cashamount: this.propertyBalance,
        balance: this.propertyBalance,
        key: ''
      });
      this.isMode = true;
      this.propertyTransactionsSubscription = this.propertyService.getPropertyTransactions(this.propertyId)
      .pipe()
      .subscribe((transactions: Transaction[]) => {
        if (transactions) {
          transactions.forEach((snapTransaction: Transaction) => {
            this.propertyBalance = this.propertyBalance + snapTransaction.cashamount;
            this.rowList.push({
              date: snapTransaction.date,
              type: snapTransaction.type,
              ismode: this.isMode,
              description: snapTransaction.description,
              cashamount: snapTransaction.cashamount,
              balance: this.propertyBalance,
              id: snapTransaction.id
            });
          });
          this.rows = this.rowList;
        }
      });
    });
  }

  async getidpromise(): Promise<any> {
    return this.route.snapshot.paramMap.get('id');
  }

  createPropertyTransaction() {
    this.navController.navigateForward(`/property/property-transaction/${this.propertyId}`);
  }

  async deletePropertyTransaction(
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
                const newbalance = this.propertyBalance - cashamount;
                this.propertyService.updatePropertyBalance(this.propertyId, newbalance);
                this.propertyService.deletePropertyTransaction(this.propertyId, transactionId)
                .then(() => {
                  this.toastService.displayToast('Cash transaction deleted.');
                  this.navController.navigateBack(`/property/property-list`);
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
          text: 'Delete property transaction',
          handler: () => {
            this.deletePropertyTransaction(id, mode, cashamount);
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
    if (this.propertyTransactionsSubscription) {
      this.propertyTransactionsSubscription.unsubscribe();
    }
    if (this.propertySubscription) {
      this.propertySubscription.unsubscribe();
    }
  }
}
