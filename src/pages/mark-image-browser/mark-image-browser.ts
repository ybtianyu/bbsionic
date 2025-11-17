import { HttpClient, HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GlobalsProvider } from '../../providers/globals/globals';
import { UserGroupsProvider } from '../../providers/user-groups/user-groups';
import { GroupObjectsReferred, GroupObjectsReferredManager, RefferredObject, UserGroupSelUIInfo } from '../advanced-bbs-search/advanced-bbs-search';
import { CalendarBBSlist } from '../bbs/rtctrl-customized-singlegroup';
import { ImageBrowserPage } from '../image-browser/image-browser';
import { ImagesListItem } from '../images-list/imageslist-item';

/**
 * Generated class for the ImageBrowserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 class ObjectsReferredSetOp
 {
   gros:RefferredObject[];
   imgid:number;
   setRolist:number[];
   unsetRolist:number[];

   constructor(imgid:number, public user_groups:UserGroupsProvider, public http:HttpClient, public globals:GlobalsProvider)
   {
     this.imgid = imgid;
     this.gros = [];
     this.setRolist = [];
     this.unsetRolist = [];
   }

   public fetchfromServer()
   {
       const params = new HttpParams()
       .set('imgid',this.imgid.toString());
           
       let options = {
         "withCredentials":true,
         params:params
       };
       this.http.get<any>(this.globals.server + 'image/getreferredobjects/',
       options).
       subscribe(
         data => this.updateOnRecvGroupsRefferedData(data),
       err => alert("请求组的相关对象失败")//console.log(JSON.stringify(err))
       );
     }

     updateOnRecvGroupsRefferedData(data:any)
     {
       if (data['status_code'] == 0)
       {
          let grolist = data['groids'];
          let imgrolist = data['roids'];
          for (let i = 0; i < grolist.length; i++)
          {
            let ro = new RefferredObject(grolist[i]['id'], grolist[i]['name']);
            let bro = false;
            for (let j = 0; j < imgrolist.length; j++)
            {
              if (grolist[i]['id'] == imgrolist[j])
              {
                bro = true;
                break;
              }
            }
            ro.ischecked = bro;
            this.gros.push(ro);
          }
       }
     }

    public bsetRo(roid:number):boolean
    {
      for (let i = 0; i < this.setRolist.length; i++)
      {
        if (this.setRolist[i] == roid)
          return true;
      }
      return false;
    }

    public bunsetRo(roid:number):boolean
    {
      for (let i = 0; i < this.unsetRolist.length; i++)
      {
        if (this.unsetRolist[i] == roid)
          return true;
      }
      return false;
    }

    public appendsetRo(roid:number)
    { console.log("appendsetRo" + roid);
      this.setRolist.push(roid);
    }

    public removesetRo(roid:number)
    { console.log("removesetRo");
      let newsetRo = [];
      for (let i = 0; i < this.setRolist.length; i++)
      {
        if (this.setRolist[i] != roid)
          newsetRo.push(roid);
      }
      this.setRolist = newsetRo;
    }
    public appendunsetRo(roid:number)
    { console.log("appendunsetRo");
      this.unsetRolist.push(roid);
    }

    public removeunsetRo(roid:number)
    { console.log("removeunsetRo");
      let newunsetRo = [];
      for (let i = 0; i < this.unsetRolist.length; i++)
      {
        if (this.unsetRolist[i] != roid)
          newunsetRo.push(roid);
      }
      this.unsetRolist = newunsetRo;
    }

    public switchRoCheck(roid:number, ischecked:boolean)
    {
      if (ischecked)
      {
        if (this.bunsetRo(roid))
          this.removeunsetRo(roid);
        else
          this.appendsetRo(roid);
      }
      else
      {
        if (this.bsetRo(roid))
          this.removesetRo(roid);
        else
          this.appendunsetRo(roid);
      }
    }

    public submitMarkRo()
    {
      let setroids = '';
      for (let i = 0; i < this.setRolist.length; i++)
      { console.log("submitMarkRO: setroid=" + this.setRolist[i].toString());
        setroids += this.setRolist[i].toString();
        setroids += '#';
      }
      console.log(setroids);
      setroids = setroids.substring(0, setroids.length - 1);
      console.log(setroids);
      let unsetroids = '';
      for (let i = 0; i < this.unsetRolist.length; i++)
      {
        unsetroids += this.unsetRolist[i].toString();
        unsetroids += '#';
      }
      unsetroids = unsetroids.substring(0, unsetroids.length - 1);

      let body = {
        'imgid': this.imgid,
        'setroids': setroids,
        'unsetroids': unsetroids
      };
      let options = {
        "withCredentials":true
      };
      this.http.post<any>(this.globals.server + 'image/modifyreferredobjects/',
      this.encodeHttpParams(body), options).
      subscribe(
        data => this.OnRecvModifyRoResult(data),
      err => alert("请求组的相关对象失败")//console.log(JSON.stringify(err))
      );
    }

    OnRecvModifyRoResult(data:any)
    {
      if (data['status_code'] != 0)
        alert("服务器保存对象标识失败");
    }

    protected encodeHttpParams(params: any): any {
      if (!params) return null;
      return new HttpParams({fromObject: params});
    }
 }


@IonicPage()
@Component({
  selector: 'page-mark-image-browser',
  templateUrl: 'mark-image-browser.html',
})
export class MarkImageBrowserPage {
  private bbsindex:number;
  private imageindex:number;
  bbsimageslist:ImagesListItem[];
  groupid:number;
  rop:ObjectsReferredSetOp = null;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http:HttpClient, public user_groups:UserGroupsProvider, public globals:GlobalsProvider) {
    //super(navCtrl, navParams, globals);
    this.bbsimageslist = this.navParams.get('bbsimages');
    this.bbsindex = this.navParams.get('bbsindex');
    this.imageindex = this.navParams.get('imageindex');

    //this.nTap = 0;

    this.groupid = this.bbsimageslist[this.bbsindex].groupid;
    let imgid = this.bbsimageslist[this.bbsindex].getImages()[this.imageindex].imgid;
    this.rop = new ObjectsReferredSetOp(imgid, user_groups, http, globals);
    this.rop.fetchfromServer();
  }

  onSwitchRoChecked(ro:RefferredObject, checkbox:any)
  {
    this.rop.switchRoCheck(ro.id, ro.ischecked);
  }

  onSubmitMarkRo()
  {
    this.rop.submitMarkRo();
  }

  onSwipLeft()
  {
    console.log("ImageBrowserPage::onSwipLeft");
    /*
    this.index -= 1;
    if (this.index < 0)
    {
      this.index = 0;
    }
    this.imgpath = this.navParams.get('imglist')[this.index].path;
    */
  }
  onSwipeRight()
  {
    console.log("ImageBrowserPage::onSwipRight");
    /*
    this.index += 1;
    if (this.index > this.navParams.get('imglist').length-1)
    {
      this.index = this.navParams.get('imglist').length-1;
    }
    this.imgpath = this.navParams.get('imglist')[this.index].path;
    */
  }
  onTap()
  {
  /*  if (this.nTap == 0)  this.nTap = 1;
    if (this.nTap == 1)  this.nTap = 0;
    //if (this.nTap == 1)
  */  
    this.navCtrl.pop();

  }


}
