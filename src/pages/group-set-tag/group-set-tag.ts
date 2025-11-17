import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Checkbox } from 'ionic-angular';
import {GroupConfig, GroupTag, GroupConfigPage} from '../group-config/group-config';
import { HttpClient, HttpParams } from '@angular/common/http';
import { GroupInfo } from '../../providers/user-groups/user-groups';
import { GlobalsProvider } from '../../providers/globals/globals';
/**
 * Generated class for the GroupSetTagPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
class GroupTagSel
{
  tagname:string;
  ischecked:boolean;
  index:number;
}

@IonicPage()
@Component({
  selector: 'page-group-set-tag',
  templateUrl: 'group-set-tag.html',
})
export class GroupSetTagPage {
  parentPage:GroupConfigPage;
  groupinfo:GroupInfo;
  groupTags:GroupTag[];
  allserverTagsSel:GroupTagSel[];
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public http:HttpClient, public globals:GlobalsProvider) {
    this.parentPage = this.navParams.get('groupconfigPage');
    this.groupTags = this.navParams.get('grouptags');
    this.groupinfo = this.navParams.get('groupinfo');
    //this.allserverTagsSel = [{'tagname':"音乐","ischecked":false,"index":0},{'tagname':"绘画","ischecked":true,"index":1}];
    this.allserverTagsSel = [];
    this.getAllServerTags();
  }

  /*
  getAllServerTags
  获取系统支持的所有的组标签
  */
  getAllServerTags()
  {
    let options = {
      "withCredentials":true
    };
    this.http.get<any>(this.globals.server + 'grouptag/getallservertags/', options).
    subscribe(
    data => this.onRecvAllServerTags(data),
    err => alert("获取系统标签失败")//console.log(JSON.stringify(err))
    )
  }

  onRecvAllServerTags(data:JSON)
  {
    var alltags:GroupTag[] = [];
    let i = 0;
    for (let tag of data['tags'])
    {
      alltags.push(tag);
      this.allserverTagsSel.push( {
        'tagname':tag['tagname'],
        'ischecked':false, //default value
        'index':i
      } );
      i ++;
    }

    this.updateAllTagsSel(this.groupTags);
  }

  updateAllTagsSel(groupTags:GroupTag[])
  {
    for (let updatetag of this.allserverTagsSel)
    {
      let tagname = updatetag.tagname;
      for (let tag of groupTags)
      {
        if (tag.tagname == tagname)
        {
          updatetag.ischecked = true;
          break;
        }
      }
    }
  }
  
  onChangeTagSel(checkbox, index)
  {
    let tag:GroupTag = {
      'tagname':this.allserverTagsSel[index]['tagname']
    }
    if (checkbox.checked)
      this.attachTag(tag);
    else
      this.detachTag(tag);
  }

  attachTag(tag:GroupTag)
  {
    console.log(tag.tagname);
    let body = {
      'groupid':this.groupinfo.groupid,
      'tagname':tag.tagname
    };
    let options = {
      "withCredentials":true
    };
    this.http.post<any>(this.globals.server + 'group/attachtag/', this.encodeHttpParams(body), options).
    subscribe(
    data => this.onRecvAttachTagResponse(data, tag),
    err => alert("添加标签失败")//console.log(JSON.stringify(err))
    )
  }
  onRecvAttachTagResponse(data:JSON, tag:GroupTag)
  {
    if (data['status_code'] == 0)
    {
      this.groupTags.push(tag);
    }
    else
    {
      alert("标签更新失败！");
    }
  }
  detachTag(tag:GroupTag)
  {
    let body = {
      'groupid':this.groupinfo.groupid,
      'tagname':tag.tagname
    };
    let options = {
      "withCredentials":true
    };
    this.http.post<any>(this.globals.server + 'group/detachtag/', this.encodeHttpParams(body), options).
    subscribe(
    data => this.onRecvDetachTagResponse(data, tag),
    err => alert("移除标签失败")//console.log(JSON.stringify(err))
    )
  }

  onRecvDetachTagResponse(data:JSON, tag:GroupTag)
  {
    if (data['status_code'] == 0)
    {
      //删除this.groupTags里的相应tag
      var tags:GroupTag[] = [];
      for (let Tag of this.groupTags)
      {
        if (Tag.tagname != tag.tagname)
          tags.push(Tag);
      }
      this.groupTags = tags;
    }
    else
    {
      alert("标签更新失败！");
    }
  }
  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }

  ionViewDidLeave()
  {
    this.parentPage.updateGroupTags(this.groupTags);
    this.parentPage.updateGroupTagText();
    console.log("ionViewDidLeave......");
    for (let tag of this.groupTags)
    {
      console.log(tag.tagname);
    }
  }
}
