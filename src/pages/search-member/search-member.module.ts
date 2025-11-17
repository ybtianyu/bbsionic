import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchMemberPage } from './search-member';

@NgModule({
  declarations: [
    SearchMemberPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchMemberPage),
  ],
})
export class SearchMemberPageModule {}
