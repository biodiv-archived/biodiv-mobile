import {
  ChangeDetectorRef,
  Component,
  HostBinding,
  OnInit
} from "@angular/core";
import { Events } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";

import { BasicUtilsService } from "../../services/basic-utils/basic-utils.service";

@Component({
  selector: "ibp-toast-status",
  templateUrl: "./toast-status.component.html",
  styleUrls: ["./toast-status.component.scss"]
})
export class ToastStatusComponent implements OnInit {
  @HostBinding("class.hidden") hideUploader = true;
  totalImages = 0;
  uploadedImages = 0;
  status;
  persentage = 0;

  constructor(
    private events: Events,
    private ref: ChangeDetectorRef,
    private basicUtilsService: BasicUtilsService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.initListeners();
  }

  initListeners() {
    this.events.subscribe("ibp-uploader:start", ti => {
      this.totalImages = ti;
      this.uploadedImages = 0;
      this.status = "uploading";
      this.showUploader();
    });

    this.events.subscribe("ibp-uploader:end", () => {
      this.showUploader(false);
    });

    this.events.subscribe("ibp-uploader:imagedone", ui => {
      this.uploadedImages = ui;
    });

    this.events.subscribe("ibp-uploader:progress", p => {
      this.persentage = p;
      this.ref.detectChanges();
    });

    this.events.subscribe("ibp-uploader:failed", () => {
      this.showUploader(false);
      this.basicUtilsService.showToast(
        this.translateService.instant("TOAST.UPLOAD_FAILED")
      );
    });
  }

  showUploader(v: boolean = true) {
    this.hideUploader = !v;
  }
}
