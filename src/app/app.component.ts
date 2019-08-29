import { Component } from '@angular/core';
import { ConfigService } from './config.service';
import { Config } from './shared/config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  config: Config;
  dataFromServer: string;
  title = 'testHTTPAngular';
  headers: any;
  constructor(private configService: ConfigService) {}

  onGetDataFromServer() {
    this.configService.getConfig()
      .subscribe((data: Config) => {
        this.config = {...data};
        this.dataFromServer = this.config.heroesUrl + '\n' + this.config.textfile;
      });
  }

  showConfigResponse() {
    this.configService.getConfigResponse()
      // resp is of type `HttpResponse<Config>`
      .subscribe(resp => {
        // display its headers
        const keys = resp.headers.keys();
        this.headers = keys.map(key =>
          console.log(`${key}: ${resp.headers.get(key)}`));
        // access the body directly, which is typed as `Config`.
        this.config = { ... resp.body };
        this.dataFromServer = this.config.heroesUrl + '\n' + this.config.textfile;
      });
  }
}
