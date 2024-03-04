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
    where,
    orderBy,
    query,
    onSnapshot,
 } from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';
import { filter, map, Observable, switchMap } from 'rxjs';
import { AuthService } from '../user/auth.service';
import { Stock } from '../../models/stock';
import { isNotNullOrUndefined } from '../../shared/utils';

@Injectable({
  providedIn: 'root'
})

export class StockService {
    private readonly auth = inject(AuthService);
    private readonly firestore = inject(Firestore);
    stockPortfolioArray: Stock[] = [];
    stockArray: Stock[] = [];

    userId = this.auth.getUser()?.uid ?? '';
    taxyearid: string = this.auth.getUser()?.displayName ?? '';
    private dbStockPath = `/users/${this.userId}/settings/${this.taxyearid}/stockList`;

    createStock(stock: Partial<Stock>) {
        const stockCollection = collection(this.firestore, this.dbStockPath);
        return addDoc(stockCollection, stock);
    }

    createStockById(taxYearId: string, stock: Partial<Stock>) {
        this.dbStockPath = `/users/${this.userId}/settings/${taxYearId}/stockList`;
        const stockCollection = collection(this.firestore, this.dbStockPath);
        return addDoc(stockCollection, stock);
    }

    getStock(stockId: string) {
        return this.auth.getUser$().pipe(
          filter(isNotNullOrUndefined),
          map(({ uid: userId, displayName: taxyearid }: User) =>
            doc(this.firestore, `/users/${userId}/settings/${taxyearid}/stockList/${stockId}`)
          ),
          switchMap(
            (stockDoc) =>
              docData(stockDoc, { idField: 'id' }) as Observable<Stock>
          )
        );
    }

    getRealtimeStockListAll(): Observable<Stock[]> {
      return new Observable((stocks) => {
        this.stockArray = [];
        const stockList = query(collection(this.firestore,this.dbStockPath), 
        orderBy('name', 'asc'));
        const unsubscribe = onSnapshot(stockList, (snapshot) => {
          let tempArray = snapshot.docChanges();
          if(!((tempArray.length == 1) && (tempArray[0].type == 'modified'))) {
            if(this.stockArray?.length != 0) { 
              this.stockArray = [];
            }
          }
          tempArray.forEach((change) => {
            let stock: any = change.doc.data();
            stock.id = change.doc.id;
            if(this.stockArray?.length == 0) {
              this.stockArray.push(stock);
            } else { 
              if (change.type === "added"){
                this.stockArray.push(stock);
              }
              if (change.type === "modified") {
                const index = this.stockArray.findIndex(x => x.id == stock.id);
                this.stockArray[index] = stock;
              }
              if (change.type === "removed") {
                this.stockArray = this.stockArray.filter(x => x.id != stock.id);
              }
            }
          });
          stocks.next(this.stockArray);
        });
        return () => unsubscribe();
      });
    }

    getStockListByPortfolioId(portfolioid: string) {
        return this.auth.getUser$().pipe(
          filter(isNotNullOrUndefined),
          map(({ uid: userId, displayName: taxyearid}) =>
            collection(this.firestore, `/users/${userId}/settings/${taxyearid}/stockList`)
          ),
          switchMap(
            (stockCollection) =>
              collectionData(query(stockCollection, where('parentid', '==', portfolioid), orderBy('name', 'asc')), { idField: 'id' }) as Observable<Stock[]>
          )
        );
    }

/*    getRealtimeStockListByPortfolioId(portfolioid: string): Observable<Stock[]> {
      return new Observable((stocksByPortfolio) => {
        this.stockPortfolioArray = [];
        const stockPortfolioList = query(collection(this.firestore,this.dbStockPath), 
        where('parentid', '==', portfolioid), orderBy('name', 'asc'));
        const unsubscribe = onSnapshot(stockPortfolioList, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
              let stockPortfolio: any = change.doc.data();
              stockPortfolio.id = change.doc.id;
              let index = this.stockArray.findIndex(x => x.id == stockPortfolio.id);
              if (change.type === "added" && index === -1){
                this.stockPortfolioArray.push(stockPortfolio);
              }
              if (change.type === "modified") {
                const index = this.stockArray.findIndex(x => x.id == stockPortfolio.id);
                this.stockPortfolioArray[index] = stockPortfolio;
              }
              if (change.type === "removed") {
                this.stockPortfolioArray = this.stockPortfolioArray.filter(x => x.id != stockPortfolio.id);
              }
          });
          stocksByPortfolio.next(this.stockPortfolioArray);
        });
        return () => unsubscribe();
      });
    } */

    async updateStock(stockId: string, value: any): Promise<void> {
        try {
          const stockDocRef = doc(this.firestore, `${this.dbStockPath}/${stockId}`);
          await runTransaction(this.firestore, async (transaction) => {
              transaction.update(stockDocRef, value);
          });    
        } catch (error) {
          console.log('Transaction failed: ', error);
          throw error;
        }
    }

    async updateQuantity(
        stockId: string,
        newQuantity: number
    ) {
        try {
            const stockDocRef = doc(this.firestore, `${this.dbStockPath}/${stockId}`);
            await runTransaction(this.firestore, async (transaction) => {
                transaction.update(stockDocRef, { 
                    quantity: newQuantity,
                });
            });
        } catch (error) {
            console.log('Transaction failed: ', error);
            throw error;
        }
    }

    async updateCurrentPrice(
        stockId: string,
        newPrice: number
    ) {
        try {
            const stockDocRef = doc(this.firestore, `${this.dbStockPath}/${stockId}`);
            await runTransaction(this.firestore, async (transaction) => {
                transaction.update(stockDocRef, { 
                    currentprice: newPrice,
                });
            });
        } catch (error) {
            console.log('Transaction failed: ', error);
            throw error;
        }
    }

    async updateCurrentYield(
      stockId: string,
      stockyield: number
  ) {
      try {
          const stockDocRef = doc(this.firestore, `${this.dbStockPath}/${stockId}`);
          await runTransaction(this.firestore, async (transaction) => {
              transaction.update(stockDocRef, { 
                  stockyield: stockyield,
              });
          });
      } catch (error) {
          console.log('Transaction failed: ', error);
          throw error;
      }
  }

    async deleteStock(stockId: string): Promise<void> {
        const stockDocRef = doc(this.firestore, `${this.dbStockPath}/${stockId}`);
        return await deleteDoc(stockDocRef);
    }

    getCopyStocksList(portfolioId: string, copyTaxYearid: string) {
        return this.auth.getUser$().pipe(
          filter(isNotNullOrUndefined),
          map(({ uid: userId}) =>
            collection(this.firestore, `/users/${userId}/settings/${copyTaxYearid}/bondList`)
          ),
          switchMap(
            (stockCollection) =>
              collectionData(query(stockCollection, where('parentid', '==', portfolioId)), { idField: 'id' }) as Observable<Stock[]>
          )
        );
    }
}
