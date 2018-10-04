import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Pose, Keypoint, PoseReponseModel } from '../pose-response.model';
import { environment } from 'src/environments/environment';
import { drawKeypoints, drawSkeleton } from 'src/app/shared/data_util';
import { PoseService } from '../pose.service';

@Component({
  selector: 'app-pose-list',
  templateUrl: './pose-list.component.html',
  styleUrls: ['./pose-list.component.css']
})
export class PoseListComponent implements OnInit, AfterViewInit {

  BACKEND_URL = environment.backendUrl;
  fetching = false;
  curr_indx = 0;
  ctxt: any;
  interval_id: any;

  // video variables
  src: string;
  @Input()
  video_title: string;
  @Input()
  dataset: string;
  @Input()
  action: string;

  @ViewChild('loc_canvas') canvas: ElementRef;
  @Input()
  poses: Pose[];

  // shim layer with setTimeout fallback
  requestAnimFrame = (function() {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            function( callback ) {
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  constructor(private poseService: PoseService) { }

  ngOnInit() {
    this.src = this.BACKEND_URL +  'video/' + this.dataset + '/' +  this.action + '/' + this.video_title;
  }

  ngAfterViewInit() {
    this.ctxt = (this.canvas.nativeElement as HTMLCanvasElement).getContext('2d');
  }

  animateKeypoints() {
    this.poseService.getKeyPoints(this.dataset, this.action, this.video_title)
      .subscribe((response: PoseReponseModel) => {
        this.poses = response.poses;
        console.log('Got some poses ' + this.poses.length);
        this.interval_id = setInterval(this.repaintCanvas.bind(this), 1000 / 10 );
      });
  }

  stopAnimation() {
    clearInterval(this.interval_id);
  }

  private repaintCanvas() {
    if (this.poses) {
      if (this.curr_indx === this.poses.length ) {
        this.curr_indx = 0;
      }
      this.ctxt.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      drawSkeleton(this.poses[this.curr_indx].keypoints, 0.0, this.ctxt);
      this.curr_indx++;
    }
  }

}
