import { Component } from "@angular/core";
import { ModalController } from "@ionic/angular";

import { BasicUtilsService } from "../../../services/basic-utils/basic-utils.service";

@Component({
  selector: "app-comment",
  templateUrl: "./comment.modal.html",
  styleUrls: ["./comment.modal.scss"]
})
export class CommentModal {
  comment;

  constructor(
    private modalController: ModalController,
    private basicUtilsService: BasicUtilsService  ) {}

  ionViewWillEnter() {}

  async dismiss() {
    await this.modalController.dismiss(false);
  }

  async save() {
    if (`${this.comment}`.length > 1) {
      await this.modalController.dismiss(this.comment);
      return;
    }
    this.basicUtilsService.showToast("Common or Scientific name required");
  }
}
