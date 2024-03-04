import { SecurityContext } from '@angular/core';
import { Injectable } from '@angular/core';
import { Ticker } from '../../models/ticker';
import { Changed } from '../../models/changed';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';

const LocalStorageStockName = 'stock-app-data';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  public result: Ticker[] = [];

  private storageStockEnabled = false;
  private stockSubject: Subject<Changed<string>> = new Subject<Changed<string>>();

  constructor(
    private sanitizer: DomSanitizer
  ) {
    this.storageStockEnabled = this.storageAvailable('localStorage');
  }

  getTickerPrice(
    ticker: string | null,
  ) {
    if ((typeof ticker === 'undefined') || (ticker === null) || ticker.trim() === '') {
      return null; // Ticker is invalid. Throw exception?
    }

    if (!this.storageStockEnabled) {
      return null; // Storage is not supported. Throw exception?
    }

    let data: Ticker [];
// Scrub input for javascript and/or HTML ...
    ticker = ticker.trim().toUpperCase();
    ticker = this.sanitizer.sanitize(SecurityContext.HTML, ticker);
    data = JSON.parse(localStorage.getItem(LocalStorageStockName)!) || [];

    if (data !== null) {
      for (const tickerIndex of data) {
        if (tickerIndex.ticker.toUpperCase().trim() === ticker) {
          return tickerIndex.currentprice;
        }
      }
    }
    return null;
  }

  getTickerStatus(
    ticker: string | null,
  ) {
    if ((typeof ticker === 'undefined') || (ticker === null) || ticker.trim() === '') {
      return null; // Ticker is invalid. Throw exception?
    }

    if (!this.storageStockEnabled) {
      return null; // Storage is not supported. Throw exception?
    }

    let data: Ticker [];
// Scrub input for javascript and/or HTML ...
    ticker = ticker.trim().toUpperCase();
    ticker = this.sanitizer.sanitize(SecurityContext.HTML, ticker);
    data = JSON.parse(localStorage.getItem(LocalStorageStockName)!) || [];

    if (data !== null) {
      for (const tickerIndex of data) {
        if (tickerIndex.ticker.toUpperCase().trim() === ticker) {
          return tickerIndex.isupdated;
        }
      }
    }
    return null;
  }

  addTicker(
    ticker: string | null,
    currentprice: number,
    isupdated: string,
    type: string,
    previousclose: number,
    change: number,
    changepercent: number
  ) {
    if ((typeof ticker === 'undefined') || (ticker === null) || ticker.trim() === '') {
      console.log('Ticker is invalid');

      return; // Ticker is invalid. Throw exception?
    }

    if (!this.storageStockEnabled) {
      console.log('Storage is not supported.');

      return; // Storage is not supported. Throw exception?
    }

    let data: Ticker [];
// Scrub input for javascript and/or HTML ...
    ticker = ticker.trim().toUpperCase();
    ticker = this.sanitizer.sanitize(SecurityContext.HTML, ticker);
    data = JSON.parse(localStorage.getItem(LocalStorageStockName)!) || [];

    if (data !== null) {
      for (const tickerIndex of data) {
        if (tickerIndex.ticker.toUpperCase().trim() === ticker) {
          return; // Ticker already exists. Throw exception?
        }
      }
    }

    data.push ( new Ticker(ticker!, currentprice, isupdated, type, previousclose, change, changepercent) );

    // Notify subscribers that a new stock ticker has been added to the portfolio.
    this.stockSubject.next(new Changed<string> (ticker!, true));

    localStorage.setItem(LocalStorageStockName, JSON.stringify(data));
  }

  updateTicker(
    ticker: string | null,
    currentprice: number,
  ) {
    if ((typeof ticker === 'undefined') || (ticker === null) || ticker.trim() === '') {
      return; // Ticker is invalid. Throw exception?
    }

    if (!this.storageStockEnabled) {
      return; // Storage is not supported. Throw exception?
    }

    let data: Ticker [];
// Scrub input for javascript and/or HTML ...
    ticker = ticker.trim().toUpperCase();
    ticker = this.sanitizer.sanitize(SecurityContext.HTML, ticker);
    data = JSON.parse(localStorage.getItem(LocalStorageStockName)!) || [];

    if (data !== null) {
      for (const tickerIndex of data) {
        if (tickerIndex.ticker.toUpperCase().trim() === ticker) {
          tickerIndex.currentprice = currentprice;
        }
      }
    }
    localStorage.setItem(LocalStorageStockName, JSON.stringify(data));
  }

  removeTicker( ticker: string | null) {

    if ((typeof ticker === 'undefined') || (ticker === null) || ticker.trim() === '') {
      return; // Ticker is invalid. Throw exception?
    }

    if (!this.storageStockEnabled) {
      return; // Storage is not supported. Throw exception?
    }

    let data: Ticker [];

// Scrub input for javascript and/or HTML ...
    ticker = ticker.trim().toUpperCase();
    ticker = this.sanitizer.sanitize(SecurityContext.HTML, ticker);

    data = JSON.parse(localStorage.getItem(LocalStorageStockName)!) || [];

    if (data != null) {
      for (let tickerIndex = 0; tickerIndex < data.length; tickerIndex++) {
        if (data[tickerIndex].ticker.toUpperCase().trim() === ticker) {
          data.splice(tickerIndex, 1);
          break;
        }
      }
    }
// Notify subscribers that a new stock ticker has been removed to the portfolio.
    this.stockSubject.next(new Changed<string>(ticker!, false));

    localStorage.setItem(LocalStorageStockName, JSON.stringify(data));
  }

  public watchTickers(): Subject<Changed<string>> {
    return this.stockSubject;
  }

  async getTickers(): Promise<Ticker[]> {

    let data: Ticker [];
    if (!this.storageStockEnabled) {
      return []; // Storage is not supported.
    } else {
      data = await JSON.parse(localStorage.getItem(LocalStorageStockName)!);
      const result = data;
      return result;
    }
  }

  clearStorage() {
    if (!this.storageStockEnabled) {
      return; // Storage is not supported.
    }
    localStorage.clear();
  }

// Determines if local storage is available.
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API

  private storageAvailable(
    type: any
  ): boolean {
    try {
      const storage = window.localStorage;
      const x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return e instanceof DOMException && (

// test name field too, because code might not be present
// everything except Firefox
      e.name === 'QuotaExceededError' ||
// Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
// acknowledge QuotaExceededError only if there's something already stored
    localStorage.length !== 0;
    }
  }

  OnDestroy() {
    this.stockSubject.complete();
  }
}
