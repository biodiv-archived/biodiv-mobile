import { Injectable } from "@angular/core";
import { Events } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { TranslateService } from "@ngx-translate/core";

import { CONSTANTS } from "../../constants";
import { GroupsService } from "../../services/groups/groups.service";
import { UserDataService } from "../../services/user-data/user-data.service";
import { BasicUtilsService } from "../basic-utils/basic-utils.service";
import { HttpRequestService } from "../http-request/http-request.service";
import { ObservationsTransformService } from "./observations.transform.service";

@Injectable({
  providedIn: "root"
})
export class ObservationsService {
  observations;

  constructor(
    private http: HttpRequestService,
    private basicUtilsService: BasicUtilsService,
    private userDataService: UserDataService,
    private groupsService: GroupsService,
    private ots: ObservationsTransformService,
    private events: Events,
    private translateService: TranslateService,
    private storage: Storage
  ) {}

  async getAllSpecies() {
    try {
      const species = await this.http.get("species/list").toPromise();
      this.storage.set(
        CONSTANTS.STORAGE.SPECIES,
        Array.isArray(species) ? species : []
      );
    } catch (e) {
      console.error(e);
    }
    return (await this.storage.get(CONSTANTS.STORAGE.SPECIES)) || [];
  }

  async getObservations(options) {
    try {
      const observvations = await this.http
        .get("naksha/search/observation/observation", options)
        .toPromise();
      return this.ots.processObservationMedia(observvations["documents"]);
    } catch (e) {
      console.error(e);
    }
    return [];
  }

  getObservationsArgs(
    reload: boolean = false,
    args,
    argsMax,
    filteredSpecies,
    bounds?
  ) {
    const opts = {
      count: args.count++,
      offset: args.offset + argsMax,
      sGroup: filteredSpecies || []
    };
    let resetOpts = {};
    if (reload) {
      resetOpts = {
        count: 0,
        offset: 0
      };
    }
    let boundsP = {};
    if (bounds) {
      boundsP = {
        offset: 0,
        max: argsMax * 4,
        location: `${bounds.farLeft.lng},${bounds.farLeft.lat},${
          bounds.farRight.lng
        },${bounds.farRight.lat},${bounds.nearLeft.lng},${
          bounds.nearLeft.lat
        },${bounds.nearRight.lng},${bounds.nearRight.lat}`
      };
    }
    args = { ...args, ...opts, ...resetOpts, ...boundsP };
    return args;
  }

  /**
   * Returns recommendation votes of observations
   * @param observationIds
   * @returns JSON object containing objects of observation id(s)
   */
  async getRecommendationVotes(observationIds): Promise<any> {
    const u = await this.userDataService.getUser();
    try {
      const rVotes = await this.http
        .get("observation/recommendationVotes", {
          obvIds: observationIds,
          isAdmin: false,
          isSpeciesAdmin: false,
          loggedInUserId: u.id
        })
        .toPromise();
      return this.ots.processRecommendationVotes(rVotes, u);
    } catch (e) {
      console.error(e);
    }
    return {};
  }

  /**
   * Returns recommendation votes of observations
   * @param holderId Observation Id
   * @param refTime Last feed timestamp
   * @param limit How many feeds
   * @returns JSON object containing objects of feed on perticular observation
   */
  async getActivityFeed(holderId, refTime, limit: number = 2): Promise<any> {
    try {
      const feeds = await this.http
        .get("activityFeed/feeds", {
          rootHolderId: holderId,
          rootHolderType: "species.participation.Observation",
          feedType: "specific",
          feedPermission: "editable",
          feedOrder: "oldestFirst",
          refrshType: "manual",
          timeLine: "older",
          refTime: refTime,
          max: limit
        })
        .toPromise();
      return this.ots.processActivityFeed(feeds);
    } catch (e) {
      console.error(e);
    }
    return {};
  }

