import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {HttpClient, HttpParams} from "@angular/common/http";
import {GlobalsProvider} from "../../providers/globals/globals";
import { MyGroupsPage } from '../my-groups/my-groups';
import { UserGroupsProvider } from '../../providers/user-groups/user-groups';

/**
 * Generated class for the NewGroupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-new-group',
  templateUrl: 'new-group.html',
})
export class NewGroupPage {
  private groupname:string="";
  private zone:string="";
  private groupid:number;
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public globals:GlobalsProvider, public user_groups:UserGroupsProvider) {
  }
  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }
  
  private submit()
  {
    let body = {
      'username':this.globals.username,
      'groupname':this.groupname,
      'zone':this.zone
    };
    let options = {
      "withCredentials":true
    };
      this.http.post<any>(this.globals.server + 'group/creategroup/', this.encodeHttpParams(body), options
    )
    .subscribe(
    data => this.onPOSTResponse(data),
    err => alert("请求服务器失败")//console.log(JSON.stringify(err))
    )
  }

  private onPOSTResponse(data:JSON)
  {
    if (data['status_code'] == 0)
    {
      this.groupid = data['groupid'];
      var mygroupsPage:MyGroupsPage = this.navParams.get('mygroupsPage');
      mygroupsPage.navCtrl.pop();
      this.user_groups.setFavorite(this.groupid);
      alert("创建新组成功！");
    }
    else if (data['status_code'] == -1)
    {
      alert("该名称对应的组已经存在，请换一个其他名称");
    }
    else
    {
      alert("创建失败！");
    }
  }


}
