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
  selector: 'app-saving-move-funds',
  templateUrl: './saving-move-funds.component.html',
  styleUrls: ['./saving-move-funds.component.scss'],
  standalone: true,
  imports: [MoveFormComponent, FormsModule, ReactiveFormsModule , IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class SavingMoveFundsComponent {
  @ViewChild(MoveFormComponent, { static: false }) moveForm: MoveFormComponent;

  currentSaving$: Observable<Saving> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.savingId = params['id'];
      return this.savingsService.getSaving(params['id']);
    })
  );

  private movelist: Movelist[];
  public move: Move;
  public splitted: Array<any>;
  public moveDate: string;
  private savingId: string;
  public currentSaving: Saving = new Saving();
  private moveToBalance: number;

  private savingCurrentSubscription: any;
  private bondsSubscription: any;
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
    this.savingCurrentSubscription = this.currentSaving$
    .pipe(take(1))
    .subscribe((savingSnapshot: Saving) => {
      this.currentSaving = savingSnapshot;
      if (this.currentSaving ) {
        this.movelist = [];

        this.moveForm.onMoveRetrieved(this.move);

        this.savingsSubscription = this.savingsService.getRealtimeSavings()
        .pipe(take(1))
        .subscribe((moveListSnapshot: Saving[]) => {
          moveListSnapshot.forEach(snap => {
            if (this.savingId !== snap.id) {
              this.movelist.push({
                id: snap.id,
                type: 'Savings',
                name: snap.name,
                balance: snap.balance
              });
            }
          });
        });
    
        this.bondsSubscription = this.bondService.getRealtimeBonds()
        .pipe(take(1))
        .subscribe((moveListSnapshot: Bond[]) => {
          moveListSnapshot.forEach(snap => {
            this.movelist.push({
              id: snap.id,
              type: 'Bond',
              name: snap.name,
              balance: snap.balance
            });
          });
        });

        this.portfoliosSubscription = this.portfolioService.getRealtimePortfolios()
        .pipe(take(1))
        .subscribe((moveListSnapshot: Portfolio[]) => {
          moveListSnapshot.forEach(snap => {
            this.movelist.push({
              id: snap.id,
              type: 'Portfolio',
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
    const newSavingBalance = this.currentSaving.balance - move.amount;

    const transactionSaving = {
      id: '',
      parentid: this.savingId,
      date:  move.date,
      description: `Cash transfer from ${this.currentSaving.name} to ${moveToName}`,
      cashamount: move.amount * -1,
      type: 'saving',
      mode: 'cash'
    };

    this.savingsService.createSavingsTransaction(this.savingId, transactionSaving).then(trans => {
      this.savingsService.updateSavingsBalance(this.savingId, newSavingBalance).then(res => {

        if (moveToType === 'Savings') {
          const transactionSaving2 = {
            id: '',
            parentid: moveToId,
            date:  move.date,
            description: `Cash transfer in to ${moveToName} from ${this.currentSaving.name}`,
            cashamount: move.amount,
            type: 'saving',
            mode: 'cash'
          };
          this.savingsService.createSavingsTransaction(moveToId, transactionSaving2).then(res2 => {
            this.savingsService.updateSavingsBalance(moveToId, this.moveToBalance);
          });
        }
        
        if (moveToType === 'Bond') {
          const transactionBond = {
            id: '',
            parentid: moveToId,
            date:  move.date,
            description: `Cash transfer to ${moveToName} from ${this.currentSaving.name}`,
            cashamount: move.amount,
            type: 'bond',
            mode: 'cash'
          };
          this.bondService.createBondTransaction(moveToId, transactionBond).then(res1 => {
            this.bondService.updateBondBalance(moveToId, this.moveToBalance);
          });
        }

        if (moveToType === 'Portfolio') {
          const transactionPortfolio = {
            id: '',
            parentid: moveToId,
            date:  move.date,
            description: `Cash transfer in to ${moveToName} from ${this.currentSaving.name}`,
            cashamount: move.amount,
            type: 'portfolio',
            mode: 'cash'
          };
          this.portfolioService.createPortfolioTransaction(moveToId, transactionPortfolio).then(res3 => {
            this.portfolioService.updatePortfolioCashBalance(moveToId, this.moveToBalance);
          });
        }

        this.toastService.displayToast(`Moved ${move.amount} from ${this.currentSaving.name} to ${this.splitted[1]}`);
        this.navController.navigateBack('/savings/saving-list');
      });
    });
  }

  ionViewWillLeave() {
    if (this.savingCurrentSubscription) {
      this.savingCurrentSubscription.unsubscribe();
    }
    if (this.bondsSubscription) {
      this.bondsSubscription.unsubscribe();
    }
    if (this.savingsSubscription) {
      this.savingsSubscription.unsubscribe();
    }
    if (this.portfoliosSubscription) {
      this.portfoliosSubscription.unsubscribe();
    }
  }
}
