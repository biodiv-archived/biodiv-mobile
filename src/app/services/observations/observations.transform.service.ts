import { Injectable } from "@angular/core";
import { FilePath } from "@ionic-native/file-path/ngx";
import {
  FileTransfer,
  FileTransferObject,
  FileUploadOptions
} from "@ionic-native/file-transfer/ngx";
import { Events } from "@ionic/angular";

import { AuthenticationDataService } from "../authentication-data/authentication-data.service";
import { BasicUtilsService } from "../basic-utils/basic-utils.service";

@Injectable({
  providedIn: "root"
})
export class ObservationsTransformService {
  readonly imgPrefix =
    this.basicUtilsService.environment.endpointRoot +
    this.basicUtilsService.environment.endpointUserImages;
  readonly obPrefix =
    this.basicUtilsService.environment.endpointRoot +
    this.basicUtilsService.environment.endpointObservationImages;
  readonly ALT_USER_IMAGE = "assets/alt_user.svg";

  constructor(
    private basicUtilsService: BasicUtilsService,
    private events: Events,
    private filePath: FilePath,
    private transfer: FileTransfer,
    private authenticationDataService: AuthenticationDataService
  ) {}

  processObservationMedia(observations) {
    return observations.map(ob => {
      // Media
      let vProcessed = false;
      const tProcessed = [];
      ob.imageresource.forEach(ir => {
        if (ir.startsWith("/")) {
          if (this.isAudioFile(ir)) {
            tProcessed.push({
              type: "audio",
              data: this.obPrefix + ir,
              originalPath: ir,
              thumb: "assets/sound.svg"
            });
          } else {
            const irx = ir.split(".");
            tProcessed.push({
              type: "image",
              data: this.obPrefix + ir,
              originalPath: ir,
              thumb: `${this.obPrefix}${irx[0]}_th2.jpg`
            });
          }
        } else if (ir === "v" && !vProcessed) {
          vProcessed = true;
          ob.urlresource.forEach(ur => {
            const ytId = this.getYoutubeId(ur);
            if (ytId) {
              tProcessed.push({
                type: "youtube",
                data: ytId,
                originalPath: ir,
                thumb: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
              });
            }
          });
        }
        return {
          type: "image",
          data: ir,
          thumb: ir
        };
      });
      ob["tProcessed"] = tProcessed;

      // User Profile Pictures
      let url = ob.authorprofilepic || this.ALT_USER_IMAGE;
      if (url.startsWith("/")) {
        url = this.imgPrefix + url;
      }
      ob.authorprofilepic = url;

      // Thumbnail
      let tUrl = `${ob.thumbnail}`;
      if (tUrl === "v") {
        tUrl = tProcessed[0].thumb;
      } else if (tUrl.startsWith("/")) {
        if (this.isAudioFile(tUrl)) {
          tUrl = "assets/sound.svg";
        } else {
          const irx = tUrl.split(".");
          tUrl = `${this.obPrefix}${irx[0]}_th2.jpg`;
        }
      }
      ob.thumbnail = tUrl;
      return ob;
    });
  }

  processRecommendationVotes(votes, u) {
    const _obs = [];
    for (const key in votes) {
      if (votes.hasOwnProperty(key)) {
        const ob = votes[key].recoVotes;
        const _ob = { id: key, votes: [], isVoted: false };
        ob.forEach(reco => {
          const _vote = {
            name: reco.normalizedForm,
            commonNames: reco.commonNames || reco.name,
            recoId: reco.recoId,
            isScientificName: reco.isScientificName,
            noOfVotes: reco.noOfVotes - 1,
            isLocked: reco.isLocked,
            isVoted: false,
            users: []
          };
          reco.authors.forEach(author => {
            author = author[0];
            if (author.id.toString() === u.id.toString()) {
              _vote.isVoted = true;
              _ob.isVoted = true;
            }
            const _user = {
              id: author.id,
              name: author.name
            };
            let imgt = author.profilePic || this.ALT_USER_IMAGE;
            if (imgt.startsWith("/")) {
              imgt = this.imgPrefix + author.profilePic;
            }
            _user["profilePic"] = imgt;
            _vote.users.push(_user);
          });
          _ob.votes.push(_vote);
        });
        _obs.push(_ob);
      }
    }
    return _obs.length > 1 ? _obs : _obs[0];
  }

  processActivityFeed(feeds) {
    feeds.model.feeds = feeds.model.feeds.reverse().map(feed => {
      let img = feed.author.icon || this.ALT_USER_IMAGE;
      if (img.startsWith("/")) {
        img = this.imgPrefix + img;
      }
      feed.author.icon = img;
      return feed;
    });
    return feeds;
  }

