import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

import { BasicUtilsService } from "../../../services/basic-utils/basic-utils.service";
import { GroupsService } from "../../../services/groups/groups.service";

@Component({
  selector: "app-groups",
  templateUrl: "./groups.page.html",
  styleUrls: ["./groups.page.scss"]
})
export class GroupsPage implements OnInit {
  constructor(
    private groupsService: GroupsService,
    private basicUtilsService: BasicUtilsService,
    private translateService: TranslateService
  ) {}

  groups = [];

  ngOnInit() {
    this.loadGroups();
  }

  async loadGroups() {
    this.groups = await this.groupsService.getAllGroups();
  }

  async toggleGroupJoin(group) {
    const response = await this.groupsService.joinGroup(group.id);
    if (response.hasOwnProperty("success")) {
      if (response["success"]) {
        this.loadGroups();
      } else {
        this.basicUtilsService.showToast(
          this.translateService.instant("GROUPS.JOIN_ERROR")
        );
      }
    }
  }
}
