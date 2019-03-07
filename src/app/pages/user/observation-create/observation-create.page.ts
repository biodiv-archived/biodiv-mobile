import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { FilePath } from "@ionic-native/file-path/ngx";
import {
  Geocoder,
  GeocoderResult,
  GoogleMap,
  GoogleMapOptions,
  GoogleMaps,
  GoogleMapsAnimation,
  GoogleMapsEvent,
  Marker,
  MyLocation
} from "@ionic-native/google-maps";
import { WebView } from "@ionic-native/ionic-webview/ngx";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

import { BasicUtilsService } from "../../../services/basic-utils/basic-utils.service";
import { GroupsService } from "../../../services/groups/groups.service";
import { ObservationsService } from "../../../services/observations/observations.service";
import { UserDataService } from "../../../services/user-data/user-data.service";

declare var chooser;

@Component({
  selector: "app-observation-create",
  templateUrl: "./observation-create.page.html",
  styleUrls: ["./observation-create.page.scss"]
})
export class ObservationCreatePage implements OnInit {
  speciesItems = this.observationsService.getAllSpecies();
  observationCreateForm: FormGroup;
  map: GoogleMap;
  searchChanged: Subject<string> = new Subject<string>();
  locationItems = [];
  groupsList = this.groupsService.getUserGroups();
  searchSubscription: Subscription;
  observtionImages = [];
  helpIdentify = true;
  localObservationId;

  constructor(
    private filePath: FilePath,
    private camera: Camera,
    private formBuilder: FormBuilder,
    private webView: WebView,
    private observationsService: ObservationsService,
    public basicUtilsService: BasicUtilsService,
    private groupsService: GroupsService,
    private router: Router,
    private userDataService: UserDataService
  ) {}

  ngOnInit() {
    if (!this.basicUtilsService.isDesktop) {
      this.initMap();
    }
    this.initObservationCreateForm();
  }

  initObservationCreateForm() {
    this.observationCreateForm = this.formBuilder.group({
      observationId: [],
      speciesType: ["", Validators.required],
      location: [],
      commonName: [""],
      helpIdentify: [false],
      scientificName: [""],
      notes: [""],
      userGroups: [],
      fromDate: [new Date().toISOString(), Validators.required]
    });

    this.searchChanged
      .pipe(
        debounceTime(2000),
        distinctUntilChanged()
      )
      .subscribe(event => {
        this.searchLocation(event);
      });

    this.f.helpIdentify.valueChanges.subscribe(v => {
      this.helpIdentify = !v;
    });

    const rStore = this.basicUtilsService.getRouterStore() || {};
    this.basicUtilsService.setRouterStore({});

    if (rStore.hasOwnProperty("isLocalOb")) {
      this.loadLocalSubmissionIfPassed(rStore);
    } else if (rStore.hasOwnProperty("isUploadedOb")) {
      this.loadUploadedSubmissionIfPassed(rStore);
    } else {
      this.getCurrentLocation();
    }
  }

  setPreSpeciesById(id) {
    this.speciesItems.then(items =>
      items.forEach(i => {
        if (i.id === id) {
          this.observationCreateForm.patchValue({ speciesType: i });
        }
      })
    );
  }

  setPreUserGroupsList(groupIds) {
    const groupsPatch = [];
    this.groupsList.then(groups => {
      groups.forEach(g => {
        if (groupIds.includes(g.id.toString())) {
          groupsPatch.push(g);
        }
      });
    });
    this.observationCreateForm.patchValue({
      userGroups: groupsPatch
    });
  }

  async loadLocalSubmissionIfPassed(rStore) {
    let patch = {};
    this.localObservationId = rStore.id;
    const o = await this.userDataService.getUserObservation(
      this.localObservationId
    );

    // Location
    if (o.hasOwnProperty("lat")) {
      this.setCurrentLocation({
        lat: o.lat,
        lng: o.lng,
        location: o.placeName
      });
    } else {
      this.getCurrentLocation();
    }

    // Images
    o.images.forEach(i => {
      this.observtionImages.push({ ...i, isNew: false });
    });

    // Species Id
    this.setPreSpeciesById(o.group_id);

    // User Groups
    this.setPreUserGroupsList(o.userGroupsList.split(","));

    // Common Name
    let noCommonorScientificName = true;
    if (o.hasOwnProperty("commonName")) {
      patch = {
        ...patch,
        commonName: {
          recoId: o.recoId,
          value: o.commonName
        }
      };
      noCommonorScientificName = false;
    }

    // Scientific Name
    if (o.hasOwnProperty("scientificName")) {
      patch = {
        ...patch,
        scientificName: {
          recoId: o.recoId,
          value: o.scientificName
        }
      };
      noCommonorScientificName = false;
    }

    // Others
    patch = {
      ...patch,
      helpIdentify: noCommonorScientificName,
      notes: o.notes || "",
      fromDate: new Date(o.fromDateObj).toISOString()
    };

    this.observationCreateForm.patchValue(patch);
  }