  /**
   * Returns recommendation votes of observations
   * @returns JSON Array containing list of languages
   */
  async getLanguages(): Promise<object[]> {
    try {
      const langs = await this.http.get("../language/filteredList").toPromise();
      if (Array.isArray(langs)) {
        return langs.map(lang => {
          return {
            text: lang,
            value: lang
          };
        });
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  }

  /**
   * Adds recommendation vote on a observation
   * @param suggestion Object containing suggestion data
   * @returns data response from server if request was success other wise false
   */
  async addComment(obvId, text): Promise<any> {
    try {
      return await this.http
        .post(
          "comment/addComment",
          {},
          {
            commentBody: text,
            commentHolderId: obvId,
            commentHolderType: "species.participation.Observation",
            rootHolderId: obvId,
            rootHolderType: "species.participation.Observation",
            commentPostUrl: "/comment/addComment",
            userLanguage: "en",
            newerTimeRef: +new Date()
          }
        )
        .toPromise();
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  /**
   * Adds recommendation vote on a observation
   * @param suggestion Object containing suggestion data
   * @returns data response from server if request was success other wise false
   */
  async addRecommendationVote(suggestion): Promise<any> {
    try {
      const recoVote = await this.http
        .post("observation/addRecommendationVote", {}, suggestion)
        .toPromise();
      return recoVote;
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  /**
   * Removed given recommendation on a observation
   * @param obvId Observation Id
   * @param recoId Recommendation Id
   * @returns data response from server if request was success other wise false
   */
  async removeRecommendationVote(obvId, recoId): Promise<any> {
    try {
      const recoVote = await this.http
        .post("../observation/removeRecommendationVote", {}, { obvId, recoId })
        .toPromise();
      return recoVote;
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  /**
   * Removed given recommendation on a observation
   * @param obvId Observation Id
   * @param recoId Recommendation Id
   * @param noOfVotes Current count of votes on Recommendation
   * @returns data response from server if request was success other wise false
   */
  async addAgreeRecommendationVote(obvId, recoId, noOfVotes): Promise<any> {
    try {
      const recoVote = await this.http
        .post(
          "../observation/addAgreeRecommendationVote",
          {},
          { obvId, recoId, noOfVotes }
        )
        .toPromise();
      return recoVote;
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  getRecoSuggestion(term, nameFilter) {
    return this.http.get("../recommendation/suggest", {
      term,
      nameFilter
    });
  }

  /**
   * Removed given recommendation on a observation
   * @param args Arguements
   * @param images Array of selected Images
   * @returns response from server after uploading observation
   */
  async createSingleObservation(args, images, localObservationId?) {
    const saveStatus = await this.userDataService.saveUserObservation(
      {
        ...this.ots.processuploadSingleObservationPayload(args),
        images: images
      },
      localObservationId
    );
    if (saveStatus) {
      const settings = await this.userDataService.getSettings();
      this.syncSingleObservations(true);
    }
    return saveStatus;
  }

  async syncSingleObservations(autoTriggered) {
    try {
      if (!(await this.userDataService.canUploadObservations(autoTriggered))) {
        this.basicUtilsService.showToast(
          this.translateService.instant(
            autoTriggered
              ? "OBSERVATION_CREATE.SAVED_NOT_UPLOADED"
              : "OBSERVATION_CREATE.YOU_ARE_OFFLINE"
          )
        );
        return;
      }

      const pendingObservationKeys = await this.userDataService.getAllUserObservations();
      let location = {};
      for (const oId of pendingObservationKeys) {
        const ob = await this.userDataService.getUserObservation(oId);
        this.events.publish("ibp-uploader:start", ob.images.length);
        if (!ob.location) {
          location = await this.getLocationWithReverseGeocodeIfPossible(ob);
          if (!location.hasOwnProperty("placeName")) {
            this.events.publish("ibp-uploader:failed");
            return;
          }
        }
        const payload = {
          ...ob,
          ...location,
          ...(await this.ots.processuploadSingleObservationImages(ob.images))
        };
        delete payload.images;
        delete payload.lat;
        delete payload.lng;
        delete payload.fromDateObj;
        this.events.publish("ibp-uploader:finishingup");
        let response;
        if (payload.observationId != null) {
          response = await this.http
            .put(`../api/observation/${payload.observationId}`, {}, payload)
            .toPromise();
        } else {
          delete payload.observationId;
          response = await this.http
            .post("../api/observation/save", {}, payload)
            .toPromise();
        }
        if (!response["success"]) {
          this.events.publish("ibp-uploader:failed");
          return;
        }
        await this.userDataService.removeUserObservation(oId);
        this.events.publish("ibp-uploader:end");
      }
    } catch (e) {
      console.error(e);
      this.events.publish("ibp-uploader:failed");
    }
  }

  async getLocationWithReverseGeocodeIfPossible(ob) {
    let position;
    try {
      if (ob.hasOwnProperty("lat")) {
        position = {
          lat: ob.lat,
          lng: ob.lng
        };
      } else {
        position = await this.basicUtilsService.getLocation();
      }
      const geocoded = await this.basicUtilsService.reverseGeoCode(
        position.lat,
        position.lng,
        ob
      );
      return { ...position, ...geocoded };
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  /**
   * Retrive groups by observation id
   * @param  {observationId} observationId
   * @returns list of groups as array
   */
  async toggleObservationGroupPosting(
    observationId: number,
    groupId: number,
    action: string
  ): Promise<boolean> {
    await this.basicUtilsService.showLoader();
    try {
      const response = await this.http
        .post(
          `userGroup/bulkPost`,
          {},
          {
            pullType: "single",
            selectionType: "reset",
            objectType: "biodiv.observation.Observation",
            objectIds: observationId,
            submitType: action,
            userGroups: groupId,
            filterUrl: `${
              this.basicUtilsService.environment.endpointApi
            }/observation/show/${observationId}`
          }
        )
        .toPromise();
      this.basicUtilsService.hideLoader();
      return response["data"] === "success";
    } catch (e) {
      console.error(e);
      this.basicUtilsService.hideLoader();
    }
    return false;
  }

  async getObservationGroups(observationId) {
    const uGroups = await this.groupsService.getUserGroups();
    const oGroups = await this.groupsService.getGroupsByObservationId(
      observationId
    );
    return this.ots.processObservationGroups(uGroups, oGroups);
  }
}
