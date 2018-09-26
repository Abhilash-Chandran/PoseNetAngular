import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Config } from './shared/config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  configUrl = "assets/config.json";

  constructor(private httpc: HttpClient) { }

  getConfig() {
    return this.httpc.get<Config>(this.configUrl);
  }

  getConfigResponse(): Observable<HttpResponse<Config>> {
    return this.httpc.get<Config>(
      this.configUrl, { observe: 'response' });
  }
}
