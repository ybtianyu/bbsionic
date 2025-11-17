import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QaPage } from './qa';

@NgModule({
  declarations: [
    QaPage,
  ],
  imports: [
    IonicPageModule.forChild(QaPage),
  ],
})
export class QaPageModule {}
