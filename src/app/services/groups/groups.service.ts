import { Injectable } from "@angular/core";

import { BasicUtilsService } from "../basic-utils/basic-utils.service";
import { HttpRequestService } from "../http-request/http-request.service";

@Injectable({
  providedIn: "root"
})
export class GroupsService {
  constructor(
    private http: HttpRequestService,
    private basicUtilsService: BasicUtilsService
  ) {}

  async getUserGroups(): Promise<any[]> {
    try {
      const groups = await this.http
        .get("user/currentUserUserGroups")
        .toPromise();
      return Array.isArray(groups) ? groups : [];
    } catch (e) {
      console.error(e);
    }
    return [];
  }

  /**
   * Retrive groups by observation id
   * @param  {observationId} observationId
   * @returns list of groups as array
   */
  async getGroupsByObservationId(observationId: number): Promise<string[]> {
    await this.basicUtilsService.showLoader();
    try {
      const groups = await this.http
        .get(`observation/${observationId}/userGroups`)
        .toPromise();
      this.basicUtilsService.hideLoader();
      return Array.isArray(groups) ? groups : [];
    } catch (e) {
      console.error(e);
      this.basicUtilsService.hideLoader();
    }
    return [];
  }

  /**
   * Retrive groups by observation id
   * @returns list of groups as array
   */
  async getAllGroups(): Promise<object[]> {
    await this.basicUtilsService.showLoader();
    try {
      const groups = await this.http.get(`userGroup/list`).toPromise();
      this.basicUtilsService.hideLoader();
      if (Array.isArray(groups)) {
        const userGroups = await this.getUserGroups();
        const userGroupsId = [];
        for (const i in userGroups) {
          userGroupsId.push(userGroups[i]["id"]);
        }
        const cleanGroupData = groups.map(g => {
          return {
            id: g.id,
            name: g.name,
            joined: userGroupsId.includes(g.id)
          };
        });
        return cleanGroupData;
      }
    } catch (e) {
      console.error(e);
      this.basicUtilsService.hideLoader();
    }
    return [];
  }

  /**
   * Retrive groups by observation id
   * @param  {observationId} observationId
   * @returns list of groups as array
   */
  async joinGroup(userId: number): Promise<object> {
    await this.basicUtilsService.showLoader();
    try {
      const groups = await this.http
        .get(`../api/group/${userId}/joinUs`)
        .toPromise();
      this.basicUtilsService.hideLoader();
      return groups;
    } catch (e) {
      console.error(e);
      this.basicUtilsService.hideLoader();
    }
    return {};
  }
}
