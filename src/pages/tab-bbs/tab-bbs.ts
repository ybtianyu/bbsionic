import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {QaPage} from "../qa/qa";
import {BbsPage} from "../bbs/bbs";
import {SpontaneousActivityPage} from "../spontaneous-activity/spontaneous-activity";
/**
 * Generated class for the TabBbsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tab-bbs',
  templateUrl: 'tab-bbs.html',
})
export class TabBbsPage {
  public subtabQA:any;
  public subtabTopics:any;
  public subtabSpontaneousActivity:any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.subtabQA = QaPage;
    this.subtabTopics = BbsPage;
    this.subtabSpontaneousActivity = SpontaneousActivityPage;
  }

}
