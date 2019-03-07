import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { AppVersion } from "@ionic-native/app-version/ngx";

@Component({
  selector: "app-about",
  templateUrl: "./about.page.html",
  styleUrls: ["./about.page.scss"]
})
export class AboutPage implements OnInit {
  licenses;
  appVersion;

  constructor(private http: HttpClient, private av: AppVersion) {}

  ngOnInit() {
    this.loadLicenses();
    this.showAppVersion();
  }

  async loadLicenses() {
    this.licenses = await this.http
      .get("/assets/LICENSES.txt", { responseType: "text" })
      .toPromise();
  }

  async showAppVersion() {
    this.appVersion = await this.av.getVersionNumber();
  }
}
