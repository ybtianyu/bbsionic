import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BbsVotersPickPage } from './bbs-voters-pick';

@NgModule({
  declarations: [
    BbsVotersPickPage,
  ],
  imports: [
    IonicPageModule.forChild(BbsVotersPickPage),
  ],
})
export class BbsVotersPickPageModule {}
