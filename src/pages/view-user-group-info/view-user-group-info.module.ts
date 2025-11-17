import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewUserGroupInfoPage } from './view-user-group-info';

@NgModule({
  declarations: [
    ViewUserGroupInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewUserGroupInfoPage),
  ],
})
export class ViewUserGroupInfoPageModule {}
