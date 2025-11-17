import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ImageBrowserPage } from './image-browser';

@NgModule({
  declarations: [
    ImageBrowserPage,
  ],
  imports: [
    IonicPageModule.forChild(ImageBrowserPage),
  ],
})
export class ImageBrowserPageModule {}
