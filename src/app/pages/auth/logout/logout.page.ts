import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { GooglePlus } from "@ionic-native/google-plus/ngx";
import { MenuController } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { UserDataService } from "src/app/services/user-data/user-data.service";

@Component({
  selector: "app-logout",
  templateUrl: "./logout.page.html",
  styleUrls: ["./logout.page.scss"]
})
export class LogoutPage {
  constructor(
    private storage: Storage,
    private router: Router,
    private googlePlus: GooglePlus,
    private menuCtrl: MenuController,
    private uds: UserDataService
  ) {}

  ionViewDidEnter() {
    this.doLogout();
  }

  async doLogout() {
    this.menuCtrl.enable(false);
    try {
      await this.googlePlus.logout();
    } catch (e) {}
    await this.storage.remove(this.uds.STORAGE_USER);
    await this.storage.remove(this.uds.STORAGE_REFRESH_TOKEN);
    await this.storage.remove(this.uds.STORAGE_ACCESS_TOKEN);
    this.router.navigateByUrl("/login");
  }
}
