import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { OneoffsService } from '../../../services/oneoffs/oneoffs.service';
import { Oneoff } from '../../../models/oneoff';
import { OneoffFormComponent } from '../../../components/oneoff-form/oneoff-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-oneoff-update',
  templateUrl: './oneoff-update.component.html',
  styleUrls: ['./oneoff-update.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, OneoffFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class OneoffUpdateComponent {
  @ViewChild(OneoffFormComponent, { static: false }) oneoffForm: OneoffFormComponent;

  oneoffId: string;

  currentOneoff$: Observable<Oneoff> = this.route.params.pipe(
    switchMap((params: { [id: string]: string }) => {
      this.oneoffId = params['id'];
      return this.oneoffsService.getOneoff(params['id']);
    })
  );

  oneoff: Oneoff = new Oneoff();
  public toDay: any;
  public fromDate: any;
  public toDate: any;

  private oneoffSubscription: any;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();
  constructor(
    private oneoffsService: OneoffsService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private navController: NavController
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {

    this.toDay = new Date().getFullYear();
    this.toDate = `${(this.toDay + 1)}`;
    this.fromDate = `${(this.toDay - 30)}`;
    this.oneoffSubscription = this.currentOneoff$.pipe()
    .subscribe(
      (oneoff: Oneoff) => {
      this.oneoffForm.onOneoffRetrieved(oneoff);
    });
  }

  async updateOneoff(oneoff: Oneoff): Promise<void> {

    try {
      oneoff.eventdate = new Date(oneoff.eventdate).toISOString();

      this.oneoffsService.updateOneoff(this.oneoffId, oneoff).then(key => {
        this.toastService.displayToast('Oneoff updated');
        this.navController.navigateBack('/oneoffs/oneoff-list');
      });
    } catch (error) {
      this.oneoffForm.handleError(error);
    }
  }

  ionViewWillLeave() {
    if (this.oneoffSubscription) {
      this.oneoffSubscription.unsubscribe();
    }
  }

}
