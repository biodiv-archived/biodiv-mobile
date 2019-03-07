import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

import { BasicUtilsService } from "../../../services/basic-utils/basic-utils.service";
import { UserDataService } from "../../../services/user-data/user-data.service";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.page.html",
  styleUrls: ["./settings.page.scss"]
})
export class SettingsPage implements OnInit {
  settings = {
    uploadWifiOnly: false,
    uploadManually: false
  };
  settingsInitial;

  constructor(
    private userDataService: UserDataService,
    private basicUtilsService: BasicUtilsService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.getInitialSettings();
  }

  async getInitialSettings() {
    this.settings = await this.userDataService.getSettings();
  }

  saveSettings() {
    this.userDataService.setSettings(this.settings);
    this.basicUtilsService.showToast(
      this.translateService.instant("SETTINGS.MESSAGE_SAVED")
    );
  }
}
