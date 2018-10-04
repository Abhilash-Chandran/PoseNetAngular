import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as posenet from '@tensorflow-models/posenet';
import { Subscription } from 'rxjs';
import { VgAPI } from 'videogular2/core';
import { PoseService } from '../pose.service';
import { VideoModel } from '../video.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-posenet-local',
  templateUrl: './posenet-local.component.html',
  styleUrls: ['./posenet-local.component.css']
})
export class PosenetLocalComponent implements OnInit, OnDestroy {

  api: VgAPI;
  // canPlaySubs: Subscription;
  loadedMetaDataSubs: Subscription;
  videoEndedSubs: Subscription;
  videoListFetched: Subscription;
  BACKEND_URL = environment.backendUrl;
  datasetDetails = {};
  interval_id: any;
  pose_detect_queue = [];
  posenet: any;
  // select dataset options
  datasets: string[];
  datasetSelected: string;

  // Video element
  @ViewChild('media') media: ElementRef;
  videoList: VideoModel[];
  currentIndex = 0;
  currentSrc: string;
  btn_text = 'Start Extraction';

  isPlaying = false;

  constructor(private poseService: PoseService) { }

  ngOnInit() {
    this.poseService.fetchDatasetDetails();
    this.poseService.datasetDetailsFetched.subscribe((datasetDetails: Object) => {
      this.datasetDetails = datasetDetails;
      this.datasets = Object.keys(this.datasetDetails);
    });
  }

  onPlayerReady(api: VgAPI) {
    console.log('On player ready called.');
    this.api = api;
    this.api.playbackRate = 0.25;
    this.videoEndedSubs = this.api.getDefaultMedia().subscriptions.ended.subscribe(() => {
      console.log('video ended called');
      clearInterval(this.interval_id);
    });
  }

  async detetectPose() {
      const updatedtime = Date.now();
      const video = this.media.nativeElement;
      console.log('pushing ' + updatedtime);
      this.pose_detect_queue.push(updatedtime);
      const imageScaleFactor = 0.5;
      const outputStride = 16;
      const flipHorizontal = false;
      if (!this.posenet) {
        this.posenet = await posenet.load(0.5);
      }
      const pose = await this.posenet.estimateSinglePose(video, imageScaleFactor, flipHorizontal, outputStride);
      // net.dispose();
      const currentVideo = this.videoList[this.currentIndex];
      console.log('removing ' + this.pose_detect_queue.shift());
      this.poseService.saveNewPose(this.datasetSelected, currentVideo.action, currentVideo.name, updatedtime, pose);
      if (this.pose_detect_queue.length === 0) {
        clearInterval(this.interval_id);
        this.nextVideo();
        this.posenet.dispose();
        this.posenet = null;
      }
  }

  nextVideo() {
    console.log('current index is ' + this.currentIndex );
    this.currentIndex++;
    if (this.currentIndex === this.videoList.length) {
        this.currentIndex = 0;
        this.stopExraction();
        return;
    }
    const { srcUrl } = this.videoList[this.currentIndex];
    this.currentSrc = srcUrl;
  }

  playVideo() {
    this.api.play();
  }

  pauseVideo() {
    this.api.pause();
  }

  stopExraction() {
    clearInterval(this.interval_id);
    this.api.pause();
    // this.canPlaySubs.unsubscribe();
    this.loadedMetaDataSubs.unsubscribe();
    this.videoEndedSubs.unsubscribe();
  }

  startOrPauseExtraction() {
    if (this.btn_text === 'Start Extraction') {
      // this.loadedMetaDataSubs = this.api.getDefaultMedia().subscriptions.loadedMetadata.subscribe(() => {
      //   setTimeout(() => {
      //     this.playVideo();
      //   }, 5000);
      // });
      this.playVideo();
      this.interval_id = setInterval(this.detetectPose.bind(this), 1000 / 60);
      this.loadedMetaDataSubs = this.api.getDefaultMedia().subscriptions.loadedMetadata.subscribe(() => {
        setTimeout(() => {
              console.log('loaded Meta data called.');
              clearInterval(this.interval_id);
              this.playVideo();
              this.interval_id = setInterval(this.detetectPose.bind(this), 1000 / 60);
            }, 2000);
      });
      this.btn_text = 'Pause Extraction';
      // this.playVideo();
      // this.interval_id = setInterval(this.detetectPose.bind(this), 1000 / 20);
    } else {
      clearInterval(this.interval_id);
      this.pauseVideo();
      this.btn_text = 'Start Extraction';
      this.locUnsubscribe(this.loadedMetaDataSubs);
      // this.locUnsubscribe(this.canPlaySubs);
    }
  }

  onSelectionChanged(event) {
    this.videoList = [];
    const tmpDataset = this.datasetDetails[this.datasetSelected];
    Object.keys(tmpDataset).forEach(action => {
      tmpDataset[action].forEach(video_title => {
        this.videoList.push(
          new VideoModel(
              action,
              video_title,
              this.BACKEND_URL + 'video/' + this.datasetSelected + '/' + action + '/' + video_title
            )
        );
      });
    });
    this.currentSrc = this.videoList[0].srcUrl;
  }

  ngOnDestroy() {
    // this.locUnsubscribe(this.canPlaySubs);
    this.locUnsubscribe(this.loadedMetaDataSubs);
    this.locUnsubscribe(this.videoEndedSubs);
    this.locUnsubscribe(this.videoListFetched);
    clearInterval(this.interval_id);
  }

  locUnsubscribe(subs: Subscription) {
    if (subs) {
      subs.unsubscribe();
    }
  }
}
