import { Injectable } from "@angular/core";
import { Coordinates, Geolocation } from "@ionic-native/geolocation/ngx";
import { NativeGeocoder } from "@ionic-native/native-geocoder/ngx";
import { LoadingController, Platform, ToastController } from "@ionic/angular";
import { getData, getTag } from "exif-js";

import { environment } from "../../../environments/environment";

declare var AdvancedGeolocation;

@Injectable({
  providedIn: "root"
})
export class BasicUtilsService {
  isLoading = false;
  private routerStore: any;
  private count = 0;

  constructor(
    private toastController: ToastController,
    private loadingController: LoadingController,
    private platform: Platform,
    private nativeGeocoder: NativeGeocoder,
    private geolocation: Geolocation
  ) {}

  async showLoader() {
    this.count++;
    if (this.count === 1) {
      const modal = await this.loadingController.create({});
      modal.present();
    }
  }

  async hideLoader() {
    this.count--;
    if (this.count === 0) {
      const modal = await this.loadingController.getTop();
      modal.dismiss();
    }
  }

  async showToast(text: string) {
    this.count++;
    const toast = await this.toastController.create({
      message: text,
      duration: 2000
    });
    toast.present();
  }

  public setRouterStore(data) {
    this.routerStore = data;
  }

  public getRouterStore() {
    return this.routerStore;
  }

  public launchNavigator(lat, lng, label: string = "observation") {
    if (this.platform.is("ios")) {
      window.open(`maps://?q=${lat},${lng}`, "_system");
    } else {
      window.open(`geo:0,0?q=${lat},${lng}(${encodeURI(label)})`, "_system");
    }
  }

  public getToday() {
    const t = new Date();
    return `${t.getFullYear()}-${("0" + (t.getMonth() + 1)).slice(-2)}-${(
      "0" + t.getDate()
    ).slice(-2)}`;
  }

  public getDefaultMapOptions() {
    return {
      camera: {
        target: {
          lat: 23.55,
          lng: 78.55
        },
        zoom: 4,
        tilt: 20
      }
    };
  }

  /**
   * Common for retriving environment
   * @returns {object} configuration object.
   */
  get environment() {
    return environment;
  }

  get isDesktop() {
    return this.platform.is("desktop");
  }

  /**
   * Generates a GUID string.
   * @returns {String} The generated GUID.
   */
  get GUID() {
    return (
      (Math.random().toString(16) + "000000000").substr(2, 8) +
      (Math.random().toString(16) + "000000000").substr(2, 8)
    );
  }

  get endpoint(): string {
    const ep = this.environment.endpointRoot + this.environment.endpointApi;
    if (ep.startsWith("http")) {
      return ep;
    }
    if (
      window &&
      "location" in window &&
      "protocol" in window.location &&
      "host" in window.location
    ) {
      return window.location.protocol + "//" + window.location.host + ep;
    }
    return ep;
  }

  /**
   * Parses exif lat/lng
   * @see https://awik.io/extract-gps-location-exif-data-photos-using-javascript/
   * @param timestamp Exif lat/lng
   * @returns reverse geocoadable lat/lng
   */
  toDecimal(coords, coordsRef) {
    let dd = coords[0] + coords[1] / 60 + coords[2] / 3600;

    if (coordsRef === "S" || coordsRef === "W") {
      dd = dd * -1;
    }

    return dd;
  }

  /**
   * Parses exif timestamp and returns as date
   * @param timestamp Exif timestamp string e.g. 2019:03:09 14:49:21
   * @returns JavaScript Date object
   */
  parseExifDate(timestamp) {
    const h = timestamp.split(/\D/);
    return new Date(h[0], h[1] - 1, h[2], h[3], h[4], h[5]);
  }

  getExifFromElement(image): Promise<any> {
    return new Promise((resolve, reject) => {
      getData(image, function() {
        let response = {};
        const timestamp = getTag(this, "DateTimeOriginal") || getTag(this, "DateTime");
        const lat = getTag(this, "GPSLatitude");
        const lng = getTag(this, "GPSLongitude");
        if (timestamp) {
          response = { ...response, ...{ timestamp } };
        }
        if (lat && lng) {
          response = { ...response, ...{ lat, lng } };
        }
        resolve(response);
      });
    });
  }

  getLocation(): Promise<object> {
    return new Promise((resolve, reject) => {
      this.geolocation
        .getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 30000
        })
        .then(resp => {
          const r1: Coordinates = resp.coords;
          resolve({ lat: r1.latitude, lng: r1.longitude });
        })
        .catch(error => {
          console.error("Error getting location from first GPS", error);
          if (this.platform.is("android")) {
            AdvancedGeolocation.start(
              response => {
                const r2 = JSON.parse(response);
                AdvancedGeolocation.stop();
                resolve({ lat: r2.latitude, lng: r2.longitude });
              },
              error1 => {
                AdvancedGeolocation.stop();
                reject(error1);
              },
              {
                minTime: 500,
                minDistance: 1,
                noWarn: true,
                providers: "all",
                useCache: true,
                satelliteData: false,
                buffer: false,
                bufferSize: 0,
                signalStrength: false
              }
            );
          } else {
            reject(error);
          }
        });
    });
  }

  async reverseGeoCode(lat, lng, ob: any = {}) {
    const r = await this.nativeGeocoder.reverseGeocode(lat, lng);
    return {
      areas: `POINT(${lng} ${lat})`,
      placeName: ob.hasOwnProperty("placeName")
        ? ob.placeName
        : `${r[0].subAdministrativeArea}, ${r[0].postalCode} - ${
            r[0].locality
          } ${r[0].countryName}`
    };
  }
}
