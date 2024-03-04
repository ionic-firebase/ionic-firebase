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
 import { Oneoff } from '../../models/oneoff';
 import { isNotNullOrUndefined } from '../../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class OneoffsService {
  private readonly auth = inject(AuthService);
  private readonly firestore = inject(Firestore);
  oneoffArray: Oneoff[] = [];

  private userId = this.auth.getUser()?.uid ?? '';
  private taxyearid: string = this.auth.getUser()?.displayName ?? '';
  private dbOneoffsPath = `/users/${this.userId}/settings/${this.taxyearid}/oneoffsList`;

  getRealtimeOneoffs(): Observable<Oneoff[]> {
    return new Observable((oneoffs) => {
      this.oneoffArray = [];
      const oneoffList = query(collection(this.firestore,this.dbOneoffsPath), 
      orderBy('name', 'asc'));
      const unsubscribe = onSnapshot(oneoffList, (snapshot) => {
        let tempArray = snapshot.docChanges();
        if(!((tempArray.length == 1) && (tempArray[0].type == 'modified'))) {
          if(this.oneoffArray?.length != 0) { 
            this.oneoffArray = [];
          }
        }
        tempArray.forEach((change) => {
          let oneoff: any = change.doc.data();
          oneoff.id = change.doc.id;
          if(this.oneoffArray?.length == 0) {
            this.oneoffArray.push(oneoff);
          } else {     
            if (change.type === "added"){
              this.oneoffArray.push(oneoff);
            }
            if (change.type === "modified") {
              const index = this.oneoffArray.findIndex(x => x.id == oneoff.id);
              this.oneoffArray[index] = oneoff;
            }
            if (change.type === "removed") {
              this.oneoffArray = this.oneoffArray.filter(x => x.id != oneoff.id);
            }
          }
        });
        oneoffs.next(this.oneoffArray);
      });
      return () => unsubscribe();
    });
  }

  getOneoff(oneoffsId: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId, displayName: taxyearid }: User) =>
        doc(this.firestore, `/users/${userId}/settings/${taxyearid}/oneoffsList/${oneoffsId}`)
      ),
      switchMap(
        (oneoffsDoc) =>
          docData(oneoffsDoc, { idField: 'id' }) as Observable<Oneoff>
      )
    );
  }

  createOneoff(oneoffs: Partial<Oneoff>) {
    const oneoffsCollection = collection(this.firestore, `${this.dbOneoffsPath}/`);
    return addDoc(oneoffsCollection, oneoffs);
  }
  
  createOneoffById(taxYearId: string, oneoffs: Partial<Oneoff>) {
    this.dbOneoffsPath = `/users/${this.userId}/settings/${taxYearId}/oneoffsList`;
    const oneoffsCollection = collection(this.firestore, `${this.dbOneoffsPath}/`);
    return addDoc(oneoffsCollection, oneoffs);
  }

  async updateOneoff(oneoffsId: string, value: any): Promise<void> {
    try {
      const oneoffsDocRef = doc(this.firestore, `${this.dbOneoffsPath}/${oneoffsId}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(oneoffsDocRef, value);
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }
  
  deleteOneoff(oneoffsId: string): Promise<void> {
    const oneoffsDocRef = doc(this.firestore,`${this.dbOneoffsPath}/${oneoffsId}`);
    return deleteDoc(oneoffsDocRef);
  }

  getCopyOneoffs(copyTaxYearid: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId}) =>
        collection(this.firestore, `/users/${userId}/settings/${copyTaxYearid}/oneoffsList`)
      ),
      switchMap(
        (oneoffsCollection) =>
          collectionData(oneoffsCollection, { idField: 'id' }) as Observable<Oneoff[]>
      )
    );
  }
}
