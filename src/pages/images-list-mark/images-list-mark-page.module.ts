import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImagesListMarkPage } from './images-list-mark-page';

@NgModule({
  declarations: [
    ImagesListMarkPage,
  ],
  imports: [
    IonicPageModule.forChild(ImagesListMarkPage),
  ],
})
export class ImagesListPageModule {}
