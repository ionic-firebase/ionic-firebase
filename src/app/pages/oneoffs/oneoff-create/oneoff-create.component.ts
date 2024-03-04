import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ViewEncapsulation } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../../services/user/auth.service';
import { ToastService } from '../../../services/toast/toast.service';
import { OneoffsService } from '../../../services/oneoffs/oneoffs.service';
import { Oneoff } from '../../../models/oneoff';
import { OneoffFormComponent } from '../../../components/oneoff-form/oneoff-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-oneoff-create',
  templateUrl: './oneoff-create.component.html',
  styleUrls: ['./oneoff-create.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, OneoffFormComponent, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None,
})
export class OneoffCreateComponent {
  @ViewChild(OneoffFormComponent, { static: false }) oneoffForm: OneoffFormComponent;
  public oneoff: Oneoff = new Oneoff();
  public toDay: any;
  public fromDate: any;
  public toDate: any;

  private readonly AuthService = inject(AuthService);
  readonly user$ = this.AuthService.getUser();

  constructor(
    private oneoffsService: OneoffsService,
    private toastService: ToastService,
    private navController: NavController

  ) {}
  ngOnInit() {}

  ionViewWillEnter() {
    this.toDay = new Date().getFullYear();
    this.toDate = `${(this.toDay + 1)}`;
    this.fromDate = `${(this.toDay - 30)}`;
  }

  async createOneoff(oneoff: Oneoff): Promise<void> {

    try {
        oneoff.id = '';
        oneoff.eventdate = new Date(oneoff.eventdate).toISOString();
        this.oneoffsService.createOneoff(oneoff).then(id => {
            this.toastService.displayToast('One off event added');
            this.navController.navigateBack('/oneoffs/oneoff-list');
        });
    } catch (error) {
        this.oneoffForm.handleError(error);
    }
  }
}
