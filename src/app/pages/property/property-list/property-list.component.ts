import { Component, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { PropertyService } from '../../../services/property/property.service';
import { SettingsService } from '../../../services/settings/settings.service';
import { Property } from '../../../models/property';
import { Transaction } from '../../../models/transaction';
import { Reorder } from '../../../models/reorder';
import { AlertController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ToastService } from '../../../services/toast/toast.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-property-list',
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class PropertyListComponent  implements OnInit {

  propertyList: Property[];
  propertyTransactionsList: Transaction[];
  propertyTransaction: Transaction;
  propertyTotalIncome: number;
  propertyTotalValues: number;
  propertyTotalCosts: number;

  private propertiesSubscription: any;
  private propertyTransactionsSubscription: any;
  private settingsSubscription: any;

  reorder: Reorder[];

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private propertyService: PropertyService,
    private settingsService: SettingsService,
    private toastService: ToastService,
    private actionCtrl: ActionSheetController,
    private alertController: AlertController,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {

    this.propertiesSubscription = this.propertyService.getRealtimeProperties()
    .subscribe((properties: Property[]) => {
      this.propertyTotalIncome = 0;
      this.propertyTotalValues = 0;
      this.propertyTotalCosts = 0;

      this.propertyList = properties;
      if (this.propertyList) {
        this.propertyList.forEach((property: Property) => {
          this.propertyTotalValues = this.propertyTotalValues + property.currentvalue;
          this.propertyTotalIncome = this.propertyTotalIncome + property.budgetannualincome;
          this.propertyTotalCosts = this.propertyTotalCosts + property.actualinsurance + property.actualmaintenance +
            property.actualmanagement + property.actualmortgage + property.actualrates + property.actualutilities +
            property.actualothercosts;
        });
      }
    });
  }

  createProperty() {
    this.navController.navigateForward('/property/property-create');
  }

  async deletePropertyItem(
    propertyId: string,
  ) {
    const alert = await this.alertController.create({
      message: `Delete property`,
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
            this.propertyService.deleteProperty(propertyId)
            .then(() => {
              this.propertyTransactionsSubscription = this.propertyService.getPropertyTransactions(propertyId)
              .pipe(take(1))
              .subscribe((transactions: Transaction[]) => {
                this.propertyTransactionsList = transactions;
                if(this.propertyTransactionsList != undefined) {
                  this.propertyTransactionsList.forEach(transaction => {
                    this.propertyTransaction = transaction;
                    const transactionId = this.propertyTransaction.id;
                    this.propertyService.deletePropertyTransaction(propertyId, transactionId);
                  });
                }
              });
              this.reorder = [];
              this.settingsSubscription = this.settingsService.getReorderByItemId(propertyId)
              .pipe(take(1))
              .subscribe((reorder: Reorder) => {
                this.reorder[0] = reorder;
                if (this.reorder[0] !== undefined) {
                  const id = this.reorder[0].id;
                  if (id !== undefined) {
                    this.settingsService.deleteReorder(id).then(res => {
                      this.toastService.displayToast('Property deleted.');
                      this.navController.navigateBack(`/property/property-list`);
                    });
                  }
                }
              });
            });
          },
        },
      ],
    });
    await alert.present();
  }

  openMenu(
    id: string,
  ) {
    this.actionCtrl.create({
      buttons: [
        {
          text: 'List Transactions & Interest',
          handler: () => {
            this.navController.navigateForward(`/property/property-list-transactions/${id}`);
          }
        },
        {
          text: 'Add Transaction & Interest',
          handler: () => {
            this.navController.navigateForward(`/property/property-transaction/${id}`);
          }
        },
        {
          text: 'Edit Property',
          handler: () => {
            this.navController.navigateForward(`/property/property-update/${id}`);
          }
        },
        {
          text: 'Delete Property',
          handler: () => {
            this.deletePropertyItem(id);
          }
        },
        {
          text: 'Move Funds',
          handler: () => {
            this.navController.navigateForward(`/property/property-move-funds/${id}`);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(ac => ac.present());
  }

  ionViewDidLeave() {
    if (this.propertiesSubscription) {
      this.propertiesSubscription.unsubscribe();
    }
    if (this.propertyTransactionsSubscription) {
      this.propertyTransactionsSubscription.unsubscribe();
    }
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }
}