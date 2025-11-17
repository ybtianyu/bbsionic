import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MarkImageBrowserPage } from './mark-image-browser';

@NgModule({
  declarations: [
    MarkImageBrowserPage,
  ],
  imports: [
    IonicPageModule.forChild(MarkImageBrowserPage),
  ],
})
export class MarkImageBrowserPageModule {}
