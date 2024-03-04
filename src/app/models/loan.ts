export class Loan {
    id: string;
    name: string;
    date: any;
    number: string;
    passwordhint: string;
    memorableplace: string;
    memorablename: string;
    memorabledate: string;
    initialloan: number;
    balance: number;
    paymentamount: number;
    frequency: string;
    annualpayments: number;
    notes: string;
  }
  
  export class LoanTransaction {
    id: string;
    loanid: string;
    date: any;
    description: string;
    cashamount: number;
    type: string;
  }
  