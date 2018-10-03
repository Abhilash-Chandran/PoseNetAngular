import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import {
  MatButtonModule,
  MatDividerModule,
  MatSelectModule,
  MatToolbarModule,
  MatExpansionModule,
  MatProgressSpinnerModule
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VgBufferingModule } from 'videogular2/buffering';
import { VgControlsModule } from 'videogular2/controls';
import { VgCoreModule } from 'videogular2/core';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfigService } from './config.service';
import { HeaderComponent } from './header/header.component';
import { PoseVerifyComponent } from './pose/pose-verify/pose-verify.component';
import { PosenetLocalComponent } from './pose/posenet-local/posenet-local.component';
import { PoseListComponent } from './pose/pose-list/pose-list.component';

@NgModule({
  declarations: [
    AppComponent,
    PosenetLocalComponent,
    HeaderComponent,
    PoseVerifyComponent,
    PoseListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatToolbarModule,
    MatDividerModule,
    MatSelectModule,
    MatExpansionModule,
    MatProgressSpinnerModule
  ],
  providers: [ConfigService],
  bootstrap: [AppComponent]
})
export class AppModule {}
