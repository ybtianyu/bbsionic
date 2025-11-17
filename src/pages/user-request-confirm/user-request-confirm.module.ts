import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserRequestConfirmPage } from './user-request-confirm';

@NgModule({
  declarations: [
    UserRequestConfirmPage,
  ],
  imports: [
    IonicPageModule.forChild(UserRequestConfirmPage),
  ],
})
export class UserRequestConfirmPageModule {}
