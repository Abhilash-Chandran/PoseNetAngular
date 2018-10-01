import { NgModule } from '@angular/core';
import { PosenetLocalComponent } from './pose/posenet-local/posenet-local.component';
import { PoseVerifyComponent } from './pose/pose-verify/pose-verify.component';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
  { path: '', component: PosenetLocalComponent},
  { path: 'pose-verify', component: PoseVerifyComponent}
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {

}