  async loadUploadedSubmissionIfPassed(rStore) {
    let patch = {};
    const o = rStore.ob;
    const r = rStore.recos;
    const user = await this.userDataService.getUser();

    // Retrives recommendation vote by userId
    let recoVote = {};
    if (r.isVoted) {
      r.votes.forEach(v => {
        v.users.forEach(u => {
          if (u.id === JSON.parse(user.id)) {
            recoVote = v;
          }
        });
      });
    }

    // Location
    if (o.hasOwnProperty("location")) {
      this.setCurrentLocation({
        lat: o.location[1],
        lng: o.location[0],
        location: o.placename
      });
    } else {
      this.getCurrentLocation();
    }

    // Species
    this.setPreSpeciesById(+o.speciesgroupid);

    // User Groups
    this.setPreUserGroupsList(o.usergroupid);

    // Images
    for (const ir of o.tProcessed) {
      this.observtionImages.push({
        path: ir.originalPath,
        thumb: ir.thumb,
        isNew: false
      });
    }

    // Common Name
    let noCommonorScientificName = true;
    if (recoVote.hasOwnProperty("commonNames")) {
      patch = {
        ...patch,
        commonName: {
          recoId: recoVote["recoId"],
          value: recoVote["commonNames"].replace(
            /(^\()[\w\d\s]+(:\s)|(\)$)/g,
            ""
          )
        }
      };
      noCommonorScientificName = false;
    }

    // Scientific Name
    if (recoVote.hasOwnProperty("isScientificName")) {
      if (recoVote["isScientificName"]) {
        patch = {
          ...patch,
          scientificName: {
            recoId: recoVote["recoId"],
            value: recoVote["name"]
          }
        };
        noCommonorScientificName = false;
      }
    }

    // Others
    patch = {
      ...patch,
      observationId: o.id,
      helpIdentify: noCommonorScientificName,
      notes: o.notes || "",
      fromDate: new Date(`${o.fromdate}Z`).toISOString()
    };

    this.observationCreateForm.patchValue(patch);
  }

  async onObservationCreateFormSubmit() {
    if (
      this.observationCreateForm.invalid ||
      this.observtionImages.length < 1
    ) {
      return;
    }
    await this.observationsService.createSingleObservation(
      this.observationCreateForm.value,
      this.observtionImages,
      this.localObservationId
    );
    this.observtionImages = [];
    this.observationCreateForm.reset();
    this.router.navigate(["/user-observations"], { replaceUrl: true });
  }

  get f() {
    return this.observationCreateForm.controls;
  }

  async readExifData(e, isNew) {
    try {
      if (!isNew) {
        return;
      }
      const exif = await this.basicUtilsService.getExifFromElement(e.path[0]);
      if (exif.hasOwnProperty("lat")) {
        const lat = this.basicUtilsService.toDecimal(
          exif.lat,
          exif.GPSLatitudeRef
        );
        const lng = this.basicUtilsService.toDecimal(
          exif.lng,
          exif.GPSLongitudeRef
        );
        this.setCurrentLocation({ lat, lng });
      }
      if (exif.hasOwnProperty("timestamp")) {
        this.observationCreateForm.patchValue({
          fromDate: this.basicUtilsService
            .parseExifDate(exif.timestamp)
            .toISOString()
        });
      }
    } catch (e) {
      console.error("Skipping... No Exif found", e);
    }
  }

  async addObservtionImages(camera: boolean = false) {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };
    try {
      let results = [];
      if (!camera) {
        results = await chooser.getFile("image/*");
      } else {
        results = [{ uri: await this.camera.getPicture(options) }];
      }
      if (!Array.isArray(results)) {
        return;
      }
      for (const i of results) {
        this.observtionImages.push({
          path: i.uri,
          thumb: this.webView.convertFileSrc(
            await this.filePath.resolveNativePath(i.uri)
          ),
          isNew: true
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  removeObservtionImages(i) {
    this.observtionImages.splice(i, 1);
  }

  async initMap() {
    const mapOptions: GoogleMapOptions = this.basicUtilsService.getDefaultMapOptions();
    this.map = GoogleMaps.create("map_canvas", mapOptions);
  }

  getCurrentLocation() {
    this.map.getMyLocation().then((l: MyLocation) => {
      this.setCurrentLocation(l.latLng);
    });
  }

  setCurrentLocation(l) {
    this.map.clear();
    this.map.animateCamera({
      target: l,
      zoom: 6,
      tilt: 35
    });
    Geocoder.geocode({ position: l }).then(r => {
      const location = {
        text: r[0].extra.lines[0] || r[0].extra.featureName,
        value: r[0].position
      };
      if (l.hasOwnProperty("location")) {
        location.text = l.location;
      }
      this.observationCreateForm.patchValue({
        location
      });
      const marker: Marker = this.map.addMarkerSync({
        title: location.text,
        position: location.value,
        animation: GoogleMapsAnimation.BOUNCE
      });
      marker.showInfoWindow();
    });
  }

  locationSelected(e) {
    this.setCurrentLocation({ ...e.value.value, location: e.value.text });
  }

  searchLocation(event) {
    const text = event.text.trim().toLowerCase();
    event.component.startSearch();
    if (!text) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    Geocoder.geocode({ address: text })
      .then((results: GeocoderResult[]) => {
        event.component.items = results.map(r => {
          return {
            value: r.position,
            text: r.extra.lines[0] || r.extra.featureName
          };
        });
      })
      .finally(() => {
        event.component.endSearch();
      });
  }

  /**
   * Searcing species by common or scientific name
   * @param event event returned from ion-selectable
   */
  recoSearch(nameFilter, event) {
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
    event.component.items = [
      {
        value: text,
        acceptedName: text
      }
    ];
    this.searchSubscription = this.observationsService
      .getRecoSuggestion(text, nameFilter)
      .subscribe(
        data => {
          if (this.searchSubscription.closed) {
            return;
          }
          event.component.items.push(...data["model"]["instanceList"]);
          event.component.endSearch();
        },
        error => {
          console.error("Offline", error);
          event.component.endSearch();
        }
      );
  }

  /**
   * Updates scientific name if common name has `recoId`
   * @param event event returned from ion-selectable
   */
  commonNameRecoChanged(event) {
    if (event.value.hasOwnProperty("recoId")) {
      this.observationCreateForm.patchValue({
        scientificName: {
          recoId: event.value.recoId,
          value: event.value.acceptedName
        }
      });
    }
  }
}
