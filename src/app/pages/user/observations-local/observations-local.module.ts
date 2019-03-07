import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";

import { PipesModule } from "../../../pipes/pipes.module";
import { ObservationsLocalPage } from "./observations-local.page";

const routes: Routes = [
  {
    path: "",
    component: ObservationsLocalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PipesModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes)
  ],
  declarations: [ObservationsLocalPage]
})
export class ObservationsLocalPageModule {}
