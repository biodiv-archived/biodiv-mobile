import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
  Geocoder,
  GeocoderResult,
  GoogleMap,
  GoogleMapOptions,
  GoogleMaps,
  GoogleMapsAnimation,
  Marker,
  MyLocation
} from "@ionic-native/google-maps";
import { AlertController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

import { AuthenticationService } from "../../../services/authentication/authentication.service";
import { BasicUtilsService } from "../../../services/basic-utils/basic-utils.service";
import signupOptions from "./signup.options.json";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.page.html",
  styleUrls: ["./signup.page.scss"]
})
export class SignupPage implements OnInit {
  signupForm: FormGroup;
  submitted = false;
  @ViewChild("search_address") search_address: ElementRef;
  searchSubscription: Subscription;
  selectedlocation;
  map: GoogleMap;
  searchChanged: Subject<string> = new Subject<string>();
  signupOpts = signupOptions;
  items = [];
  recaptchaKey = this.basicUtilsService.environment.recaptchaKey;

  constructor(
    private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private basicUtilsService: BasicUtilsService,
    private alertController: AlertController,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.loadMap();
    this.initSignUpForm();
  }

  initSignUpForm() {
    this.searchChanged
      .pipe(
        debounceTime(2000),
        distinctUntilChanged()
      )
      .subscribe(event => {
        this.search(event);
      });
    this.signupForm = this.formBuilder.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      captcha: ["", Validators.required],
      passwords: this.formBuilder.group(
        {
          password: ["", [Validators.required, Validators.minLength(8)]],
          password2: ["", [Validators.required, Validators.minLength(8)]]
        },
        { validator: [Validators.required, this.matchValidator] }
      ),
      institutionType: ["", Validators.required],
      occupationType: ["", Validators.required],
      location: [""],
      gender: ["", Validators.required]
    });
    const rData = this.basicUtilsService.getRouterStore();
    if (rData) {
      this.signupForm.patchValue({
        email: rData.email,
        name: rData.name
      });
    }
  }

  matchValidator(group: FormGroup) {
    let valid = false;

    const password = group.controls["password"].value;
    const password2 = group.controls["password2"].value;

    if (password === password2) {
      valid = true;
    }

    if (valid) {
      return null;
    }

    return {
      mismatch: true
    };
  }

  get f() {
    return this.signupForm.value;
  }

  async onSubmit() {
    this.submitted = true;
    if (this.signupForm.invalid) {
      return;
    }

    const sResponse = await this.authenticationService.signup(this.f);

    if (sResponse.success) {
      this.redirectToLogin();
    } else {
      console.error(sResponse);
      this.basicUtilsService.showToast(sResponse.errorText);
    }
  }

  async redirectToLogin() {
    const alert = await this.alertController.create({
      header: this.translateService.instant("SIGNUP.REGISTERED_SUCCESS_HEADER"),
      message: this.translateService.instant(
        "SIGNUP.REGISTERED_SUCCESS_MESSAGE"
      ),
      buttons: [
        {
          text: this.translateService.instant("SIGNUP.OKAY"),
          handler: () => {
            this.router.navigateByUrl("/login");
          }
        }
      ]
    });

    await alert.present();
  }

  async loadMap() {
    if (this.basicUtilsService.isDesktop) {
      return;
    }
    const mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: 23.55,
          lng: 78.55
        },
        zoom: 4,
        tilt: 20
      }
    };
    this.map = GoogleMaps.create("map_canvas", mapOptions);
    this.getCurrentLocation();
  }

  getCurrentLocation() {
    this.map.getMyLocation().then((l: MyLocation) => {
      this.map.animateCamera({
        target: l.latLng,
        zoom: 6,
        tilt: 35
      });
      Geocoder.geocode({ position: l.latLng }).then(r => {
        this.items = [
          {
            text: r[0].extra.lines[0] || r[0].extra.featureName,
            value: r[0].position
          }
        ];
        this.signupForm.patchValue({
          location: this.items[0]
        });
      });
    });
  }

  locationChanged(e) {
    this.map.clear();
    this.map.animateCamera({
      target: e.value.value,
      zoom: 6,
      tilt: 50
    });
    const marker: Marker = this.map.addMarkerSync({
      title: e.value.text,
      position: e.value.value,
      animation: GoogleMapsAnimation.BOUNCE
    });
    marker.showInfoWindow();
  }

  search(event) {
    const text = event.text.trim().toLowerCase();
    event.component.startSearch();
    if (!text) {
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
}
