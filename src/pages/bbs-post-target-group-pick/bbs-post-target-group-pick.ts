import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {BbsNewPostEditPage} from "../bbs-new-post-edit/bbs-new-post-edit";
import {UserGroupsProvider, GroupInfo, UserGroupsSel} from "../../providers/user-groups/user-groups";
import { BbsPage } from '../bbs/bbs';
//import {GroupUIInfo} from "../bbs-voters-pick/bbs-voters-pick"
/**
 * Generated class for the BbsPostTargetGroupPickPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bbs-post-target-group-pick',
  templateUrl: 'bbs-post-target-group-pick.html',
})
export class BbsPostTargetGroupPickPage {
  private groups:GroupInfo[];
  private bbspage:BbsPage;
  constructor(public navCtrl: NavController, public navParams: NavParams, 
          public user_groups:UserGroupsProvider) {
            this.bbspage = this.navParams.get('bbspage');
            this.groups = this.user_groups.getPostfulGroups();
  }

  private gotoBBSPostPage(groupid:number, groupname:string)
  {
    this.navCtrl.push(BbsNewPostEditPage, {'popparent':this, 'groupid':groupid, 'groupname':groupname});
  }

}
