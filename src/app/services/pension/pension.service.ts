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
 import { Pension } from '../../models/pension';
 import { isNotNullOrUndefined } from '../../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class PensionService {
  private readonly auth = inject(AuthService);
  private readonly firestore = inject(Firestore);
  pensionArray: Pension[] = [];

  private userId = this.auth.getUser()?.uid ?? '';
  private taxyearid: string = this.auth.getUser()?.displayName ?? '';
  private dbPensionPath = `/users/${this.userId}/settings/${this.taxyearid}/pensionList`;

  getRealtimePensions(): Observable<Pension[]> {
    return new Observable((pensions) => {
      this.pensionArray = [];
      const bondList = query(collection(this.firestore,this.dbPensionPath), 
      orderBy('name', 'asc'));
      const unsubscribe = onSnapshot(bondList, (snapshot) => {
        let tempArray = snapshot.docChanges();
        if(!((tempArray.length == 1) && (tempArray[0].type == 'modified'))) {
          if(this.pensionArray?.length != 0) { 
            this.pensionArray = [];
          }
        }
        tempArray.forEach((change) => {
          let pension: any = change.doc.data();
          pension.id = change.doc.id;
          if(this.pensionArray?.length == 0) {
            this.pensionArray.push(pension);
          } else {  
            if (change.type === "added"){
              this.pensionArray.push(pension);
            }
            if (change.type === "modified") {
              const index = this.pensionArray.findIndex(x => x.id == pension.id);
              this.pensionArray[index] = pension;
            }
            if (change.type === "removed") {
              this.pensionArray = this.pensionArray.filter(x => x.id != pension.id);
            }
          }
        });
        pensions.next(this.pensionArray);
      });
      return () => unsubscribe();
    });
  }

  getPension(pensionId: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId, displayName: taxyearid }: User) =>
        doc(this.firestore, `/users/${userId}/settings/${taxyearid}/pensionList/${pensionId}`)
      ),
      switchMap(
        (pensionDoc) =>
          docData(pensionDoc, { idField: 'id' }) as Observable<Pension>
      )
    );
  }

  createPension(pension: Partial<Pension>) {
    const pensionCollection = collection(this.firestore, `${this.dbPensionPath}/`);
    return addDoc(pensionCollection, pension);
  }

  createPensionById(taxYearId: string, pension: Partial<Pension>) {
    this.dbPensionPath = `/users/${this.userId}/settings/${taxYearId}/pensionList`;
    const pensionCollection = collection(this.firestore, `${this.dbPensionPath}/`);
    return addDoc(pensionCollection, pension);
  }
  
  async updatePension(pensionId: string, value: any): Promise<void> {
    try {
      const pensionDocRef = doc(this.firestore, `${this.dbPensionPath}/${pensionId}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(pensionDocRef, value);
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }
  
  deletePension(pensionId: string): Promise<void> {
    const pensionDocRef = doc(this.firestore,`${this.dbPensionPath}/${pensionId}`);
    return deleteDoc(pensionDocRef);
  }

  getCopyPensions(copyTaxYearid: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId}) =>
        collection(this.firestore, `/users/${userId}/settings/${copyTaxYearid}/pensionList`)
      ),
      switchMap(
        (pensionCollection) =>
          collectionData(pensionCollection, { idField: 'id' }) as Observable<Pension[]>
      )
    );
  }
}
