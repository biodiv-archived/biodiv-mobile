import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";

import { PipesModule } from "../../../pipes/pipes.module";
import { CommentModalModule } from "../comment/comment.module";
import { ObservationInfoAddModalModule } from "../observation-info-add/observation-info-add.module";
import { ObservationInfoPage } from "./observation-info.page";

const routes: Routes = [
  {
    path: "",
    component: ObservationInfoPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    ObservationInfoAddModalModule,
    CommentModalModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes)
  ],
  declarations: [ObservationInfoPage]
})
export class ObservationInfoPageModule {}
