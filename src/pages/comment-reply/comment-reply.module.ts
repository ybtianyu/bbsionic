import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommentReplyPage } from './comment-reply';

@NgModule({
  declarations: [
    CommentReplyPage,
  ],
  imports: [
    IonicPageModule.forChild(CommentReplyPage),
  ],
})
export class CommentReplyPageModule {}
