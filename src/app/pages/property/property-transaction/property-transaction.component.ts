import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { PropertyService } from '../../../services/property/property.service';
import { Transaction } from '../../../models/transaction';
import { Property } from '../../../models/property';
import { ToastService } from '../../../services/toast/toast.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { TransactionFormComponent } from 'src/app/components/transaction-form/transaction-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-property-transaction',
  templateUrl: './property-transaction.component.html',
  styleUrls: ['./property-transaction.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TransactionFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})

export class PropertyTransactionComponent {
  @ViewChild(TransactionFormComponent, { static: false }) transactionForm: TransactionFormComponent;

  propertyId: string;

  currentProperty$: Observable<Property> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.propertyId = params['id'];
      return this.propertyService.getProperty(params['id']);
    })
  );
  
  propertyName: string;

  private property: Property = new Property();
  public propertytransaction: Transaction = new Transaction();
  public propertyTransactionList: Transaction[];

  propertySubscription: any;
  propertyTransactionsSubscription: any;
  public toDay: any;
  public toDate: any;
  public fromDate: any;
  public typeDropdowns: any[];

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();
  
  constructor(
    private propertyService: PropertyService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.typeDropdowns = [
      {name: 'Rental Income', value: 'rentalincome'},
      {name: 'Other Income', value: 'otherincome'},
      {name: 'Mortgage', value: 'mortgage'},
      {name: 'Management Fees', value: 'management'},
      {name: 'Rates', value: 'rates'},
      {name: 'Maintenance', value: 'maintenance'},
      {name: 'Insurance', value: 'insurance'},
      {name: 'Utilities', value: 'utilities'},
      {name: 'Other Costs', value: 'othercosts'}
    ];
    this.toDate = new Date().getFullYear();
    this.toDate = `${(this.toDate + 1)}`;
    this.fromDate = `${(this.toDate - 50)}`;
    this.propertySubscription = this.currentProperty$.pipe()
    .subscribe(property => {
      this.property = property;
      this.propertyName = property.name;
    });
  }

  async createPropertyTransaction(transaction: Transaction): Promise<void> {

    try {

      if (transaction.type === 'rentalincome') {
        this.property.actualrentalincome = this.property.actualrentalincome + transaction.cashamount;
        this.property.actualannualincome = this.property.actualannualincome + transaction.cashamount;
      }

      if (transaction.type === 'otherincome') {
        this.property.actualotherincome = this.property.actualotherincome + transaction.cashamount;
        this.property.actualannualincome = this.property.actualannualincome + transaction.cashamount;
      }

      if (transaction.type === 'mortgage') {
        this.property.actualmortgage = this.property.actualmortgage + transaction.cashamount;
      }

      if (transaction.type === 'management') {
        this.property.actualmanagement = this.property.actualmanagement + transaction.cashamount;
        transaction.cashamount = transaction.cashamount * -1;
      }

      if (transaction.type === 'rates') {
        this.property.actualrates = this.property.actualrates + transaction.cashamount;
        transaction.cashamount = transaction.cashamount * -1;
      }

      if (transaction.type === 'maintenance') {
        this.property.actualmaintenance = this.property.actualmaintenance + transaction.cashamount;
        transaction.cashamount = transaction.cashamount * -1;
      }

      if (transaction.type === 'insurance') {
        this.property.actualinsurance = this.property.actualinsurance + transaction.cashamount;
        transaction.cashamount = transaction.cashamount * -1;
      }

      if (transaction.type === 'utilities') {
        this.property.actualutilities = this.property.actualutilities + transaction.cashamount;
        transaction.cashamount = transaction.cashamount * -1;
      }

      if (transaction.type === 'othercosts') {
        this.property.actualothercosts = this.property.actualothercosts + transaction.cashamount;
        transaction.cashamount = transaction.cashamount * -1;
      }
      this.property.currentcashbalance = this.property.currentcashbalance + transaction.cashamount;
      this.property.currentcashbalance = Math.round(this.property.currentcashbalance * 1e2) / 1e2;
      transaction.parentid = this.propertyId;
      transaction.mode = 'Property';
      transaction.date = new Date(transaction.date).toISOString();
      this.propertyService.createPropertyTransaction(this.propertyId, transaction).then(res => {
        this.propertyService.updateProperty(this.propertyId, this.property).then(res2 => {
          this.toastService.displayToast('Property transaction added');
          this.navController.navigateBack('/property/property-list');
        });
      });
    } catch (error) {
      this.transactionForm.handleError(error);
    }
  }
 
  ionViewWillLeave() {
    if (this.propertySubscription) {
      this.propertySubscription.unsubscribe();
    }
    if (this.propertyTransactionsSubscription) {
      this.propertyTransactionsSubscription.unsubscribe();
    }
  }
}
