import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { BasicUtilsService } from "../basic-utils/basic-utils.service";

@Injectable({
  providedIn: "root"
})
export class HttpRequestService {
  readonly endpoint = this.basicUtilsService.endpoint;

  constructor(
    private http: HttpClient,
    private basicUtilsService: BasicUtilsService
  ) {}

  private toBasicFormData(o: Object): String {
    const body = new URLSearchParams();
    for (const e of Object.entries(o)) {
      body.set(e[0], e[1]);
    }

    return body.toString();
  }

  private jsonToQueryString(json) {
    return (
      "?" +
      Object.keys(json)
        .map(function(key) {
          return encodeURIComponent(key) + "=" + encodeURIComponent(json[key]);
        })
        .join("&")
    );
  }

  get(url: string, body?: object) {
    if (body) {
      url = url + this.jsonToQueryString(body);
    }
    return this.http.get(this.endpoint + url);
  }

  post(url: string, body: object, queryParams?: object) {
    if (queryParams) {
      url = url + this.jsonToQueryString(queryParams);
    }

    return this.http.post(this.endpoint + url, this.toBasicFormData(body));
  }

  put(url: string, body: object, queryParams?: object) {
    if (queryParams) {
      url = url + this.jsonToQueryString(queryParams);
    }

    return this.http.put(this.endpoint + url, this.toBasicFormData(body));
  }
}
