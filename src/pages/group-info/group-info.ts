import { Component } from '@angular/core';
import { Alert, AlertController, IonicPage, NavController, NavParams, Popover, PopoverController } from 'ionic-angular';
import { GroupMemberPage } from '../../pages/group-member/group-member';
import {SearchMemberPage} from '../../pages/search-member/search-member';
import {GroupConfigPage} from '../../pages/group-config/group-config';
import { HttpClient, HttpParams } from '@angular/common/http';
import {GlobalsProvider} from "../../providers/globals/globals";
import { MarkAnswerPage } from '../mark-answer/mark-answer';
import { UserGroupsProvider } from '../../providers/user-groups/user-groups';
import { TribeSearchInfo } from '../wild-social-search/wild-social-search';
import { UserRequestConfirmPage } from '../user-request-confirm/user-request-confirm';
import { RequestFriendGroupTargetPage } from '../request-friend-group-target/request-friend-group-target';
import { ImagesListPage } from '../images-list/images-list-page';
import { ImagesListMarkPage } from '../images-list-mark/images-list-mark-page';
import { GroupReferredObjectsPage } from '../GroupReferredObjects/group-referredobjects';
/**
 * Generated class for the GroupInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
/*
export class CheckAdmin
{
  private username:string;
  private groupid:number;
  public isAdmin:boolean;

  constructor(username:string, groupid:number, public http:HttpClient)
  {
    this.groupid = groupid;
    this.username = username;
    this.isAdmin = false;
    if (username != "")
      this.detectIfAdminForGroup();
  }

  public detectIfAdminForGroup()
  {
    const params = new HttpParams()
    .set('groupid', this.groupid.toString())
    let options = {
      "params":params,
      "withCredentials":true
    };
    this.http.get<any>(this.globals.server + 'group/isuseradmin/', options).
    subscribe(
    data => this.onRecvresponse(data),
    err => console.log("CheckAdmin fail")//console.log(JSON.stringify(err))
    )
  }
  onRecvresponse(data:JSON)
  {
    if (data['status_code'] == 0)
    {
      this.isAdmin = data['isadmin'];
    }
  }
}
export class CheckGroupMember
{
  private username:string;
  private groupid:number;
  public isMember:boolean;
  constructor(username:string, groupid:number, public http:HttpClient)
  {
    this.groupid = groupid;
    this.username = username;
    this.isMember = false;
    if (username != "")
      this.detectIfMemberOfGroup();
  }

  public detectIfMemberOfGroup()
  {
    const params = new HttpParams()
    .set('groupid', this.groupid.toString())
    let options = {
      "params":params,
      "withCredentials":true
    };
    this.http.get<any>(this.globals.server + 'group/isusermember/', options).
    subscribe(
    data => this.onRecvresponse(data),
    err => console.log("CheckGroupMember fail")//console.log(JSON.stringify(err))
    )
  }
  onRecvresponse(data:JSON)
  {
    if (data['status_code'] == 0)
    {
      this.isMember = data['ismember'];
    }
  }

}

export class CheckGroupVisitable
{
  private username:string;
  private groupid:number;
  public isVisitable:boolean;
  constructor(username:string, groupid:number, public http:HttpClient)
  {
    this.groupid = groupid;
    this.username = username;
    this.isVisitable = false;
    if (username != "")
      this.detect();
  }

  public detect()
  {
    const params = new HttpParams()
    .set('groupid', this.groupid.toString())
    let options = {
      "params":params,
      "withCredentials":true
    };
    this.http.get<any>(this.globals.server + 'group/isgroupvisitable/', options).
    subscribe(
    data => this.onRecvresponse(data),
    err => console.log("CheckGroupVisitable fail")//console.log(JSON.stringify(err))
    )
  }
  onRecvresponse(data:JSON)
  {
    if (data['status_code'] == 0)
    {
      this.isVisitable = data['isVisitable'];
    }
  }
}
*/

