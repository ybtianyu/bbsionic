import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GroupConfigPage } from './group-config';

@NgModule({
  declarations: [
    GroupConfigPage,
  ],
  imports: [
    IonicPageModule.forChild(GroupConfigPage),
  ],
})
export class GroupConfigPageModule {}