  /**
   * Reshapes payload that is suitable for sending request
   * @param images
   * @returns object with keys
   */
  processuploadSingleObservationPayload(args) {
    const fDate = args.fromDate.split("-");
    const userGroup = [];
    for (const g in args.userGroups) {
      userGroup.push(args.userGroups[g]["id"]);
    }
    let payload = {
      group_id: args.speciesType.id,
      placeName: undefined,
      agreeTerms: "on",
      resourceListType: "ofObv",
      protocol: "MOBILE",
      habitat_id: 267835,
      fromDate: `${fDate[2].split("T")[0]}/${fDate[1]}/${fDate[0]}`,
      fromDateObj: args.fromDate,
      userGroupsList: userGroup.toString(),
      observationId: args.observationId
    };
    if (args.location) {
      payload = {
        ...payload,
        ...{
          placeName: args.location.text,
          areas: `POINT(${args.location.value.lng} ${args.location.value.lat})`,
          lng: args.location.value.lng,
          lat: args.location.value.lat
        }
      };
    }
    if (!args.helpIdentify) {
      if (args.commonName.hasOwnProperty("recoId")) {
        payload["recoId"] = args.commonName.recoId;
      }
      if (args.scientificName.hasOwnProperty("recoId")) {
        payload["recoId"] = args.scientificName.recoId;
      }
      if (args.scientificName) {
        payload["recoName"] = args.scientificName.value;
      }
      if (args.commonName) {
        payload["commonName"] = args.commonName.value;
      }
    }
    if (args.hasOwnProperty("notes")) {
      payload["notes"] = args.notes;
    }
    return payload;
  }

  /**
   * Uploads images one by one
   * @param images
   * @returns keys of uploaded images
   */
  async processuploadSingleObservationImages(images) {
    const payload = {};
    const endpoint =
      "../api/observation/upload_resource?resType=species.participation.Observation";

    let ic = 0;
    for (const i in images) {
      const nativePath = images[i].path.startsWith("content://")
        ? await this.filePath.resolveNativePath(images[i].path)
        : images[i].path;
      let response;
      if (!images[i].path.startsWith("/")) {
        const r = await this.postMultipartFile(
          endpoint,
          nativePath,
          "resources"
        );
        response = JSON.parse(r["response"]);
      } else {
        response = {
          model: {
            observations: {
              resources: [{ fileName: images[i].path }]
            }
          }
        };
      }
      ++ic;
      payload[`file_${ic}`] =
        response["model"]["observations"]["resources"][0]["fileName"];
      payload[`license_${ic}`] = "CC+BY";
      payload[`type_${ic}`] = "IMAGE";
      this.events.publish("ibp-uploader:imagedone", parseInt(`${i}`, 10) + 1);
    }
    return payload;
  }

  /**
   * Uploads multipartfile for observation
   * @param url endpoint
   * @param filePath file path on device
   * @param fileKey param name
   * @returns keys of uploaded images
   */
  async postMultipartFile(url: string, filePath: string, fileKey: string) {
    const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
    const fileTransfer: FileTransferObject = this.transfer.create();
    const options: FileUploadOptions = {
      fileKey: fileKey,
      fileName: fileName,
      headers: this.authenticationDataService.getRequestOptionsHeaders(false)
    };

    return await new Promise((resolve, reject) => {
      fileTransfer.onProgress(pe => {
        if (pe.lengthComputable) {
          this.events.publish(
            "ibp-uploader:progress",
            Math.floor((pe.loaded / pe.total) * 100)
          );
        }
      });
      fileTransfer
        .upload(filePath, this.basicUtilsService.endpoint + url, options)
        .then(
          r => {
            resolve(r);
          },
          e => {
            reject(e);
          }
        );
    });
  }

  /**
   * Filtered list of observation groups
   * @param uGroups Groups that user is in
   * @param oGroups Groups that observation is posted to
   * @returns array of groups
   */
  async processObservationGroups(uGroups, oGroups) {
    const oGroupsIds = oGroups.map(og => {
      return og.id;
    });
    const ofGroupsPosted = [];
    const ofGroupsNotPosted = [];
    uGroups.forEach(u => {
      if (oGroupsIds.includes(u.id)) {
        ofGroupsPosted.push({
          id: u.id,
          name: u.name,
          isPosted: true
        });
      } else {
        ofGroupsNotPosted.push({
          id: u.id,
          name: u.name,
          isPosted: false
        });
      }
    });
    const ofGroups = [...ofGroupsPosted, ...ofGroupsNotPosted];
    return ofGroups;
  }

  /**
   * Checks if given url is of audio file
   * @param url
   * @returns boolean
   */
  private isAudioFile(url) {
    const formats = [".mp3", ".wav"];
    let isAudio = false;
    formats.forEach(f => {
      if (url.endsWith(f)) {
        isAudio = true;
      }
    });
    return isAudio;
  }

  /**
   * Parses YouTube video id from given Url
   * @param videoUrl
   * @returns YouTube video Id or false
   */
  private getYoutubeId(videoUrl) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    const match = videoUrl.match(regExp);
    return match && match[7].length === 11 ? match[7] : false;
  }
}
