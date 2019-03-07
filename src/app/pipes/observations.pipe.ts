import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "observationPipe"
})
export class ObservationsPipe implements PipeTransform {
  transform(ob: object, limit = 22, completeWords = false, ellipsis = "...") {
    const value = ob["name"] || ob["taxonomycanonicalform"] || "Unknown";
    if (completeWords) {
      limit = value.substr(0, limit).lastIndexOf(" ");
    }
    return value.length > limit
      ? `${value.substr(0, limit)}${ellipsis}`
      : value.substr(0, limit);
  }
}
