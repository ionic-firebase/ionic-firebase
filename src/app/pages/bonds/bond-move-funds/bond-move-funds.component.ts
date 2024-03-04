import { Component, inject, ViewChild } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { BondService } from '../../../services/bond/bond.service';
import { PortfolioService } from '../../../services/portfolio/portfolio.service';
import { SavingsService } from '../../../services/savings/savings.service';
import { Bond } from '../../../models/bond';
import { Move } from '../../../models/move';
import { Movelist } from '../../../models/movelist';
import { Portfolio } from '../../../models/portfolio';
import { Saving } from '../../../models/saving';
import { MoveFormComponent } from '../../../components/move-form/move-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { take} from 'rxjs/operators';
import { Observable, switchMap } from 'rxjs';
import { format } from 'date-fns';

@Component({
  selector: 'app-bond-move-funds',
  templateUrl: './bond-move-funds.component.html',
  styleUrls: ['./bond-move-funds.component.scss'],
  standalone: true,
  imports: [MoveFormComponent, FormsModule, ReactiveFormsModule , IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class BondMoveFundsComponent {
  @ViewChild(MoveFormComponent, { static: false }) moveForm: MoveFormComponent;

  currentBond$: Observable<Bond> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.bondId = params['id'];
      return this.bondService.getBond(params['id']);
    })
  );

  private movelist: Movelist[];
  public move: Move;
  public splitted: Array<any>;
  public moveDate: string;
  private bondId: string;
  public currentBond: Bond = new Bond();
  private moveToBalance: number;

  private bondCurrentSubscription: any;
  private bondSubscription: any;
  private savingsSubscription: any;
  private portfoliosSubscription: any;

  public fromDate: any;
  public toDate: any;
  public moveTo: string;
  public toDay: any;

  private readonly AuthService = inject(AuthService);
  private readonly user$ = this.AuthService.getUser();

  constructor(
    private bondService: BondService,
    private portfolioService: PortfolioService,
    private savingsService: SavingsService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private navController: NavController,
  ) { }

  ionViewWillEnter() {
    this.toDay = new Date().getFullYear();
    this.toDate = `${(this.toDay + 1)}`;
    this.fromDate = `${(this.toDay - 5)}`;
    this.move = {
      date: format(new Date(), 'yyyy-MM-dd') + 'T09:00:00.000Z',
      moveto: "",
      amount: 0
    }
    this.bondCurrentSubscription = this.currentBond$.pipe(take(1))
    .subscribe((bondSnapshot: Bond) => {
      this.currentBond = bondSnapshot;
      if (this.currentBond ) {
        this.movelist = [];

        this.moveForm.onMoveRetrieved(this.move);

        this.bondSubscription = this.bondService.getRealtimeBonds()
        .pipe(take(1))
        .subscribe(moveListSnapshot => {
          moveListSnapshot.forEach((snap: Bond) => {
            if (this.bondId !== snap.id) {
              this.movelist.push({
                id: snap.id,
                type: 'Bond',
                name: snap.name,
                balance: snap.balance
              });
            }
          });
        });
    
        this.portfoliosSubscription = this.portfolioService.getRealtimePortfolios()
        .pipe(take(1))
        .subscribe(moveListSnapshot => {
          moveListSnapshot.forEach((snap: Portfolio) => {
            this.movelist.push({
              id: snap.id,
              type: 'Portfolio',
              name: snap.name,
              balance: snap.balance
            });
          });
        });

        this.savingsSubscription = this.savingsService.getRealtimeSavings()
        .pipe(take(1))
        .subscribe(moveListSnapshot => {
          moveListSnapshot.forEach((snap: Saving) => {
            this.movelist.push({
              id: snap.id,
              type: 'Savings',
              name: snap.name,
              balance: snap.balance
            });
          });
        });

        this.moveForm.onMovelistRetrieved(this.movelist);
      }
    });
  }

  addMove(move: Move): void {
    if (
      move.date === undefined ||
      move.moveto === undefined ||
      move.amount === undefined
    ) {
      this.toastService.displayToast('Check fields are filled in correctly!');
      return;
    }
    this.splitted =  move.moveto.split(',');
    const moveToId = this.splitted[0];
    const moveToName = this.splitted[1];
    const moveToType = this.splitted[2];
    this.moveToBalance = this.splitted[3] * 1;
    const newBondBalance = this.currentBond.balance - move.amount;

    const transactionBond = {
      id: '',
      parentid: this.bondId,
      date:  move.date,
      description: `Cash transfer from ${this.currentBond.name} to ${moveToName}`,
      cashamount: move.amount * -1,
      type: 'bond',
      mode: 'cash'
    };

    this.bondService.createBondTransaction(this.bondId, transactionBond).then(trans => {
      this.bondService.updateBondBalance(this.bondId, newBondBalance).then(res => {

        if (moveToType === 'Bond') {
          const transactionBond2 = {
            id: '',
            parentid: moveToId,
            date:  move.date,
            description: `Cash transfer to ${moveToName} from ${this.currentBond.name}`,
            cashamount: move.amount,
            type: 'bond',
            mode: 'cash'
          };
          this.bondService.createBondTransaction(this.bondId, transactionBond2).then(res1 => {
            this.bondService.updateBondBalance(moveToId, this.moveToBalance);
          });
        }

        if (moveToType === 'Portfolio') {
          const transactionPortfolio = {
            id: '',
            parentid: moveToId,
            date:  move.date,
            description: `Cash transfer in to ${moveToName} from ${this.currentBond.name}`,
            cashamount: move.amount,
            type: 'portfolio',
            mode: 'cash'
          };
          this.portfolioService.createPortfolioTransaction(moveToId, transactionPortfolio).then(res3 => {
            this.portfolioService.updatePortfolioCashBalance(moveToId, this.moveToBalance);
          });
        }

        if (moveToType === 'Savings') {
          const transactionSaving = {
            id: '',
            parentid: moveToId,
            date:  move.date,
            description: `Cash transfer in to ${moveToName} from ${this.currentBond.name}`,
            cashamount: move.amount,
            type: 'saving',
            mode: 'cash'
          };
          this.savingsService.createSavingsTransaction(moveToId, transactionSaving).then(res2 => {
            this.savingsService.updateSavingsBalance(moveToId, this.moveToBalance);
          });
        }

        this.toastService.displayToast(`Moved ${move.amount} from ${this.currentBond.name} to ${this.splitted[1]}`);
        this.navController.navigateBack('/bonds/bond-list');
      });
    });
  }

  ionViewWillLeave() {
    if (this.bondSubscription) {
      this.bondSubscription.unsubscribe();
    }
    if (this.bondCurrentSubscription) {
      this.bondCurrentSubscription.unsubscribe();
    }
    if (this.savingsSubscription) {
      this.savingsSubscription.unsubscribe();
    }
    if (this.portfoliosSubscription) {
      this.portfoliosSubscription.unsubscribe();
    }
  }
}
