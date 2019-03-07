import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Events, IonInfiniteScroll, NavController } from "@ionic/angular";

import { BasicUtilsService } from "../../../services/basic-utils/basic-utils.service";
import { ObservationsService } from "../../../services/observations/observations.service";
import { UserDataService } from "../../../services/user-data/user-data.service";

@Component({
  selector: "app-observations-local",
  templateUrl: "./observations-local.page.html",
  styleUrls: ["./observations-local.page.scss"]
})
export class ObservationsLocalPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  readonly observationsArgsMax = 8;

  segmentView;
  localObservations = [];
  observationsArgs: any = {
    count: 0,
    offset: this.observationsArgsMax / -1,
    max: this.observationsArgsMax,
    hasMore: true,
    sort: "lastrevised",
    view: "list",
    sGroup: [],
    user: ""
  };
  observations = [];
  localObservationIds = [];

  constructor(
    private events: Events,
    private router: Router,
    private observationsService: ObservationsService,
    private basicUtilsService: BasicUtilsService,
    private userDataService: UserDataService,
    private navController: NavController
  ) {}

  ngOnInit() {
    this.getObservations();
    this.startListioner();
  }

  async getObservations(reload: boolean = false, event?) {
    const user = await this.userDataService.getUser();
    this.observationsArgs.user = user["id"];
    this.observationsArgs = this.observationsService.getObservationsArgs(
      reload,
      this.observationsArgs,
      this.observationsArgsMax,
      []
    );
    const documents = await this.observationsService.getObservations(
      this.observationsArgs
    );
    if (Array.isArray(documents)) {
      if (!reload) {
        this.observations.push(...documents);
      } else {
        this.observations = documents;
      }
    } else {
      this.basicUtilsService.showToast("Observations non Array response");
    }
    if (event) {
      event.target.complete();
    }
  }

  toggleInfiniteScroll() {
    this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
  }

  showObservation(ob) {
    this.basicUtilsService.setRouterStore(ob);
    this.router.navigate(["/user-observation-info"]);
  }

  syncObservations() {
    this.observationsService.syncSingleObservations(false);
  }

  async segmentChanged(ev: any) {
    this.segmentView = ev.detail.value;
    if (this.segmentView === "local") {
      this.getLocalObservations();
    }
  }

  async getLocalObservations() {
    this.localObservationIds = await this.userDataService.getAllUserObservations();
    this.localObservations = [];
    for (const obId of this.localObservationIds) {
      this.localObservations.push({
        localId: obId,
        ...(await this.userDataService.getUserObservation(obId))
      });
    }
  }

  editObservation(localObId) {
    this.basicUtilsService.setRouterStore({ isLocalOb: true, id: localObId });
    this.navController.navigateRoot("/user-observation-create");
  }

  private startListioner() {
    this.events.subscribe("ibp-uploader:end", () => {
      this.getLocalObservations();
    });
  }
}
