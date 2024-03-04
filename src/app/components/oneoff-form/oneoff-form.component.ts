import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Oneoff } from 'src/app/models/oneoff';
import { LoadingController, AlertController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { IonicModule, IonDatetime } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-oneoff-form',
  templateUrl: './oneoff-form.component.html',
  styleUrls: ['./oneoff-form.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class OneoffFormComponent  implements OnInit {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;
  public loading: HTMLIonLoadingElement;
  public oneoffForm: FormGroup;
  public oneoff: Oneoff;
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
      this.oneoffForm = this.formBuilder.group({
          id: new FormControl(''),
          description: new FormControl(''),
          eventdate: new FormControl(this.formattedDate, [Validators.required]),
          amount: new FormControl(0, [Validators.required, Validators.minLength(6)]),
          type: new FormControl('Pension', [Validators.required]),
          forecast: new FormControl(true, [Validators.required]),
          notes: new FormControl(''),
      });
  }

  ngOnInit() {
      const toDayYear = new Date().getFullYear();
      this.toDate = `${(toDayYear + 20)}-01-01T11:00`;
      this.fromDate = `${(toDayYear - 5)}-01-01T11:00`;
  }

  dateChanged(value: any) {
      this.dateValue = value;
      this.formattedDate = format(parseISO(value), 'MMM d, yyyy');
      this.showPicker = false;
  }

  submitCredentials(oneoff: FormGroup): void {
      if (!oneoff.valid) {
          console.log('Form is not valid yet, current value:', oneoff.value);
      } else {
          const credentials: Oneoff = {
              id: oneoff.value.id,
              description: oneoff.value.description,
              eventdate: this.dateValue,
              amount: oneoff.value.amount,
              type: oneoff.value.type,
              forecast: oneoff.value.forecast,
              notes: oneoff.value.notes
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

  onOneoffRetrieved(oneoff: Oneoff): void {
      this.oneoff = oneoff;
      // Update the data on the form
      this.oneoffForm.patchValue({
          id: this.oneoff.id,
          description: this.oneoff.description,
          eventdate: format(parseISO(this.oneoff.eventdate), 'MMM d, yyyy'),
          amount: this.oneoff.amount,
          type: this.oneoff.type,
          forecast: this.oneoff.forecast,
          notes: this.oneoff.notes
      });
      this.dateValue = this.oneoff.eventdate;
      this.formattedDate = format(parseISO(this.oneoff.eventdate), 'MMM d, yyyy');
  }

  async handleError(error: any): Promise<void> {
      const alert = await this.alertCtrl.create({
          message: error.message,
          buttons: [{ text: 'Ok', role: 'cancel' }]
      });
      await alert.present();
  }
}
