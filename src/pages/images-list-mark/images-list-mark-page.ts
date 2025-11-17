import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DatesUtils } from '../../providers/dates/dates';
import { GlobalsProvider } from '../../providers/globals/globals';
import { UserGroupsProvider } from '../../providers/user-groups/user-groups';
import { ImageBrowserPage } from '../image-browser/image-browser';
import { ImagesListPage } from '../images-list/images-list-page';
import { MarkImageBrowserPage } from '../mark-image-browser/mark-image-browser';

/**
 * Generated class for the ImageBrowserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-images-list-mark',
  templateUrl: 'images-list-mark-page.html',
})
export class ImagesListMarkPage extends ImagesListPage
{
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http:HttpClient,
    public user_groups:UserGroupsProvider, public globals:GlobalsProvider,
    public datesUtils:DatesUtils) {
    super(navCtrl, navParams, http, user_groups, globals, datesUtils);
  }

  viewImages(bbsindex:number, index:number)
  {
    let param = {
      'bbsimages':this.rtctrl.getRSTList().getlist(),
      'bbsindex':bbsindex,
      'imageindex':index
    };
    this.bKeeprtctrlatLeave = true;
    this.navCtrl.push(MarkImageBrowserPage, param);
  }

  loadMore(infiniteScroll)
  {
    console.log("Entering loadMore");	 
    super.loadMore(infiniteScroll);
  }

  ionViewDidEnter()
  {
    console.log("ImagesListMarkPage ionViewDidEnter.......");
    super.ionViewDidEnter();
  }

  ionViewDidLeave()
  {
    console.log("ImagesListMarkPage ionViewDidLeave.......");
    super.ionViewDidLeave();
  }

}
