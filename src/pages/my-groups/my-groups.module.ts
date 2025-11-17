import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyGroupsPage } from './my-groups';

@NgModule({
  declarations: [
    MyGroupsPage,
  ],
  imports: [
    IonicPageModule.forChild(MyGroupsPage),
  ],
})
export class MyGroupsPageModule {}
