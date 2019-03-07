import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "lessTextPipe"
})
export class LessTextPipe implements PipeTransform {
  transform(
    value: string,
    limit = 12,
    completeWords = false,
    ellipsis = "..."
  ) {
    if (completeWords) {
      limit = value.substr(0, limit).lastIndexOf(" ");
    }
    return value.length > limit
      ? `${value.substr(0, limit)}${ellipsis}`
      : value.substr(0, limit);
  }
}
