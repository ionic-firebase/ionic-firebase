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
    orderBy,
    query,
    onSnapshot,
 } from '@angular/fire/firestore';
 import { User } from '@angular/fire/auth';
 import { filter, map, Observable, switchMap } from 'rxjs';
 import { AuthService } from '../user/auth.service';
 import { Salary } from '../../models/salary';
 import { isNotNullOrUndefined } from '../../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class SalariesService {
  private readonly auth = inject(AuthService);
  private readonly firestore = inject(Firestore);
  salaryArray: Salary[] = [];

  private userId = this.auth.getUser()?.uid ?? '';
  private taxyearid: string = this.auth.getUser()?.displayName ?? '';
  private dbSalaryPath = `/users/${this.userId}/settings/${this.taxyearid}/salaryList`;

  getRealtimeSalaries(): Observable<Salary[]> {
    return new Observable((salaries) => {
      this.salaryArray = [];
      const salaryList = query(collection(this.firestore,this.dbSalaryPath), 
      orderBy('name', 'asc'));
      const unsubscribe = onSnapshot(salaryList, (snapshot) => {
        let tempArray = snapshot.docChanges();
        if(!((tempArray.length == 1) && (tempArray[0].type == 'modified'))) {
          if(this.salaryArray?.length != 0) { 
            this.salaryArray = [];
          }
        }
        tempArray.forEach((change) => {
          let salary: any = change.doc.data();
          salary.id = change.doc.id;
          if(this.salaryArray?.length == 0) {
            this.salaryArray.push(salary);
          } else {    
            if (change.type === "added"){
              this.salaryArray.push(salary);
            }
            if (change.type === "modified") {
              const index = this.salaryArray.findIndex(x => x.id == salary.id);
              this.salaryArray[index] = salary;
            }
            if (change.type === "removed") {
              this.salaryArray = this.salaryArray.filter(x => x.id != salary.id);
            }
          }
        });
        salaries.next(this.salaryArray);
      });
      return () => unsubscribe();
    });
  }

  getSalary(salaryId: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId, displayName: taxyearid }: User) =>
        doc(this.firestore, `/users/${userId}/settings/${taxyearid}/salaryList/${salaryId}`)
      ),
      switchMap(
        (salaryDoc) =>
          docData(salaryDoc, { idField: 'id' }) as Observable<Salary>
      )
    );
  }

  createSalary(salary: Partial<Salary>) {
    const salaryCollection = collection(this.firestore, `${this.dbSalaryPath}/`);
    return addDoc(salaryCollection, salary);
  }

  createSalaryById(taxYearId: string, salary: Partial<Salary>) {
    this.dbSalaryPath = `/users/${this.userId}/settings/${taxYearId}/salaryList`;
    const salaryCollection = collection(this.firestore, `${this.dbSalaryPath}/`);
    return addDoc(salaryCollection, salary);
  }
  
  async updateSalary(salaryId: string, value: any): Promise<void> {
    try {
      const salaryDocRef = doc(this.firestore, `${this.dbSalaryPath}/${salaryId}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(salaryDocRef, value);
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }
  
  deleteSalary(salaryId: string): Promise<void> {
    const salaryDocRef = doc(this.firestore,`${this.dbSalaryPath}/${salaryId}`);
    return deleteDoc(salaryDocRef);
  }

  getCopySalaries(copyTaxYearid: string) {
    return this.auth.getUser$().pipe(
      filter(isNotNullOrUndefined),
      map(({ uid: userId}) =>
        collection(this.firestore, `/users/${userId}/settings/${copyTaxYearid}/salaryList`)
      ),
      switchMap(
        (salariesCollection) =>
          collectionData(salariesCollection, { idField: 'id' }) as Observable<Salary[]>
      )
    );
  }
}
