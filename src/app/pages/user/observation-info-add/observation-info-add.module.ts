import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { IonicSelectableModule } from "ionic-selectable";

import { ObservationInfoAddModal } from "./observation-info-add.modal";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IonicSelectableModule,
    TranslateModule.forChild()
  ],
  declarations: [ObservationInfoAddModal],
  entryComponents: [ObservationInfoAddModal]
})
export class ObservationInfoAddModalModule {}
