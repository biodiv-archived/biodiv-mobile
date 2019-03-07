import { Injectable } from "@angular/core";
import { Network } from "@ionic-native/network/ngx";
import { Storage } from "@ionic/storage";
import * as jwtDecode from "jwt-decode";

import { BasicUtilsService } from "../basic-utils/basic-utils.service";

@Injectable({
  providedIn: "root"
})
export class UserDataService {
  readonly STORAGE_USER = "user";
  readonly STORAGE_ACCESS_TOKEN = "access_token";
  readonly STORAGE_REFRESH_TOKEN = "refresh_token";
  readonly USER_OBSERVATIONS_PREFIX = "IBPOB";
  readonly USER_SETTINGS = "settings";

  constructor(
    private storage: Storage,
    private network: Network,
    private basicUtilsService: BasicUtilsService
  ) {}

  async getUser() {
    return this.storage.get(this.STORAGE_USER);
  }

  async setAccessToken(t: string) {
    await this.storage.set(this.STORAGE_USER, jwtDecode(t));
    await this.storage.set(this.STORAGE_ACCESS_TOKEN, t);
    localStorage.setItem(this.STORAGE_ACCESS_TOKEN, t);
  }

  async restoreTokensFromDb() {
    localStorage.setItem(
      this.STORAGE_ACCESS_TOKEN,
      await this.storage.get(this.STORAGE_ACCESS_TOKEN)
    );
    localStorage.setItem(
      this.STORAGE_REFRESH_TOKEN,
      await this.storage.get(this.STORAGE_REFRESH_TOKEN)
    );
  }

  getAccessToken() {
    return localStorage.getItem(this.STORAGE_ACCESS_TOKEN) || "";
  }

  async setRefreshToken(t: string) {
    await this.storage.set(this.STORAGE_REFRESH_TOKEN, t);
    localStorage.setItem(this.STORAGE_REFRESH_TOKEN, t);
  }

  getRefreshToken() {
    return localStorage.getItem(this.STORAGE_REFRESH_TOKEN) || "";
  }

  async clear() {
    return await this.storage.clear();
  }

  async saveUserObservation(observation: object, id?: string) {
    try {
      if (!id) {
        id = this.USER_OBSERVATIONS_PREFIX + this.basicUtilsService.GUID;
      }
      await this.storage.set(id, observation);
      return true;
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  async getUserObservation(id) {
    return await this.storage.get(id);
  }

  async removeUserObservation(id) {
    return await this.storage.remove(id);
  }

  async getAllUserObservations() {
    let keys = await this.storage.keys();
    keys = keys.filter(k => k.startsWith(this.USER_OBSERVATIONS_PREFIX));
    return keys;
  }

  async getSettings() {
    return (
      (await this.storage.get(this.USER_SETTINGS)) || {
        uploadWifiOnly: false,
        uploadManually: false
      }
    );
  }

  async setSettings(payload) {
    await this.storage.set(this.USER_SETTINGS, payload);
  }

  async canUploadObservations(autoTriggered) {
    const s = await this.getSettings();
    if (
      (s.uploadWifiOnly && this.network.type !== "wifi") ||
      (autoTriggered && s.uploadManually) ||
      this.network.type === "none"
    ) {
      return false;
    }
    return true;
  }
}
