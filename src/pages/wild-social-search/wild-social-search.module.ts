import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WildSocialSearchPage } from './wild-social-search';

@NgModule({
  declarations: [
    WildSocialSearchPage,
  ],
  imports: [
    IonicPageModule.forChild(WildSocialSearchPage),
  ],
})
export class WildSocialSearchPageModule {}
