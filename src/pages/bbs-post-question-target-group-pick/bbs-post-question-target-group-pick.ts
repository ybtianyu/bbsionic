import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {BbsNewQuestionPostPage} from "../bbs-new-question-post/bbs-new-question-post";
import {UserGroupsProvider, GroupInfo} from "../../providers/user-groups/user-groups";
import { BbsPage } from '../bbs/bbs';
/**
 * Generated class for the BbsPostQuestionTargetGroupPickPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bbs-post-question-target-group-pick',
  templateUrl: 'bbs-post-question-target-group-pick.html',
})
export class BbsPostQuestionTargetGroupPickPage {
  private groups:GroupInfo[];
  private bbspage:BbsPage;
  constructor(public navCtrl: NavController, public navParams: NavParams, 
          public user_groups:UserGroupsProvider) {
    this.bbspage = this.navParams.get('bbspage');
    this.groups = this.user_groups.getPostfulGroups();
  }

  private gotoQuestionPostPage(groupid:number, groupname:string)
  {
    this.navCtrl.push(BbsNewQuestionPostPage, {'popparent':this, 'groupid':groupid, 'groupname':groupname});
  }

}
