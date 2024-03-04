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
 import { Property } from '../../models/property';
 import { Transaction } from '../../models/transaction';
 import { isNotNullOrUndefined } from '../../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private readonly auth = inject(AuthService);
  private readonly firestore = inject(Firestore);
  propertyArray: Property[] = [];

  private userId = this.auth.getUser()?.uid ?? '';
  private taxyearid: string = this.auth.getUser()?.displayName ?? '';
  private dbPropertyPath = `/users/${this.userId}/settings/${this.taxyearid}/propertyList`;

  getRealtimeProperties(): Observable<Property[]> {
    return new Observable((properties) => {
      this.propertyArray = [];
      const propertyList = query(collection(this.firestore,this.dbPropertyPath), 
      orderBy('name', 'asc'));
      const unsubscribe = onSnapshot(propertyList, (snapshot) => {
        let tempArray = snapshot.docChanges();
        if(!((tempArray.length == 1) && (tempArray[0].type == 'modified'))) {
          if(this.propertyArray?.length != 0) { 
            this.propertyArray = [];
          }
        }
        tempArray.forEach((change) => {
          let property: any = change.doc.data();
          property.id = change.doc.id;
          if(this.propertyArray?.length == 0) {
            this.propertyArray.push(property);
          } else { 
            if (change.type === "added"){
              this.propertyArray.push(property);
            }
            if (change.type === "modified") {
              const index = this.propertyArray.findIndex(x => x.id == property.id);
              this.propertyArray[index] = property;
            }
            if (change.type === "removed") {
              this.propertyArray = this.propertyArray.filter(x => x.id != property.id);
            }
          }
        });
        properties.next(this.propertyArray);
      });
      return () => unsubscribe();
    });
  }

  getProperty(propertyId: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId, displayName: taxyearid }: User) =>
        doc(this.firestore, `/users/${userId}/settings/${taxyearid}/propertyList/${propertyId}`)
      ),
      switchMap(
        (propertyDoc) =>
          docData(propertyDoc, { idField: 'id' }) as Observable<Property>
      )
    );
  }

  createProperty(property: Partial<Property>) {
    const propertyCollection = collection(this.firestore, `${this.dbPropertyPath}/`);
    return addDoc(propertyCollection, property);
  }

  createPropertyById(taxYearId: string, property: Partial<Property>) {
    this.dbPropertyPath = `/users/${this.userId}/settings/${taxYearId}/propertyList`;
    const propertyCollection = collection(this.firestore, `${this.dbPropertyPath}/`);
    return addDoc(propertyCollection, property);
  }
  
  async updateProperty(propertyId: string, value: any): Promise<void> {
    try {
      const propertyDocRef = doc(this.firestore, `${this.dbPropertyPath}/${propertyId}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(propertyDocRef, value);
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }
  
  deleteProperty(propertyId: string): Promise<void> {
    const propertyDocRef = doc(this.firestore,`${this.dbPropertyPath}/${propertyId}`);
    return deleteDoc(propertyDocRef);
  }

  getcopyProperties(copyTaxYearid: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId}) =>
        collection(this.firestore, `/users/${userId}/settings/${copyTaxYearid}/propertyList`)
      ),
      switchMap(
        (propertyCollection) =>
          collectionData(propertyCollection, { idField: 'id' }) as Observable<Property[]>
      )
    );
  }
  
  async updatePropertyBalances(propertyId: string, newbalances: any): Promise<void> {
    try {
      const propertyDocRef = doc(this.firestore, `${this.dbPropertyPath}/${propertyId}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(propertyDocRef, { 
            currentcashbalance: newbalances.currentcashbalance,
            actualmortgage: newbalances.actualmortgage,
            actualmanagement: newbalances. actualmanagement,
            actualrates: newbalances.actualrates,
            actualmaintenance: newbalances.actualmaintenance,
            actualinsurance: newbalances.actualinsurance,
            actualutilities: newbalances.actualutilities,
            actualothercosts: newbalances.actualothercosts,
            actualrentalincome: newbalances.actualrentalincome,
            actualotherincome: newbalances.actualotherincome,
            actualannualincome: newbalances.actualannualincome
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updatePropertyBalance(propertyId: string, newbalance: number): Promise<void> {
    try {
      const propertyDocRef = doc(this.firestore, `${this.dbPropertyPath}/${propertyId}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(propertyDocRef, { 
            currentcashbalance: newbalance,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  getPropertyTransactions(propertyId: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId, displayName: taxyearid}) =>
        collection(this.firestore, `/users/${userId}/settings/${taxyearid}/propertyList/${propertyId}/transactions`)
      ),
      switchMap(
        (propertyTransactionCollection) =>
          collectionData(query(propertyTransactionCollection, orderBy('date', 'asc')), { idField: 'id'}) as Observable<Transaction[]>
      )
    );
  }

  getPropertyTransaction(propertyId: string, transactionId: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId, displayName: taxyearid }: User) =>
        doc(this.firestore, `/users/${userId}/settings/${taxyearid}/propertyList/${propertyId}/transactions/${transactionId}`)
      ),
      switchMap(
        (transactionDoc) =>
          docData(transactionDoc, { idField: 'id' }) as Observable<Transaction>
      )
    );
  }

  createPropertyTransaction(propertyId: string, propertytransaction: Transaction) {
    const transactionCollection = collection(this.firestore,`${this.dbPropertyPath}/${propertyId}/transactions`);
      return addDoc(transactionCollection, propertytransaction);
  }

  createPropertyTransactionById(taxYearId: string, propertyId: string, propertytransaction: Transaction) {
    this.dbPropertyPath = `/users/${this.userId}/settings/${taxYearId}/propertyList`;
    const transactionCollection = collection(this.firestore,`${this.dbPropertyPath}/${propertyId}/transactions`);
      return addDoc(transactionCollection, propertytransaction);
  }
  
  deletePropertyTransaction(propertyId: string, transactionId: string): Promise<void> {
    const transactionDocRef = doc(this.firestore, `${this.dbPropertyPath}/${propertyId}/transactions/${transactionId}`);
    return deleteDoc(transactionDocRef);
  }

}
