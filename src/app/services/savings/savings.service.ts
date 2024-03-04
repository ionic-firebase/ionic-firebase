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
 import { Saving } from '../../models/saving';
 import { Transaction } from '../../models/transaction';
 import { isNotNullOrUndefined } from '../../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class SavingsService {
    private readonly auth = inject(AuthService);
    private readonly firestore = inject(Firestore);
    savingsArray: Saving[] = [];

    private userId = this.auth.getUser()?.uid ?? '';
    private taxyearid: string = this.auth.getUser()?.displayName ?? '';
    private dbSavingsPath = `/users/${this.userId}/settings/${this.taxyearid}/savingsList`;

    getRealtimeSavings(): Observable<Saving[]> {
      return new Observable((observer) => {
        this.savingsArray = [];
        const savingsList = query(collection(this.firestore,this.dbSavingsPath), 
        orderBy('name', 'asc'));
        const unsubscribe = onSnapshot(savingsList, (snapshot) => {
          let tempArray = snapshot.docChanges();
          if(!((tempArray.length == 1) && (tempArray[0].type == 'modified'))) {
            if(this.savingsArray?.length != 0) { 
              this.savingsArray = [];
            }
          }
          tempArray.forEach((change) => {
            let saving: any = change.doc.data();
            saving.id = change.doc.id;
            if(this.savingsArray?.length == 0) {
              this.savingsArray.push(saving);
            } else { 
              if (change.type === "added"){
                this.savingsArray.push(saving);
              }
              if (change.type === "modified") {
                const index = this.savingsArray.findIndex(x => x.id == saving.id);
                this.savingsArray[index] = saving;
              }
              if (change.type === "removed") {
                this.savingsArray = this.savingsArray.filter(x => x.id != saving.id);
              }
            }
          });
          observer.next(this.savingsArray);
        });
        return () => unsubscribe();
      });
    }

    getSaving(savingsId: string) {
      return this.auth.getUser$().pipe(
        filter(isNotNullOrUndefined),
        map(({ uid: userId, displayName: taxyearid }: User) =>
          doc(this.firestore, `/users/${userId}/settings/${taxyearid}/savingsList/${savingsId}`)
        ),
        switchMap(
          (savingsDoc) =>
            docData(savingsDoc, { idField: 'id' }) as Observable<Saving>
        )
      );
    }
  
    createSaving(savings: Partial<Saving>) {
      const savingsCollection = collection(this.firestore, `${this.dbSavingsPath}/`);
      return addDoc(savingsCollection, savings);
    }

    createSavingById(taxYearId: string, savings: Partial<Saving>) {
      this.dbSavingsPath = `/users/${this.userId}/settings/${taxYearId}/savingsList`;
      const savingsCollection = collection(this.firestore, `${this.dbSavingsPath}/`);
      return addDoc(savingsCollection, savings);
    }
    
    async updateSaving(savingsId: string, value: any): Promise<void> {
      try {
        const savingsDocRef = doc(this.firestore, `${this.dbSavingsPath}/${savingsId}`);
        await runTransaction(this.firestore, async (transaction) => {
            transaction.update(savingsDocRef, value);
        });
      } catch (error) {
        console.log('Transaction failed: ', error);
        throw error;
      }
    }
    
    deleteSaving(savingsId: string): Promise<void> {
      const savingsDocRef = doc(this.firestore,`${this.dbSavingsPath}/${savingsId}`);
      return deleteDoc(savingsDocRef);
    }

    getCopySavings(copyTaxYearid: string) {
      return this.auth.getUser$().pipe(
        filter(isNotNullOrUndefined),
        map(({ uid: userId}) =>
          collection(this.firestore, `/users/${userId}/settings/${copyTaxYearid}/savingsList`)
        ),
        switchMap(
          (savingsCollection) =>
            collectionData(savingsCollection, { idField: 'id' }) as Observable<Saving[]>
        )
      );
    }
    
    async updateSavingsBalance(savingsId: string, newbalance: number): Promise<void> {
      try {
        const savingsDocRef = doc(this.firestore, `${this.dbSavingsPath}/${savingsId}`);
        await runTransaction(this.firestore, async (transaction) => {
            transaction.update(savingsDocRef, { 
              balance: newbalance,
            });
        });
      } catch (error) {
        console.log('Transaction failed: ', error);
        throw error;
      }
    }

    getSavingTransactions(savingsId: string) {
      return this.auth.getUser$().pipe(
        filter(isNotNullOrUndefined),
        map(({ uid: userId, displayName: taxyearid}) =>
          collection(this.firestore, `/users/${userId}/settings/${taxyearid}/savingsList/${savingsId}/transactions`)
        ),
        switchMap(
          (savingsTransactionCollection) =>
            collectionData(query(savingsTransactionCollection, orderBy('date', 'asc')), { idField: 'id'}) as Observable<Transaction[]>
        )
      );
    }
    
    getSavingTransaction(savingsId: string, transactionId: string) {
      return this.auth.getUser$().pipe(
        filter(isNotNullOrUndefined),
        map(({ uid: userId, displayName: taxyearid }: User) =>
          doc(this.firestore, `/users/${userId}/settings/${taxyearid}/savingsList/${savingsId}/transactions/${transactionId}`)
        ),
        switchMap(
          (transactionDoc) =>
            docData(transactionDoc, { idField: 'id' }) as Observable<Transaction>
        )
      );
    }
    
    createSavingsTransaction(savingsId: string, savingstransaction: Transaction) {
      const transactionCollection = collection(this.firestore,`${this.dbSavingsPath}/${savingsId}/transactions`);
        return addDoc(transactionCollection, savingstransaction);
    }
    
    createSavingsTransactionById(taxYearId: string, savingsId: string, savingstransaction: Transaction) {
      this.dbSavingsPath = `/users/${this.userId}/settings/${taxYearId}/savingsList`;
      const transactionCollection = collection(this.firestore,`${this.dbSavingsPath}/${savingsId}/transactions`);
        return addDoc(transactionCollection, savingstransaction);
    }

    deleteSavingTransaction(savingsId: string, transactionId: string): Promise<void> {
      const transactionDocRef = doc(this.firestore, `${this.dbSavingsPath}/${savingsId}/transactions/${transactionId}`);
      return deleteDoc(transactionDocRef);
    }

}
