import { Component } from "@angular/core";
import { ModalController, NavParams } from "@ionic/angular";
import { Subscription } from "rxjs";

import { BasicUtilsService } from "../../../services/basic-utils/basic-utils.service";
import { ObservationsService } from "../../../services/observations/observations.service";

@Component({
  selector: "app-observation-info-add",
  templateUrl: "./observation-info-add.modal.html",
  styleUrls: ["./observation-info-add.modal.scss"]
})
export class ObservationInfoAddModal {
  suggestData = {
    lang: { text: "English", value: "English" },
    commonName: {},
    scientificName: {},
    comments: undefined
  };
  obvIds;
  langs;
  searchSubscription: Subscription;

  constructor(
    private modalController: ModalController,
    private observationsService: ObservationsService,
    private basicUtilsService: BasicUtilsService,
    private navParams: NavParams
  ) {
    this.obvIds = this.navParams.get("obvIds");
  }

  ionViewWillEnter() {
    this.getLangs();
  }

  async getLangs() {
    this.langs = await this.observationsService.getLanguages();
  }

  async dismiss() {
    await this.modalController.dismiss(false);
  }

  getRecoId() {
    let recoId;
    if (this.suggestData.commonName.hasOwnProperty("recoId")) {
      recoId = this.suggestData.commonName["recoId"];
    } else if (this.suggestData.scientificName.hasOwnProperty("recoId")) {
      recoId = this.suggestData.scientificName["recoId"];
    }
    return recoId ? { recoId: recoId } : {};
  }

  async save() {
    await this.basicUtilsService.showLoader();
    if (
      this.suggestData.commonName.hasOwnProperty("value") ||
      this.suggestData.scientificName.hasOwnProperty("acceptedName")
    ) {
      const suggestion = {
        obvIds: this.obvIds,
        languageName: this.suggestData.lang.value,
        commonName: this.suggestData.commonName["value"] || "",
        recoName: this.suggestData.scientificName["value"] || "",
        comments: this.suggestData.comments || "",
        ...this.getRecoId()
      };
      const recoVote = await this.observationsService.addRecommendationVote(
        suggestion
      );
      this.basicUtilsService.hideLoader();
      if (recoVote) {
        await this.modalController.dismiss(recoVote);
      }
      return;
    }
    this.basicUtilsService.hideLoader();
    this.basicUtilsService.showToast("Common or Scientific name required");
  }

  search(nameFilter, event) {
    const text = event.text.trim().toLowerCase();
    event.component.startSearch();
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (!text) {
      if (this.searchSubscription) {
        this.searchSubscription.unsubscribe();
      }
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    this.searchSubscription = this.observationsService
      .getRecoSuggestion(text, nameFilter)
      .subscribe(data => {
        if (this.searchSubscription.closed) {
          return;
        }
        event.component.items = [
          {
            value: text,
            acceptedName: text
          },
          ...data["model"]["instanceList"]
        ];
        event.component.endSearch();
      });
  }
}
