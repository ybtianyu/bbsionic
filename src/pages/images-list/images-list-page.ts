import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DatesUtils } from '../../providers/dates/dates';
import { GlobalsProvider } from '../../providers/globals/globals';
import { UserGroupsProvider } from '../../providers/user-groups/user-groups';
import { ImageBrowserPage } from '../image-browser/image-browser';
import { ImagesSearchResultRTCtrl } from './bbs-images-list-rtctrl';
import { ImageSearchOpt, SearchOpt } from './search-opt';

/**
 * Generated class for the ImageBrowserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-images-list',
  templateUrl: 'images-list-page.html',
})
export class ImagesListPage {
  // 图片搜索
  rtctrl:ImagesSearchResultRTCtrl = null;
  searchopts:SearchOpt = null;
  enablemark:boolean = false;
  bKeeprtctrlatLeave: boolean;  //viewImages中设置为true,在调用ionViewDidLeave时才不会释放rtctrl
  //bbsimagesindexlist:[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http:HttpClient,
    public user_groups:UserGroupsProvider, public globals:GlobalsProvider,
    public datesUtils:DatesUtils) {
      console.log("ImagesListPage constructor.......");
    let imagesearchopts:string = this.navParams.get('searchopt');
    //this.bbsimagesindexlist = [];
    this.searchopts = new ImageSearchOpt(imagesearchopts);
    this.rtctrl = new ImagesSearchResultRTCtrl(this.searchopts, this.http, this.user_groups, this.globals, this.datesUtils);
    this.rtctrl.Refresh();
  }

  viewImages(bbsindex:number, index:number)
  {
    let param = {
      'bbsimages':this.rtctrl.getRSTList().getlist(),
      'bbsindex':bbsindex,
      'imageindex':index
    };
    this.bKeeprtctrlatLeave = true;
    this.navCtrl.push(ImageBrowserPage, param);
  }

  loadMore(infiniteScroll)
  {
    console.log("Entering loadMore");	 
    this.rtctrl.requestNextSeg(infiniteScroll);
  //  infiniteScroll.complete();
  }

  ionViewDidEnter()
  {
    console.log("ImagesListPage ionViewDidEnter.......");
    this.bKeeprtctrlatLeave = false;
    if (this.rtctrl != null)
      console.log(this.rtctrl.getRSTList().getlist().length);
    else if (this.rtctrl == null)
      console.log("rtctrl is null");
    else if (this.rtctrl == undefined)
      console.log("rtctrl is undefined");
  }

  ionViewDidLeave()
  {
    console.log("ImagesListPage ionViewDidLeave.......");
    if (this.bKeeprtctrlatLeave == false)
    {
      console.log("ImagesListPage::ionViewDidLeave: delete rtctrl");
      if (this.searchopts != null)
        delete this.searchopts;
      if (this.rtctrl != null)
        delete this.rtctrl;
    }
  }

}
