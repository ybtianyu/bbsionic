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

 class GroupReferredObjectsOp
 {
   groupid:number;
   gros:RefferredObject[];

   constructor(groupid:number, public user_groups:UserGroupsProvider, public http:HttpClient, public globals:GlobalsProvider)
   {
    this.groupid = groupid;
     this.gros = [];
   }

   public fetchfromServer()
   {
       const params = new HttpParams()
       .set('groupid',this.groupid.toString());
           
       let options = {
         "withCredentials":true,
         params:params
       };
       this.http.get<any>(this.globals.server + 'ro/getGroupReferredobjects/',
       options).
       subscribe(
         data => this.updateOnRecvGroupsRefferedData(data),
       err => alert("请求服务器失败")//console.log(JSON.stringify(err))
       );
     }

     updateOnRecvGroupsRefferedData(data:any)
     {
       if (data['status_code'] == 0)
       {
          this.gros = []; //自动释放元素内存空间
          let grolist = data['gros'];
          for (let i = 0; i < grolist.length; i++)
          {
            let ro = new RefferredObject(grolist[i]['id'], grolist[i]['name']); //ro.ischecked = false;
            this.gros.push(ro);
          }
       }
       else
       {
          alert("获取组的相关对象失败");
       }
     }

    public bRoNameExist(name:string):boolean
    {
      for (let i = 0; i < this.gros.length; i++)
      {
        if (this.gros[i].name == name)
          return true;
      }
      return false;
    }

    public saveRo(ro:RefferredObject, callbackObj:any)
    {
      let body = {
        'groupid': this.groupid,
        'name': ro.name
      };
      let options = {
        "withCredentials":true
      };
      this.http.post<any>(this.globals.server + 'ro/request_ReferredPersons/',
      this.encodeHttpParams(body), options).
      subscribe(
        data => this.OnRecvSaveRoResult(data, callbackObj),
        err => alert("请求组的相关对象失败")//console.log(JSON.stringify(err))
      );
    }

    OnRecvSaveRoResult(data:any, callbackObj:any)
    {
      if (data['status_code'] == 0)
      {
        callbackObj.callback_saveRo();
        this.fetchfromServer();
      }
      else
      {
        alert("服务器添加对象失败");
      }
    }

    protected encodeHttpParams(params: any): any {
      if (!params) return null;
      return new HttpParams({fromObject: params});
    }
 }


@IonicPage()
@Component({
  selector: 'page-group-referredobjects',
  templateUrl: 'group-referredobjects.html',
})
export class GroupReferredObjectsPage {
  groupid:number;
  isAdmin:boolean;
  rop:GroupReferredObjectsOp;
  ro:RefferredObject;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http:HttpClient, public user_groups:UserGroupsProvider, public globals:GlobalsProvider) {
    this.groupid = this.navParams.get('groupid');
    this.isAdmin = this.navParams.get('isAdmin');
    this.rop = new GroupReferredObjectsOp(this.groupid, user_groups, http, globals);
    this.rop.fetchfromServer();
    this.ro = null;
  }

  onAddRo()
  {
    if (this.ro != null)
    {
      alert("先保存后才能添加");
      return;
    }
    else
    {
      this.ro = new RefferredObject(-1, "");
    }
  }

  onSaveRo()
  {
    if (this.ro == null)
    {
      alert("请在保存前添加对象名称");
      return;
    }
    else if (this.ro.name == "")
    {
      alert("请输入对象名称");
      return;
    }
    else
    {
      if (this.rop.bRoNameExist(this.ro.name))
      {
        alert("该名称已经存在");
        return;
      }
      else
      {
        this.rop.saveRo(this.ro, this);
      }

      
    }

  }

  public callback_saveRo()
  {
    if (this.ro != null)
    {
      delete this.ro;
      this.ro = null;
    }
  }

}
