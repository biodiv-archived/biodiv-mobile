import { NgModule } from "@angular/core";

import { LessTextPipe } from "./less-text.pipe";
import { ObservationsPipe } from "./observations.pipe";
import { SafePipe } from "./safe.pipe";

@NgModule({
  declarations: [ObservationsPipe, LessTextPipe, SafePipe],
  imports: [],
  exports: [ObservationsPipe, LessTextPipe, SafePipe]
})
export class PipesModule {}
