import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  GoogleMap,
  GoogleMaps,
  GoogleMapsEvent,
  HtmlInfoWindow,
  Marker,
  MyLocation
} from "@ionic-native/google-maps";
import { Events, IonInfiniteScroll, IonSelect } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

import { BasicUtilsService } from "../../../services/basic-utils/basic-utils.service";
import { ObservationsService } from "../../../services/observations/observations.service";

@Component({
  selector: "app-observations",
  templateUrl: "./observations.page.html",
  styleUrls: ["./observations.page.scss"]
})
export class ObservationsPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild("selectFilterSpeciesRef") selectFilterSpeciesRef: IonSelect;

  readonly observationsArgsMax = 8;

  map: GoogleMap;
  segmentView;
  speciesList: string[];
  filteredSpeciesList;
  observationsArgs: any = {
    count: 0,
    offset: this.observationsArgsMax / -1,
    max: this.observationsArgsMax,
    hasMore: true,
    sort: "lastrevised",
    view: "list",
    sGroup: []
  };
  observations = [];
  observationsHash = [];
  mapTmpObv;

  constructor(
    private observationsService: ObservationsService,
    private basicUtilsService: BasicUtilsService,
    private translateService: TranslateService,
    private router: Router,
    private events: Events
  ) {}

  ngOnInit() {
    this.initSpeciesFilter();
    this.getObservations();
    this.startListioner();
  }

  private startListioner() {
    this.events.subscribe("ibp-uploader:end", () => {
      this.getObservations(true);
    });
  }

  private async initSpeciesFilter() {
    this.speciesList = await this.observationsService.getAllSpecies();
    this.selectFilterSpeciesRef.interfaceOptions = {
      header: this.translateService.instant("OBSERVATIONS.SPECIES"),
      message: this.translateService.instant("OBSERVATIONS.FILTER_BY_SPECIES")
    };
  }

  async getObservations(reload: boolean = false, event?, bounds?) {
    this.observationsArgs = this.observationsService.getObservationsArgs(
      reload,
      this.observationsArgs,
      this.observationsArgsMax,
      this.filteredSpeciesList,
      bounds
    );
    const documents = await this.observationsService.getObservations(
      this.observationsArgs
    );
    if (Array.isArray(documents)) {
      let reloadMap = false;
      if (!reload) {
        this.observations.push(...documents);
      } else {
        this.observations = documents;
        reloadMap = true;
      }
      this.addMarkersToMap(reloadMap, documents);
    } else {
      this.basicUtilsService.showToast("Observations non Array response");
    }
    if (event) {
      event.target.complete();
    }
  }

  private toggleInfiniteScroll() {
    this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
  }

  segmentChanged(ev: any) {
    this.segmentView = ev.detail.value;
    if (this.segmentView === "map") {
      this.loadMap();
      // this.addMarkersToMap(true, this.observations);
    } else if (this.map) {
      this.map.destroy();
    }
  }

  showObservation(ob) {
    this.basicUtilsService.setRouterStore(ob);
    this.router.navigate(["/user-observation-info"]);
  }

  private loadMap() {
    this.map = GoogleMaps.create("map_canvas", {
      controls: {
        compass: true,
        myLocation: true,
        myLocationButton: true,
        indoorPicker: true,
        mapToolbar: true
      }
    });

    // When user clicks on myLocation button wait for navigation to finish and then load submissions.
    this.map.on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK).subscribe(() => {
      setTimeout(() => {
        this.getObservations(false, undefined, this.map.getVisibleRegion());
      }, 3000);
    });

    this.map.getMyLocation().then((location: MyLocation) => {
      this.map.animateCamera({
        target: location.latLng,
        zoom: 6,
        tilt: 30
      });
      this.getObservations(true, undefined, this.map.getVisibleRegion());
      this.map
        .on(GoogleMapsEvent.MAP_DRAG_END)
        .pipe(
          debounceTime(2000),
          distinctUntilChanged()
        )
        .subscribe(changes => {
          this.getObservations(false, undefined, this.map.getVisibleRegion());
        });
    });
  }

  addMarkersToMap(clear: boolean = false, observations: object[]) {
    if (this.segmentView !== "map") {
      return;
    }
    if (clear) {
      this.map.clear();
      this.observationsHash = [];
    }
    observations.forEach(ob => {
      if (this.observationsHash.includes(ob["id"])) {
        return;
      }
      this.observationsHash.push(ob["id"]);
      const title = ob["name"] || ob["taxonomycanonicalform"] || "Unknown";
      const thumbnail = ob["thumbnail"];
      const markerContent = `
        <div class="gmInfo" style="padding-bottom: 35px; text-align: center;">
          <img style="margin-top: 16px; width: 94px; border-radius: 4px;" src="${thumbnail}" />
          <div class="title">${title}</div>
          <ion-button color="primary">view &rarr;</ion-button>
        </div>`;
      const htmlInfoWindow = new HtmlInfoWindow();
      const frame: HTMLElement = document.createElement("div");
      frame.innerHTML = markerContent;
      const marker: Marker = this.map.addMarkerSync({
        position: { lat: ob["latitude"], lng: ob["longitude"] },
        observation: ob
      });
      htmlInfoWindow.setContent(frame, {
        width: "100px"
      });
      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(params => {
        this.mapTmpObv = <Marker>params[1].get("observation");
        htmlInfoWindow.open(marker);
      });
      frame.addEventListener("click", evt => {
        this.showObservation(this.mapTmpObv);
      });
    });
  }
}
