import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewUserBasicInfoPage } from './view-user-basic-info';

@NgModule({
  declarations: [
    ViewUserBasicInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewUserBasicInfoPage),
  ],
})
export class ViewUserBasicInfoPageModule {}
