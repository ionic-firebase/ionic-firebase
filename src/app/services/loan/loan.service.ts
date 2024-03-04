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
 import { Loan } from '../../models/loan';
 import { Transaction } from '../../models/transaction';
 import { isNotNullOrUndefined } from '../../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
    private readonly auth = inject(AuthService);
    private readonly firestore = inject(Firestore);
    loanArray: Loan[] = [];

    private userId = this.auth.getUser()?.uid ?? '';
    private taxyearid: string = this.auth.getUser()?.displayName ?? '';
    private dbLoanPath = `/users/${this.userId}/settings/${this.taxyearid}/loanList`;

    getRealtimeLoans(): Observable<Loan[]> {
      return new Observable((loans) => {
        this.loanArray = [];
        const loanList = query(collection(this.firestore,this.dbLoanPath), 
        orderBy('name', 'asc'));
        const unsubscribe = onSnapshot(loanList, (snapshot) => {
          let tempArray = snapshot.docChanges();
          if(!((tempArray.length == 1) && (tempArray[0].type == 'modified'))) {
            if(this.loanArray?.length != 0) { 
              this.loanArray = [];
            }
          }
          tempArray.forEach((change) => {
            let loan: any = change.doc.data();
            loan.id = change.doc.id;
            if(this.loanArray?.length == 0) {
              this.loanArray.push(loan);
            } else { 
              if (change.type === "added"){
                this.loanArray.push(loan);
              }
              if (change.type === "modified") {
                const index = this.loanArray.findIndex(x => x.id == loan.id);
                this.loanArray[index] = loan;
              }
              if (change.type === "removed") {
                this.loanArray = this.loanArray.filter(x => x.id != loan.id);
              }
            }
          });
          loans.next(this.loanArray);
        });
        return () => unsubscribe();
      });
    }

    getLoan(loanId: string) {
      return this.auth.getUser$().pipe(
        filter(isNotNullOrUndefined),
        map(({ uid: userId, displayName: taxyearid }: User) =>
          doc(this.firestore, `/users/${userId}/settings/${taxyearid}/loanList/${loanId}`)
        ),
        switchMap(
          (loanDoc) =>
            docData(loanDoc, { idField: 'id' }) as Observable<Loan>
        )
      );
    }
  
    createLoan(loan: Partial<Loan>) {
      const loanCollection = collection(this.firestore, `${this.dbLoanPath}/`);
      return addDoc(loanCollection, loan);
    }
  
    createLoanById(taxYearId: string, loan: Partial<Loan>) {
      this.dbLoanPath = `/users/${this.userId}/settings/${taxYearId}/loanList`;
      const loanCollection = collection(this.firestore, `${this.dbLoanPath}/`);
      return addDoc(loanCollection, loan);
    }
    
    async updateLoan(loanId: string, value: any): Promise<void> {
      try {
        const loanDocRef = doc(this.firestore, `${this.dbLoanPath}/${loanId}`);
        await runTransaction(this.firestore, async (transaction) => {
            transaction.update(loanDocRef, value);
        });
      } catch (error) {
        console.log('Transaction failed: ', error);
        throw error;
      }
    }
    
    deleteLoan(loanId: string): Promise<void> {
      const loanDocRef = doc(this.firestore,`${this.dbLoanPath}/${loanId}`);
      return deleteDoc(loanDocRef);
    }

    getCopyLoans(copyTaxYearid: string) {
      return this.auth.getUser$().pipe(
        filter(isNotNullOrUndefined),
        map(({ uid: userId}) =>
          collection(this.firestore, `/users/${userId}/settings/${copyTaxYearid}/loanList`)
        ),
        switchMap(
          (loanCollection) =>
            collectionData(loanCollection, { idField: 'id' }) as Observable<Loan[]>
        )
      );
    }
    
    async updateLoanBalance(loanId: string, newbalance: number): Promise<void> {
      try {
        const loanDocRef = doc(this.firestore, `${this.dbLoanPath}/${loanId}`);
        await runTransaction(this.firestore, async (transaction) => {
            transaction.update(loanDocRef, { 
              balance: newbalance,
            });
        });
      } catch (error) {
        console.log('Transaction failed: ', error);
        throw error;
      }
    }

    getLoanTransactions(loanId: string) {
      return this.auth.getUser$().pipe(
        filter(isNotNullOrUndefined),
        map(({ uid: userId, displayName: taxyearid}) =>
          collection(this.firestore, `/users/${userId}/settings/${taxyearid}/loanList/${loanId}/transactions`)
        ),
        switchMap(
          (loanTransactionCollection) =>
            collectionData(query(loanTransactionCollection, orderBy('date', 'asc')), { idField: 'id'}) as Observable<Transaction[]>
        )
      );
    }
  
    getLoanTransaction(loanId: string, transactionId: string) {
      return this.auth.getUser$().pipe(
        filter(isNotNullOrUndefined),
        map(({ uid: userId, displayName: taxyearid }: User) =>
          doc(this.firestore, `/users/${userId}/settings/${taxyearid}/loanList/${loanId}/transactions/${transactionId}`)
        ),
        switchMap(
          (transactionDoc) =>
            docData(transactionDoc, { idField: 'id' }) as Observable<Transaction>
        )
      );
    }

    createLoanTransaction(loanId: string, loantransaction: Transaction) {
      const transactionCollection = collection(this.firestore,`${this.dbLoanPath}/${loanId}/transactions`);
        return addDoc(transactionCollection, loantransaction);
    }

    createLoanTransactionById(taxYearId: string, loanId: string, loantransaction: Transaction) {
      this.dbLoanPath = `/users/${this.userId}/settings/${taxYearId}/loanList`;
      const transactionCollection = collection(this.firestore,`${this.dbLoanPath}/${loanId}/transactions`);
        return addDoc(transactionCollection, loantransaction);
    }
    
    async updateLoanTransaction(loanId: string, transactionId: string, value: any): Promise<void> {
      try {
        const loanTransactionDocRef = doc(this.firestore, `${this.dbLoanPath}/${loanId}/transactions/${transactionId}`);
        await runTransaction(this.firestore, async (transaction) => {
            transaction.update(loanTransactionDocRef, value);
        });
      } catch (error) {
        console.log('Transaction failed: ', error);
        throw error;
      }
    }
    
    deleteLoanTransaction(loanId: string, transactionId: string): Promise<void> {
      const transactionDocRef = doc(this.firestore, `${this.dbLoanPath}/${loanId}/transactions/${transactionId}`);
      return deleteDoc(transactionDocRef);
    }

}
