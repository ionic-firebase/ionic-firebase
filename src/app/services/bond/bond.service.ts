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
 import { Bond } from '../../models/bond';
 import { Transaction } from '../../models/transaction';
 import { isNotNullOrUndefined } from '../../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class BondService {
  private readonly auth = inject(AuthService);
  private readonly firestore = inject(Firestore);
  bondArray: Bond[] = [];

  private userId = this.auth.getUser()?.uid ?? '';
  private taxyearid: string = this.auth.getUser()?.displayName ?? '';
  private dbBondPath = `/users/${this.userId}/settings/${this.taxyearid}/bondList`;

  getRealtimeBonds(): Observable<Bond[]> {
    return new Observable((bonds) => {
      this.bondArray = [];
      const bondList = query(collection(this.firestore,this.dbBondPath), 
      orderBy('name', 'asc'));
      const unsubscribe = onSnapshot(bondList, (snapshot) => {
        let tempArray = snapshot.docChanges();
        if(!((tempArray.length == 1) && (tempArray[0].type == 'modified'))) {
          if(this.bondArray?.length != 0) { 
            this.bondArray = [];
          }
        }
        tempArray.forEach((change) => {
          let bond: any = change.doc.data();
          bond.id = change.doc.id;
          if(this.bondArray?.length == 0) {
            this.bondArray.push(bond);
          } else {
            if (change.type === "added"){
              this.bondArray.push(bond);
            }
            if (change.type === "modified") {
              const index = this.bondArray.findIndex(x => x.id == bond.id);
              this.bondArray[index] = bond;
            }
            if (change.type === "removed") {
              this.bondArray = this.bondArray.filter(x => x.id != bond.id);
            }
          }
        });
        bonds.next(this.bondArray);
      });
      return () => unsubscribe();
    });
  }

  getBond(bondId: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId, displayName: taxyearid }: User) =>
        doc(this.firestore, `/users/${userId}/settings/${taxyearid}/bondList/${bondId}`)
      ),
      switchMap(
        (bondDoc) =>
          docData(bondDoc, { idField: 'id' }) as Observable<Bond>
      )
    );
  }

  createBond(bond: Partial<Bond>) {
    const bondCollection = collection(this.firestore, `${this.dbBondPath}/`);
    return addDoc(bondCollection, bond);
  }
  
  createBondById(taxYearId: string, bond: Partial<Bond>) {
    this.dbBondPath = `/users/${this.userId}/settings/${taxYearId}/bondList`;
    const bondCollection = collection(this.firestore, `${this.dbBondPath}/`);
    return addDoc(bondCollection, bond);
  }

  async updateBond(bondId: string, value: any): Promise<void> {
    try {
      const bondDocRef = doc(this.firestore, `${this.dbBondPath}/${bondId}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(bondDocRef, value);
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }
  
  deleteBond(bondId: string): Promise<void> {
    const bondDocRef = doc(this.firestore,`${this.dbBondPath}/${bondId}`);
    return deleteDoc(bondDocRef);
  }

  getCopyBonds(copyTaxYearid: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId}) =>
        collection(this.firestore, `/users/${userId}/settings/${copyTaxYearid}/bondList`)
      ),
      switchMap(
        (bondCollection) =>
          collectionData(bondCollection, { idField: 'id' }) as Observable<Bond[]>
      )
    );
  }
  
  async updateBondBalance(bondId: string, newbalance: number): Promise<void> {
    try {
      const bondDocRef = doc(this.firestore, `${this.dbBondPath}/${bondId}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(bondDocRef, { 
            balance: newbalance,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  getBondTransactions(bondId: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId, displayName: taxyearid}) =>
        collection(this.firestore, `/users/${userId}/settings/${taxyearid}/bondList/${bondId}/transactions`)
      ),
      switchMap(
        (bondTransactionCollection) =>
          collectionData(query(bondTransactionCollection, orderBy('date', 'asc')), { idField: 'id'}) as Observable<Transaction[]>
      )
    );
  }

  getBondTransaction(bondId: string, transactionId: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId, displayName: taxyearid }: User) =>
        doc(this.firestore, `/users/${userId}/settings/${taxyearid}/bondList/${bondId}/transactions/${transactionId}`)
      ),
      switchMap(
        (transactionDoc) =>
          docData(transactionDoc, { idField: 'id' }) as Observable<Transaction>
      )
    );
  }

  createBondTransaction(bondId: string, bondtransaction: Transaction) {
    const transactionCollection = collection(this.firestore,`${this.dbBondPath}/${bondId}/transactions`);
      return addDoc(transactionCollection, bondtransaction);
  }

  createBondTransactionById(taxYearId: string, bondId: string, bondtransaction: Transaction) {
    this.dbBondPath = `/users/${this.userId}/settings/${taxYearId}/bondList`;
    const transactionCollection = collection(this.firestore,`${this.dbBondPath}/${bondId}/transactions`);
      return addDoc(transactionCollection, bondtransaction);
  }
  
  async updateBondTransaction(bondId: string, transactionId: string, value: any): Promise<void> {
    try {
      const bondTransactionDocRef = doc(this.firestore, `${this.dbBondPath}/${bondId}/transactions/${transactionId}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(bondTransactionDocRef, value);
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }
  
  deleteBondTransaction(bondId: string, transactionId: string): Promise<void> {
    const transactionDocRef = doc(this.firestore, `${this.dbBondPath}/${bondId}/transactions/${transactionId}`);
    return deleteDoc(transactionDocRef);
  }

}
