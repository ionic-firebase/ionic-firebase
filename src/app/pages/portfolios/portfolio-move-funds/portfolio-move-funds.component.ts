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
  selector: 'app-portfolio-move-funds',
  templateUrl: './portfolio-move-funds.component.html',
  styleUrls: ['./portfolio-move-funds.component.scss'],
  standalone: true,
  imports: [MoveFormComponent, FormsModule, ReactiveFormsModule , IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class PortfolioMoveFundsComponent {
  @ViewChild(MoveFormComponent, { static: false }) moveForm: MoveFormComponent;

  currentPortfolio$: Observable<Portfolio> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.portfolioId = params['id'];
      return this.portfolioService.getPortfolio(params['id']);
    })
  );

  private movelist: Movelist[];
  public move: Move;
  public splitted: Array<any>;
  public moveDate: string;
  private portfolioId: string;
  public currentPortfolio: Portfolio = new Portfolio();
  private moveToBalance: number;

  private portfolioCurrentSubscription: any;
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
    this.portfolioCurrentSubscription = this.currentPortfolio$
    .pipe(take(1))
    .subscribe((portfolioSnapshot: Portfolio) => {
      this.currentPortfolio = portfolioSnapshot;
      if (this.currentPortfolio ) {
        this.movelist = [];

        this.moveForm.onMoveRetrieved(this.move);

        this.portfoliosSubscription = this.portfolioService.getRealtimePortfolios()
        .pipe(take(1))
        .subscribe((moveListSnapshot: Portfolio[]) => {
          moveListSnapshot.forEach(snap => {
            if (this.portfolioId !== snap.id) {
              this.movelist.push({
                id: snap.id,
                type: 'Portfolio',
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

        this.savingsSubscription = this.savingsService.getRealtimeSavings()
        .pipe(take(1))
        .subscribe((moveListSnapshot: Saving[]) => {
          moveListSnapshot.forEach(snap => {
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
    const newPortfolioBalance = this.currentPortfolio.balance - move.amount;

    const transactionPortfolio = {
      id: '',
      parentid: this.portfolioId,
      date:  move.date,
      description: `Cash transfer from ${this.currentPortfolio.name} to ${moveToName}`,
      cashamount: move.amount * -1,
      type: 'portfolio',
      mode: 'cash'
    };

    this.portfolioService.createPortfolioTransaction(this.portfolioId, transactionPortfolio).then(trans => {
      this.portfolioService.updatePortfolioCashBalance(this.portfolioId, newPortfolioBalance).then(res => {

        if (moveToType === 'Portfolio') {
          const transactionPortfolio2 = {
            id: '',
            parentid: moveToId,
            date:  move.date,
            description: `Cash transfer in to ${moveToName} from ${this.currentPortfolio.name}`,
            cashamount: move.amount,
            type: 'portfolio',
            mode: 'cash'
          };
          this.portfolioService.createPortfolioTransaction(moveToId, transactionPortfolio2).then(res3 => {
            this.portfolioService.updatePortfolioCashBalance(moveToId, this.moveToBalance);
          });
        }

        if (moveToType === 'Bond') {
          const transactionBond = {
            id: '',
            parentid: moveToId,
            date:  move.date,
            description: `Cash transfer to ${moveToName} from ${this.currentPortfolio.name}`,
            cashamount: move.amount,
            type: 'bond',
            mode: 'cash'
          };
          this.bondService.createBondTransaction(moveToId, transactionBond).then(res1 => {
            this.bondService.updateBondBalance(moveToId, this.moveToBalance);
          });
        }

        if (moveToType === 'Savings') {
          const transactionSaving = {
            id: '',
            parentid: moveToId,
            date:  move.date,
            description: `Cash transfer in to ${moveToName} from ${this.currentPortfolio.name}`,
            cashamount: move.amount,
            type: 'saving',
            mode: 'cash'
          };
          this.savingsService.createSavingsTransaction(moveToId, transactionSaving).then(res2 => {
            this.savingsService.updateSavingsBalance(moveToId, this.moveToBalance);
          });
        }
        this.toastService.displayToast(`Moved ${move.amount} from ${this.currentPortfolio.name} to ${this.splitted[1]}`);
        this.navController.navigateBack('/portfolios/portfolio-list');
      });
    });
  }

  ionViewWillLeave() {
    if (this.portfolioCurrentSubscription) {
      this.portfolioCurrentSubscription.unsubscribe();
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
