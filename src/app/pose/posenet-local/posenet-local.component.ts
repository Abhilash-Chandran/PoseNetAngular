import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as posenet from '@tensorflow-models/posenet';
import { VgAPI, VgMedia } from 'videogular2/core';
import { Subscription } from 'rxjs';
import { PoseService } from '../pose.service';
import { VideoModel } from '../video.model';

@Component({
  selector: 'app-posenet-local',
  templateUrl: './posenet-local.component.html',
  styleUrls: ['./posenet-local.component.css']
})
export class PosenetLocalComponent implements OnInit, OnDestroy {

  api: VgAPI;
  timeUpdateSubs: Subscription;
  loadedMetaDataSubs: Subscription;
  videoEndedSubs: Subscription;
  videoListFetched: Subscription;

  @ViewChild('media') media: ElementRef;
  videoHTML: any;
  videoList: VideoModel[];
  currentIndex = 0;
  currentSrc: string;
  constructor(private poseService: PoseService) { }

  ngOnInit() {
    console.log('ngoninti called once');
    this.videoHTML = this.media.nativeElement;
    this.poseService.fetchVideos();
    this.videoListFetched = this.poseService.getVideoListChangedListener().subscribe((videoListfromApi) => {
      this.videoList = videoListfromApi;
      this.currentSrc = this.videoList[0].srcUrl;
    });
  }

  onPlayerReady(api: VgAPI) {
    console.log('onPlayer ready called.');
    this.api = api;

    this.loadedMetaDataSubs = this.api.getDefaultMedia().subscriptions.loadedMetadata.subscribe(() => {
      console.log('loaded metadata called');
      // setTimeout(() => {
      //   this.playVideo();
      // }, 10000);
    });

    this.videoEndedSubs = this.api.getDefaultMedia().subscriptions.ended.subscribe(() => {
      console.log('video ended called');
      this.nextVideo();
    });

    this.timeUpdateSubs = this.api.getDefaultMedia().subscriptions.timeUpdate.subscribe(() => {
      this.detetectPose(this.videoHTML, this.api.currentTime);
    });
  }

  async detetectPose(video: any, updatedtime: string) {
    const imageScaleFactor = 0.5;
    const outputStride = 16;
    const flipHorizontal = false;

    const net = await posenet.load(0.50);
    const pose = await net.estimateSinglePose(video, imageScaleFactor, flipHorizontal, outputStride);
    net.dispose();
    const currentVideo = this.videoList[this.currentIndex];
    this.poseService.saveNewPose('jhmdb_poses', currentVideo.action, currentVideo.name, pose);
  }
  nextVideo() {
    console.log('current index is ' + this.currentIndex );
   // console.log('playlist length is ' + this.videoList.length);
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

  ngOnDestroy() {
    this.timeUpdateSubs.unsubscribe();
    this.loadedMetaDataSubs.unsubscribe();
    this.videoEndedSubs.unsubscribe();
    this.videoListFetched.unsubscribe();
  }

  stopExraction() {
    this.api.pause();
    this.timeUpdateSubs.unsubscribe();
    this.loadedMetaDataSubs.unsubscribe();
    this.videoEndedSubs.unsubscribe();
  }


}
