import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {GlobalsProvider} from '../../../src/providers/globals/globals';
import { BbsPage } from '../bbs/bbs';
/**
 * Generated class for the SetSortingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-set-sorting',
  templateUrl: 'set-sorting.html',
})
export class SetSortingPage {
  bbspage:BbsPage;
  constructor(public navCtrl: NavController, public navParams: NavParams,
      public globals:GlobalsProvider) {
    this.bbspage = this.navParams.get('bbspage');
  }

  byupdatetime()
  {
    if (! this.isbyupdatetime())
    {
      this.globals.bbssorting = '-lastupdatedate';
      this.bbspage.Refresh();
    }
    this.bbspage.navCtrl.pop();
  }
  bydianzan()
  {
    if(! this.isbydianzan())
    {
      this.globals.bbssorting = '-dianzancount';
      this.bbspage.Refresh();
    }
    this.bbspage.navCtrl.pop();
  }
  bycomments()
  {
    if(! this.isbycomments())
    {
      this.globals.bbssorting = '-ncomments';
      this.bbspage.Refresh();
    }
    this.bbspage.navCtrl.pop();
  }
  isbyupdatetime():boolean
  {
    return this.globals.bbssorting == '-lastupdatedate';
  }
  isbydianzan():boolean
  {
    return this.globals.bbssorting == '-dianzancount';
  }
  isbycomments():boolean
  {
    return this.globals.bbssorting == '-ncomments';
  }

}
