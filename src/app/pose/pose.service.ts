import { environment } from '../../environments/environment';

import { OnInit, Injectable } from "@angular/core";
// import * as fs from 'fs';
import { VideoModel } from "./video.model";
import { HttpClient } from "@angular/common/http";


import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PoseService {

    BACKEND_URL = environment.backendUrl;
    BACKEND_API_URL = environment.backendUrl+'api/';

    videoList: VideoModel[] = [];
    videoListFetched = new Subject<VideoModel[]>();
    constructor(private http: HttpClient) { }

    fetchVideos() {
      console.log('poseservice init');
      this.http.get<{message:string, videos: any}>('http://localhost:3000/api/videos')
       .pipe(map((respBody) => {
         console.log(respBody);
         return respBody.videos.map((video) => {
           return {
             action: video.action,
             name: video.name,
             srcUrl: this.BACKEND_URL + 'video/' + video.action + '/' + video.name
           };
         });
       })
      ).subscribe((videoList) => {
          console.log('from service' + videoList[0].srcUrl);
          this.videoList = videoList;
          this.videoListFetched.next(this.videoList.slice());
       });
    }

    getVideoList(){
      return this.videoList.slice();
    }

    getVideoListChangedListener() {
      return this.videoListFetched.asObservable();
    }
}
