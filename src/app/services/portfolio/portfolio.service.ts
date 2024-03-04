import { inject, Injectable } from '@angular/core';
import { 
    addDoc,
    collection, 
    collectionData, 
    deleteDoc,
    doc,
    docData,
    DocumentSnapshot,
    Firestore,
    runTransaction,
    orderBy,
    updateDoc,
    query,
    onSnapshot,
 } from '@angular/fire/firestore';
 import { User } from '@angular/fire/auth';
 import { BehaviorSubject, filter, map, Observable, switchMap } from 'rxjs';
 import { AuthService } from '../user/auth.service';
 import { Portfolio } from '../../models/portfolio';
 import { Transaction } from '../../models/transaction';
 import { isNotNullOrUndefined } from '../../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private readonly auth = inject(AuthService);
  private readonly firestore = inject(Firestore);
  private _portfolios = new BehaviorSubject<Portfolio[]>([]);

  portfolioArray: Portfolio[] = [];

  userId = this.auth.getUser()?.uid ?? '';
  taxyearid: string = this.auth.getUser()?.displayName ?? '';
  private dbPortfolioPath = `/users/${this.userId}/settings/${this.taxyearid}/portfolioList`;

  get portfolios() {
    return this._portfolios.asObservable();
  }

  getRealtimePortfolios(): Observable<Portfolio[]> {
    return new Observable((observer) => {
      const portfolioList = query(collection(this.firestore,this.dbPortfolioPath), 
      orderBy('name', 'asc'));
      const unsubscribe = onSnapshot(portfolioList, (snapshot) => {
        let tempArray = snapshot.docChanges();
        if(!((tempArray.length == 1) && (tempArray[0].type == 'modified'))) {
          if(this.portfolioArray?.length != 0) {
            this.portfolioArray = [];
          }
        }
        tempArray.forEach((change) => {
          let portfolio: any = change.doc.data();
          portfolio.id = change.doc.id;
          if(this.portfolioArray?.length == 0) {
            this.portfolioArray.push(portfolio);
          } else {       
            if(change.type === "added") {
                this.portfolioArray.push(portfolio);
            }
            if (change.type === "modified") {
              const index = this.portfolioArray.findIndex(x => x.id == portfolio.id);
              this.portfolioArray[index] = portfolio;
            }
            if (change.type === "removed") {
              this.portfolioArray = this.portfolioArray.filter(x => x.id != portfolio.id);
            }
          }
        });
        observer.next(this.portfolioArray);
      });
      return () => unsubscribe();
    });
  }

  getPortfolio(portfolioId: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId, displayName: taxyearid }: User) =>
        doc(this.firestore, `${this.dbPortfolioPath}/${portfolioId}`)
      ),
      switchMap(
        (portfolioDoc) =>
          docData(portfolioDoc, { idField: 'id' }) as Observable<Portfolio>
      )
    );
  }

  createPortfolio(portfolio: Partial<Portfolio>) {
    const portfolioCollection = collection(this.firestore, `${this.dbPortfolioPath}/`);
    return addDoc(portfolioCollection, portfolio);
  }

  createPortfolioById(taxYearId: string, portfolio: Partial<Portfolio>) {
    const portfolioCollection = collection(this.firestore, `${this.dbPortfolioPath}/`);
    return addDoc(portfolioCollection, portfolio);
  }

  async updatePortfolio(portfolioId: string, value: any): Promise<void> {
    try {
      const portfolioDocRef = doc(this.firestore, `${this.dbPortfolioPath}/${portfolioId}`);
      await runTransaction(this.firestore, async (transaction) => {
          const portfolioDoc = (await transaction.get(portfolioDocRef)
          ) as DocumentSnapshot<Portfolio>;
          const portfolio = portfolioDoc.data() as Portfolio;
          transaction.update(portfolioDocRef, value);
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  deletePortfolio(portfolioId: string): Promise<void> {
    const portfolioDocRef = doc(this.firestore,`${this.dbPortfolioPath}/${portfolioId}`);
    return deleteDoc(portfolioDocRef);
  }

  getCopyPortfolios(copyTaxYearid: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId}) =>
        collection(this.firestore, `/users/${userId}/settings/${copyTaxYearid}/portfolioList`)
      ),
      switchMap(
        (portfoliosCollection) =>
          collectionData(portfoliosCollection, { idField: 'id' }) as Observable<Portfolio[]>
      )
    );
  }

  async updatePortfolioCashBalance(portfolioId: string, balance: number): Promise<void> {
    try {
      const portfolioCashBalanceDocRef = doc(this.firestore, `${this.dbPortfolioPath}/${portfolioId}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(portfolioCashBalanceDocRef, { 
            balance: balance,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updatePortfolioStocksBalance(portfolioId: string, stocksbalance: number): Promise<void> {
    try {    
      const portfolioStockBalanceDocRef = doc(this.firestore, `${this.dbPortfolioPath}/${portfolioId}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(portfolioStockBalanceDocRef, { 
            stocksbalance: stocksbalance,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updatePortfolioInitialStocksBalance(portfolioId: string, initialstocksbalance: number): Promise<void> {
    try {
      const portfolioInitialStocksBalancesDocRef = doc(this.firestore, `${this.dbPortfolioPath}/${portfolioId}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(portfolioInitialStocksBalancesDocRef, { 
            initialstocksbalance: initialstocksbalance,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updatePortfolioTrustsBalance(portfolioId: string, trustsbalance: number): Promise<void> {
    try {
      const portfolioTrustBalanceDocRef = doc(this.firestore, `${this.dbPortfolioPath}/${portfolioId}`);

      await updateDoc(portfolioTrustBalanceDocRef, { 
            trustsbalance: trustsbalance
          });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updatePortfolioInitialTrustsBalance(portfolioId: string, initialtrustsbalance: number): Promise<void> {
    try {
      const portfolioInitialTrustsBalanceDocRef = doc(this.firestore, `${this.dbPortfolioPath}/${portfolioId}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(portfolioInitialTrustsBalanceDocRef, { 
            initialtrustsbalance: initialtrustsbalance,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  getPortfolioTransactions(portfolioId: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId, displayName: taxyearid}) =>
        collection(this.firestore, `/users/${userId}/settings/${taxyearid}/portfolioList/${portfolioId}/transactions`)
      ),
      switchMap(
        (portfolioTransactionCollection) =>
          collectionData(query(portfolioTransactionCollection, orderBy('date', 'asc')), { idField: 'id'}) as Observable<Transaction[]>
      )
    );
  }

  getPortfolioTransaction(portfolioId: string, transactionId: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId, displayName: taxyearid }: User) =>
        doc(this.firestore, `/users/${userId}/settings/${taxyearid}/portfolioList/${portfolioId}/transactions/${transactionId}`)
      ),
      switchMap(
        (transactionDoc) =>
          docData(transactionDoc, { idField: 'id' }) as Observable<Transaction>
      )
    );
  }

  createPortfolioTransaction(portfolioId: string, portfoliotransaction: Transaction) {
    const transactionCollection = collection(this.firestore,`${this.dbPortfolioPath}/${portfolioId}/transactions`);
    return addDoc(transactionCollection, portfoliotransaction);
  }

  createPortfolioTransactionById(taxYearId: string, portfolioId: string, portfoliotransaction: Transaction) {
    this.dbPortfolioPath = `/users/${this.userId}/settings/${taxYearId}/portfolioList`;
    const transactionCollection = collection(this.firestore,`${this.dbPortfolioPath}/${portfolioId}/transactions`);
    return addDoc(transactionCollection, portfoliotransaction);
  }

  async updatePortfolioTransaction(portfolioId: string, transactionId: string, value: any): Promise<void> {
    try {
      const portfolioTransactionDocRef = doc(this.firestore, `${this.dbPortfolioPath}/${portfolioId}/transactions/${transactionId}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(portfolioTransactionDocRef, value);
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  deletePortfolioTransaction(portfolioId: string, transactionId: string): Promise<void> {
    const transactionDocRef = doc(this.firestore, `${this.dbPortfolioPath}/${portfolioId}/transactions/${transactionId}`);
    return deleteDoc(transactionDocRef);
  }
}