@IonicPage()
@Component({
  selector: 'page-group-info',
  templateUrl: 'group-info.html',
})
export class GroupInfoPage {
  private groupid:number;
  private groupname:string;
  brief: boolean;
  pageTitlefriendvisit_suffix:string = "";
  friendvisitedfromgnames:string = "";  //友邻访问源
  id: any;
  popover: any;
  bfriendvisit: boolean;
  bgpmember: boolean;
  bgpAdmin:boolean;
  bgisprivate:boolean;
  public popover_confirm:Popover;
  group:TribeSearchInfo;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public http:HttpClient, public globals:GlobalsProvider, public user_groups:UserGroupsProvider,
              public alertCtrl:AlertController, public popoverCtrl:PopoverController) 
  {
    this.brief = this.navParams.get('brief');
    if (this.brief)  //从部落里面打开
    {
      this.group = this.navParams.get('group');
      this.groupid = this.group.groupid;
      this.groupname = this.group.groupname;
      this.bgisprivate = this.group.isprivate;
    }
    else     //从我的组里面打开
    {
      this.groupid = this.navParams.get('groupid');
      this.groupname = this.navParams.get('groupname');     
      //this.bgisprivate = this.user_groups.getGroup(this.groupid) 
    }
    //this.ckMember = new CheckGroupMember(this.globals.username, this.groupid, this.http);
    //this.ckAdmin = new CheckAdmin(this.globals.username, this.groupid, this.http);
    //this.ckVisitable = new CheckGroupVisitable(this.globals.username, this.groupid, this.http);
    this.getGroupInfo();
    this.popover_confirm = null;
  }

  getGroupInfo()
  {
    this.bgpmember = this.user_groups.isGroupMember(this.groupid);
    this.bgpAdmin = this.user_groups.isGroupAdmin(this.groupid);
    this.bfriendvisit = this.user_groups.isFriendVIsitGroup(this.groupid);
    if ( this.globals.isLogin == true && this.bfriendvisit)
    {
      console.log("bfriendvisit==true");
      this.pageTitlefriendvisit_suffix = "[友邻]";
      this.friendvisitedfromgnames = this.getFriendVisitFromGroupsName(this.groupid);
    }
    else
    { //未登陆用户或组成员
      this.pageTitlefriendvisit_suffix = "";
    }
  }

  /**
   * getFriendVisitFromGroupsName
   * 从UserGroupsProvider获取返回当前用户友邻访问groupid组的发起组的名称，以分号分割。如果groupid不是友邻访问组，返回空字符串   * 
   * @param groupid 
   * @returns 
   */
  getFriendVisitFromGroupsName(groupid:number):string
  {
    let visit_from_group_names = "";
    try
    {
      let friendvisitedfrom:number[] = this.user_groups.getFriendVisitGroup(groupid).visitedfromgids;
      for (let i = 0; i < friendvisitedfrom.length; i++)
      {
        visit_from_group_names += this.user_groups.getGroupName(friendvisitedfrom[i]);
        visit_from_group_names += ";";
      }
      return visit_from_group_names.slice(0, visit_from_group_names.length - 1); //返回最后一个分号前面的内容
    }
    catch (e)
    {
      console.log("GroupInfoPage::getFriendVisitFromGroupsName: group is not friend visited");
      return "";
    }
  }


  showGroupIntroductions(groupid:number)
  {

  }

  joinPrivateGroup(group:TribeSearchInfo)
  {
    if (this.globals.username == this.globals.dummyUsername)
    {
      alert("你还没有登录，无法加入");
      return;
    }
    if (this.user_groups.isGroupMember(group.groupid))
    {
        alert("你已经在该组");
        return;
    }
    else
    {
      this.showJoinConfirmUIPopover(group);
    }
  }

  private showJoinConfirmUIPopover(group:TribeSearchInfo)
  {
    /* 传入弹窗参数 */
    let request = {
      "requestcode":1,
      "groupid":group.groupid,
      "groupname":group.groupname,
      'targetgroupname':group.groupname,
      "fromgroupid":null,
      "fromgroupname":"",
      "fromuser":this.globals.username,
      "content":""
    }
    let param = {
      'request':request,
      'parent':this
    };
    if (this.popover_confirm == null)
    {
      console.log("WildSocialSearchPage::showJoinConfirmUIPopover: to create request join popover");
      this.popover_confirm = this.popoverCtrl.create(UserRequestConfirmPage, param);
    }
    this.popover_confirm.present();    
  }

  requestFriendVisit(group:TribeSearchInfo)
  {
    if (this.globals.isLogin == false)
    {
      alert("你还没有登录");
      return;
    }
    this.navCtrl.push(RequestFriendGroupTargetPage, {'group':group});
  }

  private showGroupMemberPage(groupid:number)
  {//成员或者公开组可访问
    if (this.bgpmember || this.bgisprivate == false)
      this.navCtrl.push(GroupMemberPage, {'groupid':groupid, 'groupname':this.groupname,
      'disableAdminconfig':this.brief //管理员只有从我的组里面进入才能设置
    });
  }
  private invitePersonPage(groupid:number)
  {
    if (this.bgpmember)
      this.navCtrl.push(SearchMemberPage, {'groupid':groupid, 'groupname':this.groupname});
  }

  private viewGroupConfig(groupid:number)
  {//成员或者公开组可访问
    if (this.bgisprivate == false || this.bgpmember)
      this.navCtrl.push(GroupConfigPage,  {'groupid':groupid, 'groupname':this.groupname, 
      'disableAdminconfig':true //管理员只有从我的组里面进入才能设置
      });
  }
  
  private configGroupPage(groupid:number)
  {
    if (this.bgpAdmin)
      this.navCtrl.push(GroupConfigPage,  {'groupid':groupid, 'groupname':this.groupname,
      'disableAdminconfig':false
    });
  }

  private exitGroup(groupid:number)
  {
    
    if (this.bgpmember == false)
    {
      alert("你不在" + this.groupname + "里面");
      return;
    }
    let alertpopover = this.alertCtrl.create(
      {
        title:"确认退出组" + this.groupname,
        message:"确认是否退出组",
        buttons:[
          {
            text:"取消",
            role:'cancel',
            handler:() => {
              console.log("clicked cancel");
            }
          },
          {
            text:"确定",
            handler:() => {
              console.log("clicked ok");
              let body = {
                "username":this.globals.username,
                "groupid":this.groupid
              }
              let options = {
                "withCredentials":true
              }
              this.http.post<any>(this.globals.server + 'group/exitgroup/', this.encodeHttpParams(body), options).
              subscribe(
                data => this.onExitGroupResponse(data, alertpopover, this.globals.username),
                err => alertpopover.dismiss()!=null && alert("请求服务器失败")//console.log(JSON.stringify(err))
              );
            }
          }
        ]
      }
    );
    alertpopover.present();
  }

  onExitGroupResponse(data:JSON, alertpopover:Alert, username:string)
  {
    if (data['status_code'] == 0)
    {
      //this.ckMember.detectIfMemberOfGroup();  // 退出组后重新检测更新ckMember.isMember
      alert("退出" + this.groupname + "成功！");
      this.user_groups.updateUserGroups_Promise()
      .then( (res) =>{
          this.getGroupInfo();
      });
    }
    else
    {
      alert("退出组失败，请稍后再试");
    }
    alertpopover.dismiss();
  }

  /**
   * 查看和设置该组的Ro对象
   */
  RO(groupid:number)
  {
    let param = {
      'isAdmin': this.bgpAdmin,
      'groupid':this.groupid
    };
    this.navCtrl.push(GroupReferredObjectsPage, param);
  }
  
  markImages(groupid:number)
  {
    let jsearchopts = {
      'postdatebegin_key':"",
      'postdateend_key':"",
      'groupids':groupid.toString(),
      //'filterRo':''
    };
    let imagesearchopts:string = JSON.stringify(jsearchopts);
    this.navCtrl.push(ImagesListMarkPage, {'searchopt': imagesearchopts});
  }


  ionViewDidEnter() {
    console.log('ionViewDidEnter GroupInfoPage');
  }

  private encodeHttpParams(params: any): any {
    if (!params) return null;
    return new HttpParams({fromObject: params});
  }
}
