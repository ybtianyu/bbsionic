import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImagesListPage } from './images-list-page';

@NgModule({
  declarations: [
    ImagesListPage,
  ],
  imports: [
    IonicPageModule.forChild(ImagesListPage),
  ],
})
export class ImagesListPageModule {}
