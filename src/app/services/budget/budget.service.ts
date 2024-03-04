import { inject, Injectable } from '@angular/core';
import { 
    addDoc,
    collection, 
    collectionData, 
    deleteDoc,
    doc,
    docData,
    Firestore,
    runTransaction,
    onSnapshot,
 } from '@angular/fire/firestore';
 import { User } from '@angular/fire/auth';
 import { filter, map, Observable, switchMap } from 'rxjs';
 import { AuthService } from '../user/auth.service';
 import { Budget } from '../../models/budget';
 import { isNotNullOrUndefined } from '../../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private readonly auth = inject(AuthService);
  private readonly firestore = inject(Firestore);
  budgetArray: Budget[] = [];

  private userId = this.auth.getUser()?.uid ?? '';
  private taxyearid: string = this.auth.getUser()?.displayName ?? '';
  private dbBudgetPath = `/users/${this.userId}/settings/${this.taxyearid}/budgetList`;

  getRealtimeBudgets(): Observable<Budget[]> {
    return new Observable((budgets) => {
      this.budgetArray = [];
      const budgetList = collection(this.firestore,this.dbBudgetPath);
      const unsubscribe = onSnapshot(budgetList, (snapshot) => {
        let tempArray = snapshot.docChanges();
        if(!((tempArray.length == 1) && (tempArray[0].type == 'modified'))) {
          if(this.budgetArray?.length != 0) { 
            this.budgetArray = [];
          }
        }
        tempArray.forEach((change) => {
          let budget: any = change.doc.data();
          budget.id = change.doc.id;
          if(this.budgetArray?.length == 0) {
            this.budgetArray.push(budget);
          } else {
            if (change.type === "added"){
              this.budgetArray.push(budget);
            }
            if (change.type === "modified") {
              const index = this.budgetArray.findIndex(x => x.id == budget.id);
              this.budgetArray[index] = budget;
            }
            if (change.type === "removed") {
              this.budgetArray = this.budgetArray.filter(x => x.id != budget.id);
            }
          }
        });
        budgets.next(this.budgetArray);
      });
      return () => unsubscribe();
    });
  }

  getBudget(budgetId: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId, displayName: taxyearid }: User) =>
        doc(this.firestore, `/users/${userId}/settings/${taxyearid}/budgetList/${budgetId}`)
      ),
      switchMap(
        (budgetDoc) =>
          docData(budgetDoc, { idField: 'id' }) as Observable<Budget>
      )
    );
  }

  createBudget(budget: Partial<Budget>) {
    this.dbBudgetPath = `/users/${this.userId}/settings/${this.taxyearid}/budgetList`;
    const budgetCollection = collection(this.firestore, `${this.dbBudgetPath}/`);
    return addDoc(budgetCollection, budget);
  }
  
  createBudgetById(taxYearId: string, budget: Partial<Budget>) {
    this.dbBudgetPath = `/users/${this.userId}/settings/${taxYearId}/budgetList`;
    const budgetCollection = collection(this.firestore, `${this.dbBudgetPath}/`);
    return addDoc(budgetCollection, budget);
  }
  
  async updateBudget(budgetId: string, value: any): Promise<void> {
    try {
      const budgetDocRef = doc(this.firestore, `${this.dbBudgetPath}/${budgetId}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(budgetDocRef, value);
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }
  
  deleteBudget(budgetId: string): Promise<void> {
    const budgetDocRef = doc(this.firestore,`${this.dbBudgetPath}/${budgetId}`);
    return deleteDoc(budgetDocRef);
  }

  getCopyBudgets(copyTaxYearid: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId}) =>
        collection(this.firestore, `/users/${userId}/settings/${copyTaxYearid}/budgetList`)
      ),
      switchMap(
        (budgetCollection) =>
          collectionData(budgetCollection, { idField: 'id' }) as Observable<Budget[]>
      )
    );
  }
}