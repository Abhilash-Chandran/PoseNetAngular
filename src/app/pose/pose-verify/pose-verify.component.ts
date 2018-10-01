import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PoseService } from '../pose.service';
import { Pose } from '../pose-response.model';

@Component({
  selector: 'app-pose-verify',
  templateUrl: './pose-verify.component.html',
  styleUrls: ['./pose-verify.component.css']
})
export class PoseVerifyComponent implements OnInit {

  datasets: string[] = [];
  datasetSelected: string;

  actions$: Observable<string[]>;
  actionSelected: string;
  constructor(private poseService: PoseService) { }

  poses: Pose[] = [];

  ngOnInit() {
    this.poseService.fetchDatasetNames();
    this.poseService.datasetNamesFetched.subscribe((datasetNames: string[]) => {
      this.datasets = datasetNames;
    });
  }

  onSelectionChanged(event) {
    this.actions$ = null;
    if (this.datasetSelected) {
      this.actions$ = this.poseService.getActionNames(this.datasetSelected);
    }
  }

  onActionChanged(event) {
    console.log('reached the list action ' + this.actionSelected);
    if (this.actionSelected) {
      this.poseService.getKeyPoints(this.datasetSelected, this.actionSelected)
      .subscribe((response) => {
        this.poses = response.poses;
      });
    }
  }
}
