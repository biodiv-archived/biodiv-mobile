import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { PhotoViewer } from "@ionic-native/photo-viewer/ngx";
import { IonInfiniteScroll, ModalController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { fromEvent } from "rxjs";

import { BasicUtilsService } from "../../../services/basic-utils/basic-utils.service";
import { ObservationsService } from "../../../services/observations/observations.service";
import { UserDataService } from "../../../services/user-data/user-data.service";
import { CommentModal } from "../comment/comment.modal";
import { ObservationInfoAddModal } from "../observation-info-add/observation-info-add.modal";

@Component({
  selector: "app-observation-info",
  templateUrl: "./observation-info.page.html",
  styleUrls: ["./observation-info.page.scss"]
})
export class ObservationInfoPage implements OnInit {
  ob;
  recos;
  feeds = [];
  feedsInfo;
  audio: HTMLAudioElement;
  groupsList;
  slideOptions = {};
  isEditable = false;
  showAllGroups = false;

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor(
    private router: Router,
    private basicUtilsService: BasicUtilsService,
    private userDataService: UserDataService,
    private photoViewer: PhotoViewer,
    private observationsService: ObservationsService,
    private modalController: ModalController,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.ob = this.basicUtilsService.getRouterStore();
    this.getPostData();
    this.getUserObservationGroups();
    this.setIsEditable();
  }

  setIsEditable() {
    this.userDataService.getUser().then(user => {
      this.isEditable = user.id === this.ob.authorid;
    });
  }

  launchNavigator(observation) {
    this.basicUtilsService.launchNavigator(
      observation.latitude,
      observation.longitude
    );
  }

  getUserObservationGroups() {
    this.groupsList = this.observationsService.getObservationGroups(this.ob.id);
  }

  async toggleObservationGroupPosting(group) {
    const action = group.isPosted ? "Unpost" : "Post";
    const response = await this.observationsService.toggleObservationGroupPosting(
      this.ob.id,
      group.id,
      action
    );
    if (response) {
      this.getUserObservationGroups();
    } else {
      this.basicUtilsService.showToast(
        this.translateService.instant("OBSERVATION_INFO.GROUP_POSTING_FAILED")
      );
    }
  }

  async openModal() {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: ObservationInfoAddModal,
      componentProps: {
        obvIds: this.ob.id
      }
    });

    await modal.present();
    const r = await modal.onDidDismiss();
    if (r.data) {
      const result = ((r || {}).data || {}).data;
      this.getPostData();
      this.recommendationVoteMessage(result);
    }
  }

  async openCommentModal() {
    const modal: HTMLIonModalElement = await this.modalController.create({
      component: CommentModal
    });

    await modal.present();
    const r = await modal.onDidDismiss();
    if (r.data) {
      const commentResponse = await this.observationsService.addComment(
        this.ob.id,
        r.data
      );
      this.recommendationVoteMessage(
        commentResponse,
        "INFO_COMMENT_ADDED",
        "ERR_UNABLE_TO_ADD_COMMENT"
      );
    }
  }

  private async getPostData() {
    this.feedsInfo = {
      remainingFeedCount: 1,
      olderTimeRef: +new Date()
    };
    this.recos = await this.observationsService.getRecommendationVotes(
      this.ob.id
    );
    this.feeds = [];
    this.loadFeed();
  }

  async loadFeed(event?) {
    const tFeed = await this.observationsService.getActivityFeed(
      this.ob.id,
      this.feedsInfo.olderTimeRef
    );
    this.feeds.push(...tFeed.model.feeds);
    this.feedsInfo = {
      remainingFeedCount: tFeed.remainingFeedCount,
      olderTimeRef: tFeed.olderTimeRef
    };
    this.infiniteScroll.disabled = !tFeed.remainingFeedCount;
    if (event) {
      event.target.complete();
    }
  }

  openThumb(i) {
    const thumb = this.ob.tProcessed[i];
    if (thumb.type === "image") {
      this.photoViewer.show(thumb.data);
    } else if (thumb.type === "audio") {
      if (!this.audio) {
        this.audio = new Audio();
        this.audio.src = thumb.data;
        this.audio.load();
        fromEvent(this.audio, "canplay").subscribe(canPlay => {
          if (canPlay) {
            this.audio.play();
            fromEvent(this.audio, "ended").subscribe(() => {
              this.stopAudio(i);
            });
            thumb.thumb = "assets/sound-pause.svg";
          } else {
            this.stopAudio(i);
            window.open(`${thumb.data}`, "_system", "location=yes");
          }
        });
      } else {
        this.stopAudio(i);
      }
      this.ob.tProcessed[i] = thumb;
    } else if (thumb.type === "youtube") {
      window.open(`https://youtu.be/${thumb.data}`, "_system", "location=yes");
    }
  }

  stopAudio(i) {
    const thumb = this.ob.tProcessed[i];
    this.audio.pause();
    this.audio = undefined;
    thumb.thumb = "assets/sound.svg";
  }

  ionViewWillLeave() {
    if (this.audio) {
      this.stopAudio(0);
    }
  }

  async removeRecommendationVote(vo) {
    const r = await this.observationsService.removeRecommendationVote(
      this.ob.id,
      vo.recoId
    );
    this.recommendationVoteMessage(r.success);
  }

  async addAgreeRecommendationVote(vo) {
    const r = await this.observationsService.addAgreeRecommendationVote(
      this.ob.id,
      vo.recoId,
      vo.noOfVotes + 1
    );
    this.recommendationVoteMessage(r.success);
  }

  recommendationVoteMessage(
    r,
    sKey = "INFO_SUGGESTION_ADDED",
    eKey = "ERR_UNABLE_TO_ADD_SUGGESTION"
  ) {
    const messageKey = r ? sKey : eKey;
    this.getPostData();
    this.basicUtilsService.showToast(
      this.translateService.instant(`OBSERVATION_INFO.MESSAGES.${messageKey}`)
    );
  }

  editObservation() {
    this.basicUtilsService.setRouterStore({
      isUploadedOb: true,
      ob: this.ob,
      recos: this.recos
    });
    this.router.navigate(["/user-observation-create"]);
  }

  async deleteObservation() {
    const deleted = await this.observationsService.deleteObservation(
      this.ob.id
    );
    this.basicUtilsService.showToast(
      this.translateService.instant(
        deleted
          ? "OBSERVATION_INFO.OBSERVATION_DELETE_SUCCESS"
          : "OBSERVATION_INFO.OBSERVATION_DELETE_FAILURE"
      )
    );
    if (deleted) {
      this.basicUtilsService.setRouterStore({ reload: true });
      this.router.navigate(["/user-observations"]);
    }
  }
}
