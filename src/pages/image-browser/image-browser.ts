import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GlobalsProvider } from '../../providers/globals/globals';
import { CalendarBBSlist } from '../bbs/rtctrl-customized-singlegroup';
import { ImagesListItem } from '../images-list/imageslist-item';
import "hammerjs";
import { MarkImageBrowserPage } from '../mark-image-browser/mark-image-browser';
/**
 * Generated class for the ImageBrowserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-image-browser',
  templateUrl: 'image-browser.html',
})
export class ImageBrowserPage {
  private bbsindex:number;
  private imageindex:number;
  bbsimageslist:ImagesListItem[];
  protected mode:number;
  enableNavPre: boolean;
  enableNavNext: boolean;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public globals:GlobalsProvider) {
    this.bbsimageslist = this.navParams.get('bbsimages');
    this.bbsindex = this.navParams.get('bbsindex');
    this.imageindex = this.navParams.get('imageindex');
    console.log("ImageBrowserPage::bbsimagelist.length" + this.bbsimageslist.length);
    console.log("ImageBrowserPage::bbsindex = " + this.bbsindex);
    if (this.bbsindex == 0 && this.imageindex == 0)
      this.enableNavPre = false;
    else this.enableNavPre = true;
    if (this.bbsindex == this.bbsimageslist.length-1 && this.imageindex == this.bbsimageslist[this.bbsimageslist.length-1].getImages().length-1)
      this.enableNavNext = false;
    else
      this.enableNavNext = true;
    this.mode = 0;
  }

  onSwipeLeft()
  {
    console.log("ImageBrowserPage::onSwipeLeft");
    
    this.imageindex -= 1;
    if (this.imageindex < 0)
    {
      this.bbsindex -= 1;
      if (this.bbsindex >= 0)
      {
        this.imageindex = this.bbsimageslist[this.bbsindex].getImages().length - 1;
      }
      else
      {
        this.bbsindex = 0;
        this.imageindex = 0;
      }
    }
    if (this.bbsindex == 0 && this.imageindex == 0)
      this.enableNavPre = false;    
    if ((this.bbsindex == this.bbsimageslist.length-1 && this.imageindex == this.bbsimageslist[this.bbsimageslist.length-1].getImages().length-1) == false)
      this.enableNavNext = true;
  }

  onSwipeRight()
  {
    console.log("ImageBrowserPage::onSwipeRight");
    this.imageindex += 1;
    if (this.imageindex >= this.bbsimageslist[this.bbsindex].getImages().length)
    {
      this.bbsindex += 1;
      if (this.bbsindex < this.bbsimageslist.length)
      {
        this.imageindex = 0;
      }
      else
      {
        this.bbsindex = this.bbsimageslist.length - 1;
        this.imageindex = this.bbsimageslist[this.bbsindex].getImages().length - 1;
      }
    }
    if (this.bbsindex == this.bbsimageslist.length-1 && this.imageindex == this.bbsimageslist[this.bbsimageslist.length-1].getImages().length-1)
      this.enableNavNext = false;
    if ((this.bbsindex == 0 && this.imageindex == 0) == false)
      this.enableNavPre = true;
  }

  onDragLeft()
  {
    console.log("onDragLeft");
  }
  onDragRight()
  {
    console.log("onDragRight");
  }

  onTap()
  {
    if (this.mode == 0)
    {

    }
    else if (this.mode == 1)
    {

    }
    if (this.mode == 0)  this.mode = 1;
    else if (this.mode == 1)  this.mode = 0;
  }

  NavBack()
  {
    this.navCtrl.pop();
  }
  
  markThisBBSImages()
  {
    
    let bbsimages = this.bbsimageslist[this.bbsindex];
    //let cur_bbsimgs:ImagesListItem = new ImagesListItem(0, bbsimages.bbsid, bbsimages.title, bbsimages.createdate, bbsimages.groupid, bbsimages.getImages());
    let params = {
      'bbsimages':[bbsimages],
      'bbsindex':0,
      'imageindex':this.imageindex
    };
    this.navCtrl.push(MarkImageBrowserPage, params);
    
  }
}
