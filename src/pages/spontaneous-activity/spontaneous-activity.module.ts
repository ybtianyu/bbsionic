import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SpontaneousActivityPage } from './spontaneous-activity';

@NgModule({
  declarations: [
    SpontaneousActivityPage,
  ],
  imports: [
    IonicPageModule.forChild(SpontaneousActivityPage),
  ],
})
export class SpontaneousActivityPageModule {}
