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
    where
 } from '@angular/fire/firestore';
 import { Observable, take } from 'rxjs';
 import { AuthService } from '../user/auth.service';
 import { Settings } from '../../models/settings';
 import { Reorder } from '../../models/reorder';
 import { Year } from '../../models/year';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly auth = inject(AuthService);
  private readonly firestore = inject(Firestore);
  private userId = this.auth.getUser()?.uid ?? '';
  private taxYearId: string = this.auth.getUser()?.displayName ?? '';
  private dbSettingsPath = `/users/${this.userId}/settings/${this.taxYearId}`;
  private dbReorderPath = `/users/${this.userId}/settings/${this.taxYearId}/reorderList`;
  private dbYearsPath = `/users/${this.userId}/settings`;

  getSettings() {
    const settingsDoc = doc(this.firestore, `${this.dbSettingsPath}`);
    return docData(settingsDoc) as Observable<Settings>;
  }

  getSettingsActive() {
    const settingsCollection = collection(this.firestore, this.dbYearsPath);
    return collectionData(query(settingsCollection, where('activeYear', '==', true)), { idField: 'id' }) as Observable<Settings[]>;
  }

  getReorderList() {
    const reorderCollection = collection(this.firestore, this.dbReorderPath);
    return collectionData(query(reorderCollection, orderBy('order', 'asc')), { idField: 'id' }) as Observable<Reorder[]>;
  }

  async getReorderListPromise(): Promise<any> {
    try {
      return this.getReorderList()
        .pipe(
          take(1)
        )
        .toPromise();
    } catch (error) {
      console.log(error);
    }
  }

  async createTaxYear(taxYear: string, settings: Settings) {
    const yearsCollection = collection(this.firestore, this.dbYearsPath);
    return await addDoc(yearsCollection, settings);
  }

  getYearsList() {
    const yearsCollection = collection(this.firestore, this.dbYearsPath);
    return collectionData(query(yearsCollection, orderBy('taxyear')), { idField: 'id' }) as Observable<Year[]>;
  }

  createReorder(reorder: Partial<Reorder>) {
    const reorderCollection = collection(this.firestore, `${this.dbReorderPath}/`);
    return addDoc(reorderCollection, reorder);
  }

  async updateReorderOrder(reorderId: string, order: any): Promise<void> {

    try {
      const reorderDocRef = doc(this.firestore, `${this.dbReorderPath}/${reorderId}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(reorderDocRef, { 
            order: order,
          });
      });
    } catch (error) {
      console.log('updateReorderOrder Transaction failed: ', error);
      throw error;
    }
  }

  getReorderByItemId(reorderId: string) {
    const reorderDoc =  doc(this.firestore, `${this.dbReorderPath}/${reorderId}`);
    return docData(reorderDoc) as Observable<Reorder>;
  }

  deleteReorder(reorderId: string): Promise<void> {
    const reorderDoc = doc(this.firestore,`${this.dbReorderPath}/${reorderId}`);
    return deleteDoc(reorderDoc);
  }

  async updateOrderCount(orderCount: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            ordercount: orderCount,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateTaxYear(taxYearId: string): Promise<void> {
    try {
      return await this.auth.updateTaxYear(taxYearId)
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async disableActiveYear(settingsId: string): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `/users/${this.userId}/settings/${settingsId}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            activeYear: false,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async enableActiveYear(settingsId: string): Promise<void> {
    try {
      this.dbSettingsPath = `/users/${this.userId}/settings/${settingsId}`;
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            activeYear: true,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async enableUpdates(enableupdates: boolean): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      console.log('this.taxYearId = ', this.taxYearId);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            enableupdates: enableupdates,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async enableBudgets(enablebudgets: boolean): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            enablebudgets: enablebudgets,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async enablePortfolios(enableportfolios: boolean): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            enableportfolios: enableportfolios,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async enableBonds(enablebonds: boolean): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            enablebonds: enablebonds,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async enableSavings(enablesavings: boolean): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            enablesavings: enablesavings,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async enableOneoffs(enableoneoffs: boolean): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            enableoneoffs: enableoneoffs,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async enablePensions(enablepensions: boolean): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            enablepensions: enablepensions,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async enableSalaries(enablesalaries: boolean): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            enablesalaries: enablesalaries,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async enableProperty(enableproperty: boolean): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            enableproperty: enableproperty,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async enableLoans(enableloans: boolean): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            enableloans: enableloans,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async enableDebts(enabledebts: boolean): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            enabledebts: enabledebts,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY1CPIRate(Y1CPIRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y1CPIRate: Y1CPIRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY2CPIRate(Y2CPIRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y2CPIRate: Y2CPIRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY3CPIRate(Y3CPIRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y3CPIRate: Y3CPIRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }


  async updateY4CPIRate(Y4CPIRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y4CPIRate: Y4CPIRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY5CPIRate(Y5CPIRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y5CPIRate: Y5CPIRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY6CPIRate(Y6CPIRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y6CPIRate: Y6CPIRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY7CPIRate(Y7CPIRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y7CPIRate: Y7CPIRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY8CPIRate(Y8CPIRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y8CPIRate: Y8CPIRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY9CPIRate(Y9CPIRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y9CPIRate: Y9CPIRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY20CPIRate(Y20CPIRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y20CPIRate: Y20CPIRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY30CPIRate(Y30CPIRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y30CPIRate: Y30CPIRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateDividendRate(dividendRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            dividendRate: dividendRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateInvestmentGrowthRate(investmentGrowthRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            investmentGrowthRate: investmentGrowthRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updatePropertyGrowthRate(propertyGrowthRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            propertyGrowthRate: propertyGrowthRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY1PensionRate(Y1PensionRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y1PensionRate: Y1PensionRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY2PensionRate(Y2PensionRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y2PensionRate: Y2PensionRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY3PensionRate(Y3PensionRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y3PensionRate: Y3PensionRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY4PensionRate(Y4PensionRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y4PensionRate: Y4PensionRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY5PensionRate(Y5PensionRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y5PensionRate: Y5PensionRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY6PensionRate(Y6PensionRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y6PensionRate: Y6PensionRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY7PensionRate(Y7PensionRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y7PensionRate: Y7PensionRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY8PensionRate(Y8PensionRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y8PensionRate: Y8PensionRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY9PensionRate(Y9PensionRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y9PensionRate: Y9PensionRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY20PensionRate(Y20PensionRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y20PensionRate: Y20PensionRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateY30PensionRate(Y30PensionRate: number): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            Y30PensionRate: Y30PensionRate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateFirstName(firstName: string): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            firstName: firstName,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateLastName(lastName: string): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            lastName: lastName,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }

  async updateDOB(birthDate: string): Promise<void> {
    try {
      const settingsDocRef = doc(this.firestore, `${this.dbSettingsPath}`);
      await runTransaction(this.firestore, async (transaction) => {
          transaction.update(settingsDocRef, { 
            birthDate: birthDate,
          });
      });
    } catch (error) {
      console.log('Transaction failed: ', error);
      throw error;
    }
  }
}
