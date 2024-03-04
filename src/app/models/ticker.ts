export class Ticker {

    constructor(
        ticker: string,
        currentprice: number,
        isupdated: string,
        type: string,
        previousclose: number,
        change: number,
        changepercent: number
        ) {
        this.ticker = ticker;
        this.currentprice = currentprice;
        this.isupdated = isupdated;
        this.previousclose = previousclose;
        this.change = change;
        this.changepercent = changepercent;
        this.type = type;
    }
    ticker: string;
    currentprice: number;
    isupdated: string;
    type: string;
    previousclose: number;
    change: number;
    changepercent: number;
}
