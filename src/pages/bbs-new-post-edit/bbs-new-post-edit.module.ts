import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BbsNewPostEditPage } from './bbs-new-post-edit';

@NgModule({
  declarations: [
    BbsNewPostEditPage,
  ],
  imports: [
    IonicPageModule.forChild(BbsNewPostEditPage),
  ],
})
export class BbsNewPostEditPageModule {}
