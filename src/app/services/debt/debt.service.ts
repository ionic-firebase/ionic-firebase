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
    query,
    orderBy,
    onSnapshot,
 } from '@angular/fire/firestore';
 import { User } from '@angular/fire/auth';
 import { filter, map, Observable, switchMap } from 'rxjs';
 import { AuthService } from '../user/auth.service';
 import { Debt } from '../../models/debt';
 import { Transaction } from '../../models/transaction';
 import { isNotNullOrUndefined } from '../../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class DebtService {
    private readonly auth = inject(AuthService);
    private readonly firestore = inject(Firestore);
    debtArray: Debt[] = [];
    private userId = this.auth.getUser()?.uid ?? '';
    private taxyearid: string = this.auth.getUser()?.displayName ?? '';
    private dbDebtPath = `/users/${this.userId}/settings/${this.taxyearid}/debtList`;

    getRealtimeDebts(): Observable<Debt[]> {
      return new Observable((debts) => {
        this.debtArray = [];
        const debtList = query(collection(this.firestore,this.dbDebtPath), 
        orderBy('name', 'asc'));
        const unsubscribe = onSnapshot(debtList, (snapshot) => {
          let tempArray = snapshot.docChanges();
          if(!((tempArray.length == 1) && (tempArray[0].type == 'modified'))) {
            if(this.debtArray?.length != 0) { 
              this.debtArray = [];
            }
          }
          tempArray.forEach((change) => {
            let debt: any = change.doc.data();
            debt.id = change.doc.id;
            if(this.debtArray?.length == 0) {
              this.debtArray.push(debt);
            } else {    
              if (change.type === "added"){
                this.debtArray.push(debt);
              }
              if (change.type === "modified") {
                const index = this.debtArray.findIndex(x => x.id == debt.id);
                this.debtArray[index] = debt;
              }
              if (change.type === "removed") {
                this.debtArray = this.debtArray.filter(x => x.id != debt.id);
              }
            }
          });
          debts.next(this.debtArray);
        });
        return () => unsubscribe();
      });
    }

    getDebt(debtId: string) {
      return this.auth.getUser$().pipe(
        filter(isNotNullOrUndefined),
        map(({ uid: userId, displayName: taxyearid }: User) =>
          doc(this.firestore, `/users/${userId}/settings/${taxyearid}/debtList/${debtId}`)
        ),
        switchMap(
          (debtDoc) =>
            docData(debtDoc, { idField: 'id' }) as Observable<Debt>
        )
      );
    }
  
    createDebt(debt: Partial<Debt>) {
      const debtCollection = collection(this.firestore, `${this.dbDebtPath}/`);
      return addDoc(debtCollection, debt);
    }

    createDebtById(taxYearId: string, debt: Partial<Debt>) {
      this.dbDebtPath = `/users/${this.userId}/settings/${taxYearId}/debtList`;
      const debtCollection = collection(this.firestore, `${this.dbDebtPath}/`);
      return addDoc(debtCollection, debt);
    }
    
    async updateDebt(debtId: string, value: any): Promise<void> {
      try {
        const debtDocRef = doc(this.firestore, `${this.dbDebtPath}/${debtId}`);
        await runTransaction(this.firestore, async (transaction) => {
            transaction.update(debtDocRef, value);
        });
      } catch (error) {
        console.log('Transaction failed: ', error);
        throw error;
      }
    }
    
    deleteDebt(debtId: string): Promise<void> {
      const debtDocRef = doc(this.firestore,`${this.dbDebtPath}/${debtId}`);
      return deleteDoc(debtDocRef);
    }

    getCopyDebts(copyTaxYearid: string) {
      return this.auth.getUser$().pipe(
        filter(isNotNullOrUndefined),
        map(({ uid: userId}) =>
          collection(this.firestore, `/users/${userId}/settings/${copyTaxYearid}/debtList`)
        ),
        switchMap(
          (debtCollection) =>
            collectionData(debtCollection, { idField: 'id' }) as Observable<Debt[]>
        )
      );
    }
    
    async updateDebtBalance(debtId: string, newbalance: number): Promise<void> {
      try {
        const debtDocRef = doc(this.firestore, `${this.dbDebtPath}/${debtId}`);
        await runTransaction(this.firestore, async (transaction) => {
            transaction.update(debtDocRef, { 
              balance: newbalance,
            });
        });
      } catch (error) {
        console.log('Transaction failed: ', error);
        throw error;
      }
    }

    getDebtTransactions(debtId: string) {
      return this.auth.getUser$().pipe(
        filter(isNotNullOrUndefined),
        map(({ uid: userId, displayName: taxyearid}) =>
          collection(this.firestore, `/users/${userId}/settings/${taxyearid}/debtList/${debtId}/transactions`)
        ),
        switchMap(
          (debtTransactionCollection) =>
            collectionData(query(debtTransactionCollection, orderBy('date', 'asc')), { idField: 'id'}) as Observable<Transaction[]>
        )
      );
    }

    getDebtTransaction(debtId: string, transactionId: string) {
      return this.auth.getUser$().pipe(
        filter(isNotNullOrUndefined),
        map(({ uid: userId, displayName: taxyearid }: User) =>
          doc(this.firestore, `/users/${userId}/settings/${taxyearid}/debtList/${debtId}/transactions/${transactionId}`)
        ),
        switchMap(
          (transactionDoc) =>
            docData(transactionDoc, { idField: 'id' }) as Observable<Transaction>
        )
      );
    }
  
    createDebtTransaction(debtId: string, debttransaction: Transaction) {
      const transactionCollection = collection(this.firestore,`${this.dbDebtPath}/${debtId}/transactions`);
        return addDoc(transactionCollection, debttransaction);
    }

    createDebtTransactionById(taxYearId: string, debtId: string, debttransaction: Transaction) {
      this.dbDebtPath = `/users/${this.userId}/settings/${taxYearId}/debtList`;
      const transactionCollection = collection(this.firestore,`${this.dbDebtPath}/${debtId}/transactions`);
        return addDoc(transactionCollection, debttransaction);
    }
    
    async updateDebtTransaction(debtId: string, transactionId: string, value: any): Promise<void> {
      try {
        const debtTransactionDocRef = doc(this.firestore, `${this.dbDebtPath}/${debtId}/transactions/${transactionId}`);
        await runTransaction(this.firestore, async (transaction) => {
            transaction.update(debtTransactionDocRef, value);
        });
      } catch (error) {
        console.log('Transaction failed: ', error);
        throw error;
      }
    }
    
    deleteDebtTransaction(debtId: string, transactionId: string): Promise<void> {
      const transactionDocRef = doc(this.firestore, `${this.dbDebtPath}/${debtId}/transactions/${transactionId}`);
      return deleteDoc(transactionDocRef);
    }

}
