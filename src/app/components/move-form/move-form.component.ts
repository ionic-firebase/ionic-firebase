import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Move } from '../../models/move';
import { Movelist } from '../../models/movelist';
import { LoadingController, AlertController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { IonicModule, IonDatetime } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-move-form',
  templateUrl: './move-form.component.html',
  styleUrls: ['./move-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class MoveFormComponent implements OnInit {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  public loading: HTMLIonLoadingElement;
  public moveForm: FormGroup;
  public movelist: Movelist[];
  public move: Move;
  @Input() actionButtonText: string;
  @Output() formSubmitted = new EventEmitter<any>();
  public fromDate: any;
  public toDate: any;
  public dateValue = format(new Date(), 'yyyy-MM-dd') + 'T09:00:00.000Z';
  public formattedDate = format(new Date(), 'MMM dd, yyyy');
  showPicker = false;

  constructor(
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    this.moveForm = this.formBuilder.group({
      date: new FormControl(this.formattedDate, [Validators.required]),
      moveto: new FormControl('', [Validators.required]),
      amount: new FormControl(0, [Validators.required]),
    });
  }

  ngOnInit() {
    const toDayYear = new Date().getFullYear();
    this.toDate = `${(toDayYear + 1)}-01-01T11:00`;
    this.fromDate = `${(toDayYear - 5)}-01-01T11:00`;
  }

  dateChanged(value: any) {
    this.dateValue = value;
    this.formattedDate = format(parseISO(value), 'MMM d, yyyy');
    this.showPicker = false;
  }

  submitCredentials(move: FormGroup): void {
    if (!move.valid) {
      console.log('Form is not valid yet, current value:', move.value);
    } else {
      const credentials: Move = {
        date: this.dateValue,
        moveto: move.value.moveto,
        amount: move.value.amount,
      };
      this.formSubmitted.emit(credentials);
    }
  }

  async showLoading(): Promise<void> {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();
  }

  hideLoading(): Promise<boolean> {
    return this.loading.dismiss();
  }

  onMoveRetrieved(move: Move): void {
    this.move = move;
    // Update the data on the form
    this.moveForm.patchValue({
      date: format(parseISO(this.move.date), 'MMM d, yyyy'),
      moveto: this.move.moveto,
      amount: this.move.amount
    });
    this.dateValue = this.move.date;
    this.formattedDate = format(parseISO(this.move.date), 'MMM d, yyyy');
  }

  onMovelistRetrieved(movelist: Movelist[]): void {
    this.movelist = movelist;
  }

  async handleError(error: any): Promise<void> {
    const alert = await this.alertCtrl.create({
      message: error.message,
      buttons: [{ text: 'Ok', role: 'cancel' }]
    });
    await alert.present();
  }
}