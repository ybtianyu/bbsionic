import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {BbsDetailPage} from '../bbs-detail/bbs-detail';
import {BbsSearchResultPage} from '../bbs-search-result/bbs-search-result';
/**
 * Generated class for the BbsMyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bbs-my',
  templateUrl: 'bbs-my.html',
})
export class BbsMyPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }
  appliedAnswers()
  {
    let param = {
      "customize_code":4,
      'author_key':"",
      'postdatebegin_key':"",
      'postdateend_key':"",
      'title_key':""
    }
  //  this.navCtrl.push(BbsSearchResultPage, param);
  }

}
