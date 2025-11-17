import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BbsMyPage } from './bbs-my';

@NgModule({
  declarations: [
    BbsMyPage,
  ],
  imports: [
    IonicPageModule.forChild(BbsMyPage),
  ],
})
export class BbsMyPageModule {}
