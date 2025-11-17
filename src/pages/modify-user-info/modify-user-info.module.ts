import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModifyUserInfoPage } from './modify-user-info';

@NgModule({
  declarations: [
    ModifyUserInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(ModifyUserInfoPage),
  ],
})
export class ModifyUserInfoPageModule {}
