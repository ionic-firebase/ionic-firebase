export class Debt {
    id: string;
    name: string;
    date: any;
    number: string;
    passwordhint: string;
    memorableplace: string;
    memorablename: string;
    memorabledate: string;
    initialdebt: number;
    balance: number;
    paymentamount: number;
    frequency: string;
    annualpayments: number;
    notes: string;
  }
  
  export class DebtTransaction {
    id: string;
    debtid: string;
    date: any;
    description: string;
    cashamount: number;
    type: string;
  }
  