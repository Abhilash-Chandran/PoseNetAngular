import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pose } from '@tensorflow-models/posenet';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PoseReponseModel } from './pose-response.model';
import { VideoModel } from './video.model';


@Injectable({
  providedIn: 'root'
})
export class PoseService {
  BACKEND_URL = environment.backendUrl;
  BACKEND_API_URL = environment.backendUrl + 'api/';

  videoList: VideoModel[] = [];
  datasetNames: string[] = [];

  videoListFetched = new Subject<VideoModel[]>();
  datasetNamesFetched = new Subject<string[]>();
  constructor(private http: HttpClient) {}

  fetchVideos(datasetName: string) {
    this.http
      .get<{ message: string; videos: any }>('http://localhost:3000/api/videos/'+datasetName)
      .pipe(
        map(respBody => {         
          return respBody.videos.map(video => {
            return {
              action: video.action,
              name: video.name,
              srcUrl:
                this.BACKEND_URL + 'video/' + datasetName + '/'+ video.action + '/' + video.name
            };
          });
        })
      )
      .subscribe(videoList => {
        this.videoList = videoList;
        this.videoListFetched.next(this.videoList.slice());
      });
  }

  getVideoList() {
    return this.videoList.slice();
  }

  getVideoListChangedListener() {
    return this.videoListFetched.asObservable();
  }

  saveNewPose(dataset: string, action: string, video_name: string, pose: Pose) {
    const newPose = {
      action: action,
      name: video_name,
      score: pose.score,
      keypoints: pose.keypoints
    };
    this.http
      .post(this.BACKEND_API_URL + 'newpose/' + dataset, newPose)
      .subscribe(reponse => {});
  }

  fetchDatasetNames() {
    this.http.get<{datasets: string[]}>(this.BACKEND_API_URL + 'datasets').subscribe((res) => {
      this.datasetNames = res.datasets;
      this.datasetNamesFetched.next(this.datasetNames);
    });
  }

  getActionNames(datasetName: string) {
    return this.http.get<{message: string, actions: string[]}>(this.BACKEND_API_URL + datasetName + '/actions')
      .pipe(map((response) => {
        return response.actions;
      }));
  }

  getKeyPoints(datasetName: string, actionName: string) {
    return this.http.get<PoseReponseModel>(this.BACKEND_API_URL + datasetName + '/' + actionName + '/keypoints');
  }
 }
