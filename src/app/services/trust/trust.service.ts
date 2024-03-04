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
import { filter, map, Observable, switchMap, take, BehaviorSubject } from 'rxjs';
import { AuthService } from '../user/auth.service';
import { Trust } from '../../models/trust';
import { isNotNullOrUndefined } from '../../shared/utils';

@Injectable({
  providedIn: 'root'
})

export class TrustService {
    private readonly auth = inject(AuthService);
    private readonly firestore = inject(Firestore);
    trustArray: Trust[] = [];
    trustPortfolioArray: Trust[] = [];

    userId = this.auth.getUser()?.uid ?? '';
    taxyearid: string = this.auth.getUser()?.displayName ?? '';
    private dbTrustPath = `/users/${this.userId}/settings/${this.taxyearid}/trustList`;
    public onTrustReceived = new BehaviorSubject<Trust[]>([]);
    castTrustList = this.onTrustReceived.asObservable();

    createTrust(trust: Partial<Trust>) {
        const trustCollection = collection(this.firestore, this.dbTrustPath);
        return addDoc(trustCollection, trust);
    }

    createTrustById(taxYearId: string, trust: Partial<Trust>) {
        this.dbTrustPath = `/users/${this.userId}/settings/${taxYearId}/trustList`;
        const trustCollection = collection(this.firestore, this.dbTrustPath);
        return addDoc(trustCollection, trust);
    }

    getTrust(trustId: string) {
        return this.auth.getUser$().pipe(
          filter(isNotNullOrUndefined),
          map(({ uid: userId, displayName: taxyearid }: User) =>
            doc(this.firestore, `/users/${userId}/settings/${taxyearid}/trustList/${trustId}`)
          ),
          switchMap(
            (trustDoc) =>
              docData(trustDoc, { idField: 'id' }) as Observable<Trust>
          )
        );
    }

    getRealtimeTrustListAll(): Observable<Trust[]> {
      return new Observable((trusts) => {
        this.trustArray = [];
        const trustList = query(collection(this.firestore,this.dbTrustPath), 
        orderBy('name', 'asc'));
        const unsubscribe = onSnapshot(trustList, (snapshot) => {
          let tempArray = snapshot.docChanges();
          if(!((tempArray.length == 1) && (tempArray[0].type == 'modified'))) {
            if(this.trustArray?.length != 0) { 
              this.trustArray = [];
            }
          }
          tempArray.forEach((change) => {
            let trust: any = change.doc.data();
            trust.id = change.doc.id;
            if(this.trustArray?.length == 0) {
              this.trustArray.push(trust);
            } else { 
              if (change.type === "added"){
                this.trustArray.push(trust);
              }
              if (change.type === "modified") {
                const index = this.trustArray.findIndex(x => x.id == trust.id);
                this.trustArray[index] = trust;
              }
              if (change.type === "removed") {
                this.trustArray = this.trustArray.filter(x => x.id != trust.id);
              }
            }
          });
          trusts.next(this.trustArray);
        });
        return () => unsubscribe();
      });
    }

    getTrustListByPortfolioId(portfolioid: string) {
      return this.auth.getUser$().pipe(
        filter(isNotNullOrUndefined),
        map(({ uid: userId, displayName: taxyearid}) =>
          collection(this.firestore, `/users/${userId}/settings/${taxyearid}/trustList`)
        ),
        switchMap(
          (trustCollection) =>
          collectionData(query(query(trustCollection, where('parentid', '==', portfolioid)), orderBy('name', 'asc')), { idField: 'id' }) as Observable<Trust[]>
          )
      );
    }
  
/*    getRealtimeTrustListByPortfolioId(portfolioid: string): Observable<Trust[]> {
      return new Observable((trustsByPortfolio) => {
        this.trustPortfolioArray = [];
        const trustPortfolioList = query(collection(this.firestore,this.dbTrustPath), 
        where('parentid', '==', portfolioid), orderBy('name', 'asc'));
        const unsubscribe = onSnapshot(trustPortfolioList, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
              let trustPortfolio: any = change.doc.data();
              trustPortfolio.id = change.doc.id;
              let index = this.trustArray.findIndex(x => x.id == trustPortfolio.id);
              if (change.type === "added" && index === -1){
                this.trustPortfolioArray.push(trustPortfolio);
              }
              if (change.type === "modified") {
                const index = this.trustArray.findIndex(x => x.id == trustPortfolio.id);
                this.trustPortfolioArray[index] = trustPortfolio;
              }
              if (change.type === "removed") {
                this.trustPortfolioArray = this.trustPortfolioArray.filter(x => x.id != trustPortfolio.id);
              }
          });
          trustsByPortfolio.next(this.trustPortfolioArray);
        });
        return () => unsubscribe();
      });
    } */

    async updateTrust(trustId: string, value: any): Promise<void> {
        try {
          const trustDocRef = doc(this.firestore, `${this.dbTrustPath}/${trustId}`);
          await runTransaction(this.firestore, async (transaction) => {
              transaction.update(trustDocRef, value);
          });    
        } catch (error) {
          console.log('Transaction failed: ', error);
          throw error;
        }
    }

    async updateQuantity(
        trustId: string,
        newQuantity: number
    ) {
        try {
            const trustDocRef = doc(this.firestore, `${this.dbTrustPath}/${trustId}`);
            await runTransaction(this.firestore, async (transaction) => {
                transaction.update(trustDocRef, { 
                    quantity: newQuantity,
                });
            });
        } catch (error) {
            console.log('Transaction failed: ', error);
            throw error;
        }
    }

    async updateCurrentPrice(
        trustId: string,
        newPrice: number
    ) {
        try {
            const trustDocRef = doc(this.firestore, `${this.dbTrustPath}/${trustId}`);
            await runTransaction(this.firestore, async (transaction) => {
                transaction.update(trustDocRef, { 
                    currentprice: newPrice,
                });
            });
        } catch (error) {
            console.log('Transaction failed: ', error);
            throw error;
        }
    }

    async updateCurrentYield(
      trustId: string,
      trustyield: number
  ) {
      try {
          const trustDocRef = doc(this.firestore, `${this.dbTrustPath}/${trustId}`);
          await runTransaction(this.firestore, async (transaction) => {
              transaction.update(trustDocRef, { 
                trustyield: trustyield,
              });
          });
      } catch (error) {
          console.log('Transaction failed: ', error);
          throw error;
      }
  }

    async deleteTrust(trustId: string): Promise<void> {
        const trustDocRef = doc(this.firestore, `${this.dbTrustPath}/${trustId}`);
        return await deleteDoc(trustDocRef);
    }

    getCopyTrustsList(portfolioId: string, copyTaxYearid: string) {
        return this.auth.getUser$().pipe(
          filter(isNotNullOrUndefined),
          map(({ uid: userId}) =>
            collection(this.firestore, `/users/${userId}/settings/${copyTaxYearid}/trustList`)
          ),
          switchMap(
            (trustCollection) =>
              collectionData(query(trustCollection, where('parentid', '==', portfolioId)), { idField: 'id' }) as Observable<Trust[]>
          )
        );
      }
}
