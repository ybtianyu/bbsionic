import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import {UserGroupsProvider, GroupInfo, UserGroupInfo, UserGroupsSel } from "../../providers/user-groups/user-groups";
import {AdvancedBbsSearchOptProvider} from "../../providers/advanced-bbs-search-opt/advanced-bbs-search-opt";
import { BbsPage } from '../bbs/bbs';
import {BbsSearchByAuthorInputPage} from "../bbs-search-by-author-input/bbs-search-by-author-input"
import { GlobalsProvider } from '../../providers/globals/globals';
import { AllCheckBoxCtrl, AllCheckBoxItem } from './allcheckbox';
import { ImagesSearchResultRTCtrl } from '../images-list/bbs-images-list-rtctrl';
import { ImageSearchOpt, SearchOpt } from '../images-list/search-opt';
import { ThisWeekBBSlist } from '../bbs/rtctrl-singlegroup';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DatesUtils } from '../../providers/dates/dates';
import { ImagesListPage } from '../images-list/images-list-page';
import { ThrowStmt } from '@angular/compiler';
/**
 * Generated class for the AdvancedBbsSearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
 export class UserGroupSelUIInfo  extends AllCheckBoxItem
 {
   index:number;
   group:UserGroupInfo;

   constructor(ischecked:boolean, index:number, group:UserGroupInfo)
   {
    super();
    this.ischecked = ischecked;
    this.index = index;
    this.group = group;
   }

 }

/////////////////////// Group Refferred Object [start]/////////////////////////////
export class RefferredObject
{
  ischecked:boolean;
  id:number;
  name:string;

  constructor(id:number, name:string)
  {
    this.ischecked = false;  // 初始化为不选择
    this.id = id;
    this.name = name;
  }

  public static convertJSONstoItems(jslist:JSON[]):RefferredObject[]
  {
    let ros:RefferredObject[] = [];
    for (let i = 0; i < jslist.length; i++)
    {
      let j = jslist[i];
      ros.push(new RefferredObject(j['roid'], j['name']));
    }
    return ros;
  }
}

export class GroupObjectsReferred
{
  groupid:number;
  ischecked:boolean;
  isAllrochecked:boolean;
  ros:RefferredObject[];
  savedros:RefferredObject[];

  constructor(groupid:number, ischecked:boolean, referredobjects:RefferredObject[])
  {
    this.groupid = groupid;
    this.ischecked = ischecked;
    this.isAllrochecked = false;
    this.ros = [];
    this.savedros = [];
    for (let i = 0; i < referredobjects.length; i++)
    {
      this.ros.push(referredobjects[i]);
      this.savedros.push(new RefferredObject(referredobjects[i].id, referredobjects[i].name));
    }
  }

  public checkonAllRo()
  {
    this.backupSels();
    for (let i = 0; i < this.ros.length; i++)
    {
      let ro = this.ros[i];
      ro.ischecked = true;
    }
  }
  
  public backupSels()
  {
    for (let i = 0; i < this.savedros.length; i++)
    {
      console.log("backupsels:ro check" + this.ros[i].ischecked);
      this.savedros[i].ischecked = this.ros[i].ischecked;
    }
  }

  public restoreSels()
  {
    for (let i = 0; i < this.savedros.length; i++)
    {
      //this.ros[i].id = this.savedros[i].id;
      //this.ros[i].name = this.savedros[i].name;
      this.ros[i].ischecked = this.savedros[i].ischecked;
    }
  }

}

export class GroupObjectsReferredManager
{
  gromap:Map<number, GroupObjectsReferred>;
  public gfilterswitch:boolean[];  //序列顺序与AdvancedBbsSearchPage.groups:UserGroupSelUIInfo[]一致
  groups:UserGroupSelUIInfo[];  //指向页面选组的UserGroupSelUIInfo[]

  constructor(groups:UserGroupSelUIInfo[], public user_groups:UserGroupsProvider, public http:HttpClient, public globals:GlobalsProvider)
  {
    this.groups = groups;
    this.gromap = new Map<number, GroupObjectsReferred>();
    this.gfilterswitch = [];
  }

  public initfilterswitch(groups:UserGroupSelUIInfo[])
  {
    for (let i = 0; i < groups.length; i++)
      this.gfilterswitch.push(true);  //true过滤，false不过滤。初始化为不过滤RO
  }

  public getgFilterswitchindex(groupid:number):number
  {
    for (let i = 0; i < this.groups.length; i++)
    {
      if (this.groups[i].group.groupid == groupid)
        return i;
    }
    return -1;
  }

  public fetchfromServer(groups:UserGroupSelUIInfo[])
  {
      let gilist:GroupInfo[] = [];
      for (let i = 0; i < groups.length; i++)
      {
        gilist.push(this.user_groups.convertGroupSelUIInfotoGroupInfo(groups[i]));
      }
      let groupsids:string = AdvancedBbsSearchPage.getgroupids(gilist);
      const params = new HttpParams()
      .set('groups',groupsids);
          
      let options = {
        "withCredentials":true,
        params:params
      };
      this.http.get<any>(this.globals.server + 'group/getreferredobjects/',
      options).
      subscribe(
        data => this.updateOnRecvGroupsRefferedData(data, groups),
      err => alert("请求组的相关对象失败")//console.log(JSON.stringify(err))
      );
    }

    updateOnRecvGroupsRefferedData(data:JSON, groups:UserGroupSelUIInfo[])
    {
      if (data['status_code'] == 0)
      {
        let jgrolist:JSON[] = data['grolist'];
        for (let i = 0; i < jgrolist.length; i++)
        {
          let jgro:JSON = jgrolist[i];
          let ros:RefferredObject[] = RefferredObject.convertJSONstoItems(jgro['rolist']);
          //构造gro对象
          let isgrochecked = false;
          for (let isel = 0; isel < groups.length; isel++)
          {
            if (jgro['groupid'] == groups[isel].group.groupid)
              isgrochecked = groups[isel].ischecked;
          }
          let gro:GroupObjectsReferred = new GroupObjectsReferred(jgro['groupid'], isgrochecked, ros);

          if (this.gromap.get(jgro['groupid']) != undefined)
          {
            console.log("has not deleted this.gromap.get(jgro['groupid'])");
            this.gromap.set(jgro['groupid'], gro);
          }
          else
            this.gromap.set(jgro['groupid'], gro);
          //如果gro没有ro，则自动关闭该组筛选
          if (gro.ros.length == 0)
          {
            let groupindex = -1;
            for (let i = 0; i < this.groups.length; i++)
            {
              if (this.groups[i].group.groupid == gro.groupid)
                groupindex = this.groups[i].index;
            }
            this.gfilterswitch[groupindex] = false;
          }

        }
      }
    }

  getGro(groupid:number):GroupObjectsReferred
  {
    return this.gromap.get(groupid);
  }

  public getfilterRo():string
  {
    let ret = "";
    let reqjsn:JSON = JSON.parse('{}');
    this.gromap.forEach((v, k) => 
    {
      let gro = this.gromap.get(k);
      let groupid:number = gro.groupid;
      let groupindex = this.getgFilterswitchindex(groupid);
      if (gro.ischecked)
      {
        if (this.gfilterswitch[groupindex] == false)
        {
          reqjsn[gro.groupid.toString()] = [{'roid':-1}];   // reqjsn值为[-1]表示不过滤
          //console.log("不过滤");
        }
        else
        {
            let ros = [];
            for (let i = 0; i < gro.ros.length; i++)
            {
              console.log('ro name:' + gro.ros[i].name + gro.ros[i].ischecked + gro.ros[i].id);
              if (gro.ros[i].ischecked)
                ros.push(
                  {
                    'roid':gro.ros[i].id
                  }
                );
            }
            if (ros.length > 0)
              reqjsn[gro.groupid.toString()] = ros;  //reqjsn值为要过滤选择的ro列表
            else
              console.log("没有设置过滤对象时不搜索该组，reqjsn不设置该组"+groupid.toString());        
          
        }
      }
    });    

    ret = JSON.stringify(reqjsn);
    console.log("GroupObjectsReferredManager::getfilterRo:request string=" + ret);
    return ret;
  }

  public getValidgroupids():number[]
  {
    let jfilterRo = JSON.parse(this.getfilterRo());
    let removegroupids = [];
    this.gromap.forEach((v, k) => 
    {
      let groupid = k;
      if (this.getGro(groupid).ischecked)
      {
        console.log("...........................");
        console.log(jfilterRo[groupid.toString()]);
        if (jfilterRo[groupid.toString()] == null)
        {
          removegroupids.push(groupid);
        }
      }
    });
    console.log("getValidgroupids:removegroupids length=" + removegroupids.length + ' ' + removegroupids[0]);
    let refinedgroupids = [];
    this.gromap.forEach((v, k) => 
    {
      let groupid = k;
      if (this.getGro(groupid).ischecked)
      { console.log("checked GRO. " + groupid);
        if (removegroupids.indexOf(groupid, 0) >= 0)
          console.log("GroupObjectsReferredManager::getValidgroupids:remove invalid groupid" + groupid);
        else
        {console.log("add refined");
          refinedgroupids.push(groupid);
        }
      }
    });

    return refinedgroupids;
  }
}
/////////////////////// Group Refferred Object [ end ] /////////////////////////////

@IonicPage()
@Component({
  selector: 'page-advanced-bbs-search',
  templateUrl: 'advanced-bbs-search.html',
})
export class AdvancedBbsSearchPage {
  searchbbs:boolean;
  searchtype:string;
  private groups:UserGroupSelUIInfo[];
  ckctrlallgp:AllCheckBoxCtrl;
  //高级过滤
  public buseMoreSearchOpts:boolean;
  private bshowMoreSearchOpts:boolean;
  private author_key:string;
  public postdatebegin_key:string;
  public postdateend_key:string;
  public search_key:string;
  alert_unsupport_multigp_searchtextempty = "范围选择了多个组，需要输入搜索内容";
  public bbspage:BbsPage;
  // 图片过滤
  grom: GroupObjectsReferredManager;
  isRoAndRo:boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http:HttpClient,
    public user_groups:UserGroupsProvider, public globals:GlobalsProvider, public alertCtrl:AlertController,
    public advancedSearchOpts:AdvancedBbsSearchOptProvider) {
    console.log("constructor AdvancedBbsSearchPage");
    this.bbspage = this.navParams.get('bbspage');
    this.buseMoreSearchOpts = false;
    this.bshowMoreSearchOpts = true;
    this.author_key="";
    this.postdatebegin_key= "";
    this.postdateend_key = "";
    this.search_key = "";
    this.searchbbs = true;
    this.searchtype = 'bbs';
    this.initGroups();
    this.ckctrlallgp = new AllCheckBoxCtrl(this.groups);
    console.log("AdvancedBbsSearchPage:constructor:this.groups=" + this.groups.length);
    this.grom = new GroupObjectsReferredManager(this.groups, user_groups, http, globals);
    this.grom.initfilterswitch(this.groups);
    this.grom.fetchfromServer(this.groups);
    this.isRoAndRo = false;
    /*
    this.oldgroups = new Array<UserGroupSelUIInfo>();

      for (let i = 0; i < this.groups.length; i++)
    {
      let info:UserGroupSelUIInfo = {
        "groupid":this.groups[i].groupid,
        "groupname":this.groups[i].groupname,
        "ischecked":this.groups[i].ischecked,
        "isPostful":this.groups[i].isPostful,
        "isjoined":this.groups[i].isjoined,
        "isAdmin":this.groups[i].isAdmin
      }
        this.oldgroups.push(info);
    }
  
    this.oldauthor_key = this.author_key;
    this.oldpostdatebegin_key = this.postdatebegin_key;
    this.oldpostdateend_key = this.postdateend_key;
    this.oldtitle_key = this.title_key;
    */
  }
  setsearchbbs()
  {
    this.searchbbs = true;
  }
  setsearchimage()
  {
    this.searchbbs = false;
  }
  /*
  初始化this.groups为设置为Favorite的组
  */
  public initGroups()
  {
    this.groups = [];
    let groupindex = 0;
    for (let group of this.user_groups.getAllGroups())
    {
      //根据当前是单组模式还是多组来默认选择
      // 如果是单组，选择当前组。 如果是多组，选择所有组
      let ischeck:boolean = false;
      if (this.bbspage.bSingleGroupMode == false)
        ischeck = true;
      else
      {// bbspage.bSingleGroupMode
        if (this.bbspage.getSingleGroup().groupid == group.groupid)
          ischeck = true;
      }
      this.groups.push(
        new UserGroupSelUIInfo(ischeck, groupindex, group) 
      );
      groupindex += 1;
    }

  }

  /**
   * 喜好组排在前面，以保证喜好组的搜索结果排在前面
   * @returns 
   * 
   */
  public getSelGroups():GroupInfo[]
  {
    let groups:GroupInfo[] = [];
    //搜索时先遍历选择的喜好组
    for (let i = 0; i < this.groups.length; i++)
    {
      let groupid = this.groups[i].group.groupid;
      if (this.groups[i].ischecked && this.user_groups.isGroupFav(groupid))
      {
        groups.push(
          {
            'groupid': groupid,
            'groupname': this.groups[i].group.groupname
          }
        )
      }
    }
    //选择的非喜好组
    for (let i = 0; i < this.groups.length; i++)
    {
      let groupid = this.groups[i].group.groupid;
      if (this.groups[i].ischecked && this.user_groups.isGroupFav(groupid) == false)
      {
        groups.push(
          {
            'groupid': groupid,
            'groupname': this.groups[i].group.groupname
          }
        )
      }
    }
    return groups;
  }

  onSwitchAllGroupsChecked(checkbox)
  {
    console.log("onSwitchAllGroupsChecked");
    this.ckctrlallgp.onSwitchCtrlforAll(this.ckctrlallgp.bAllChecked);
  }

  onSwitchGroupChecked(group:UserGroupSelUIInfo, checkbox:any)
  {
    this.grom.getGro(group.group.groupid).ischecked = group.ischecked;
  }

  onSwitchGroupFilterChecked(group:UserGroupSelUIInfo, checkbox:any)
  {
    let groupindex = group.index;
    if (this.grom.gfilterswitch[groupindex] == false)
    //关闭过滤
    {
      // no action is needed
    }
    else
    // 打开过滤时，如果该组没有ro，则重新置为关闭过滤状态
    {
      if (this.grom.getGro(group.group.groupid).ros.length == 0)
      this.grom.gfilterswitch[groupindex] = false;
    }
  }

  onSwitchGroAllRoChecked(group:UserGroupSelUIInfo, checkbox:any)
  {
    let gro = this.grom.getGro(group.group.groupid);
    if (gro.isAllrochecked)
    {
      gro.checkonAllRo();
    }  
    else
    {
      gro.restoreSels();
    }
  }

  onSwitchRoChecked(groupid:number, ro:RefferredObject, checkbox:any)
  {
    //如果该组的所有ro都取消选择，则自动关闭过滤
    if (ro.ischecked == false)
    {
      let bfilter = false;
      for (let iro = 0; iro < this.grom.getGro(groupid).ros.length; iro++)
      {
        if (this.grom.getGro(groupid).ros[iro].ischecked == true)
          bfilter = true;
      }
      if (bfilter == false)  //该组的所有ro都取消选择
      {  //自动关闭过滤

          let groupindex = -1;
          for (let i = 0; i < this.groups.length; i++)
          {
            if (this.groups[i].group.groupid == groupid)
            {
              groupindex = i;
              break;
            }
          }
          this.grom.gfilterswitch[groupindex] = false;
        
      }
    }
    else
    {
      //打开该组过滤
      let groupindex = -1;
      for (let i = 0; i < this.groups.length; i++)
      {
        if (this.groups[i].group.groupid == groupid)
        {
          groupindex = i;
          break;
        }
      }
      this.grom.gfilterswitch[groupindex] = true;
    }
  }

  onSwitchLogicRoAndRo(checkbox:any)
  {
    // no action is needed
  }

/*
  isOptChanged():boolean
  {
    return ! (! this.isGroupOptChanged() &&    
    this.oldpostdatebegin_key == this.postdatebegin_key &&
    this.oldpostdateend_key == this.postdateend_key &&
    this.oldtitle_key == this.title_key);
  }

  isGroupOptChanged():boolean
  {
    console.log("AdvancedBbsSearchPage::Enter isGroupOptChanged");
    if (this.groups.length == this.oldgroups.length)
    {
      for (let i = 0; i < this.groups.length; i++)
      {
        console.log(this.groups[i].groupid);
        console.log(this.oldgroups[i].groupid);
        console.log(this.groups[i].groupname);
        console.log(this.oldgroups[i].groupname);
        console.log(this.groups[i].ischecked);
        console.log(this.oldgroups[i].ischecked);
        if ( this.groups[i].groupid != this.oldgroups[i].groupid ||
          this.groups[i].groupname != this.oldgroups[i].groupname ||
          this.groups[i].ischecked != this.oldgroups[i].ischecked 
          )
          return true;
      }
    }
    return false;   

  }
*/
  onSwitchMoreSearchOpts(checkbox)
  {
    console.log("AdvancedBbsSearchPage::onSwitchMoreSearchOpts:buseMoreSearchOpts=" + this.buseMoreSearchOpts);
  }

  onClearAdvancedOpt()
  {
    this.author_key = "";
    this.search_key = "";
    this.postdatebegin_key = "";
    this.postdateend_key = "";
  }
  SearchPosts()
  {
    if (this.getSelGroups().length == 0)  alert("请选择搜索的范围");
    let customize_code = 0;
    console.log("AdvancedBbsSearchPage::SearchPosts:this.postdatebegin_key=" + this.postdatebegin_key);
    console.log("AdvancedBbsSearchPage::SearchPosts:this.postdateend_key=" + this.postdateend_key);
    console.log("AdvancedBbsSearchPage::SearchPosts:this.search_key=" + this.search_key);
    this.advancedSearchOpts.setGroups(this.getSelGroups());
    if (this.buseMoreSearchOpts)
    {
      customize_code = 1  //指定作者
      this.advancedSearchOpts.setAdvancedSearchOpt(customize_code, this.author_key, this.postdatebegin_key, this.postdateend_key, this.search_key);
    }
    else
    {
      customize_code = 0; //不限定作者
      this.advancedSearchOpts.setAdvancedSearchOpt(customize_code, "", "", "", this.search_key);
    }
    if (this.search_key != "")
    {
      console.log("AdvancedBbsSearchPage::SearchPosts: call BbsPage::startAdvancedSearch");
      this.bbspage.startAdvancedSearch();
      this.bbspage.navCtrl.pop();
    }
    else if (this.getSelGroups().length == 1)
    {// 单组浏览子集
      console.log("AdvancedBbsSearchPage::SearchPosts: call BbsPage::startSingleGroupCustomizedBrowse");
      this.bbspage.startSingleGroupCustomizedBrowse(this.getSelGroups()[0]);
      this.bbspage.navCtrl.pop();
    }
    else if (this.getSelGroups().length > 1)
    {
      alert(this.alert_unsupport_multigp_searchtextempty);
    }
  }

  searchMyPosts()
  {
    if (this.getSelGroups().length == 0)  {alert("请选择搜索的范围"); return;}
    let customize_code = 2;
    this.searchMine(customize_code);
  }

  searchMyQuestions()
  {
    if (this.getSelGroups().length == 0)  {alert("请选择搜索的范围"); return;}
    let customize_code = 3;
    this.searchMine(customize_code);
  }

  searchMine(customize_code:number)
  {
    this.advancedSearchOpts.setGroups(this.getSelGroups());
    if (this.buseMoreSearchOpts)
    {
      this.advancedSearchOpts.setAdvancedSearchOpt(customize_code, "", this.postdatebegin_key, this.postdateend_key, this.search_key);
    }
    else
    {
      this.advancedSearchOpts.setAdvancedSearchOpt(customize_code, "", "", "", this.search_key);
    }
    console.log("AdvancedBbsSearchPage::searchMine: search_key=" + this.search_key);
    if (this.search_key != "")
    {
      console.log("AdvancedBbsSearchPage::searchMine: call BbsPage::startAdvancedSearch");
      this.bbspage.startAdvancedSearch();
      this.bbspage.navCtrl.pop();
    }
    else if (this.getSelGroups().length > 1)
    { //使用SearchMultiGroupsRTCtrl
      alert(this.alert_unsupport_multigp_searchtextempty);
    }
    else
    { // 单组浏览子集
      console.log("AdvancedBbsSearchPage::searchMine: call BbsPage::startSingleGroupCustomizedBrowse");
      this.bbspage.startSingleGroupCustomizedBrowse(this.getSelGroups()[0]);
      this.bbspage.navCtrl.pop();
    }
  }
 
  SearchImages()
  {
    if (this.getSelGroups().length == 0)  {alert("请选择搜索的范围"); return;}
    let postdatebegin_key = "";
    let postdateend_key = "";
    if (this.buseMoreSearchOpts)
    {
      postdatebegin_key = this.postdatebegin_key;
      postdateend_key = this.postdateend_key;
    }

    let jsearchopts = JSON.parse("{}");
    jsearchopts['postdatebegin_key'] = postdatebegin_key;
    jsearchopts['postdateend_key'] = postdateend_key;
    jsearchopts['groupids'] = AdvancedBbsSearchPage.getgroupids(this.getSelGroups());
    let imagesearchopts:string = JSON.stringify(jsearchopts);

    if (this.buseMoreSearchOpts == false)
    {
      let param = {
        'searchopt': imagesearchopts
      };    
      this.navCtrl.push(ImagesListPage, param);
    }
    else
    {
      let filterparam = this.grom.getfilterRo();
      jsearchopts['filterRo'] = filterparam;
      jsearchopts['RoLogic'] = this.isRoAndRo ? 2 : 1;
      //判断是否有筛选规则里去掉的组（选择了筛选但没有选择Ro），有则在请求中去掉该组
      let refinedgroupidlist = this.grom.getValidgroupids();
      let refinedgroupids = "";
      for (let i = 0; i < refinedgroupidlist.length; i++)
      {
        refinedgroupids += refinedgroupidlist[i].toString();
        refinedgroupids += '#';
      }
      // jsearchopts加上了filterRo,Rologic,更改了groupids,更改imagesearchopts
      if (refinedgroupidlist.length > 0)
        refinedgroupids = refinedgroupids.substring(0, refinedgroupids.length-1);
      else
        refinedgroupids = "";
      jsearchopts['groupids'] = refinedgroupids;

      imagesearchopts = JSON.stringify(jsearchopts);
      
      if (refinedgroupidlist.length == this.getSelGroups().length)
      {// 所有选择的组都有效，则不弹提示框，搜索图片
        let param = {
          'searchopt': imagesearchopts
        };    
        this.navCtrl.push(ImagesListPage, param);
      }
      else
      {
        let alertmessage = "不对以下组进行搜索，筛选勾选时没有选择筛选对象\r\n";
        let canceledgroupidslist = []; // this.getSelGroups()减去refinedgroupidlist的部分
        for (let i = 0; i < this.getSelGroups().length; i++)
        {
          let bgroupcanceled = true;
          for (let ivalid = 0; ivalid < refinedgroupidlist.length; ivalid++)
          {
            if (this.getSelGroups()[i].groupid == refinedgroupidlist[ivalid])
            {
              bgroupcanceled = false;
              break;
            }
          }
          if (bgroupcanceled)
            canceledgroupidslist.push(this.getSelGroups()[i].groupid);
        }
        for (let i = 0; i < canceledgroupidslist.length; i++)
        {
          alertmessage += this.user_groups.getGroupName(canceledgroupidslist[i]);
          alertmessage += '; '; 
        }
        let alertpopover = this.alertCtrl.create(
        {
            title:"提示",
            message:alertmessage,
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
                  if (refinedgroupids != "")
                  {
                    let param = {
                      'searchopt': imagesearchopts
                    };    
                    this.navCtrl.push(ImagesListPage, param);
                  }
                  
                }
              }
            ]
        }
          );
      alertpopover.present();
          
      }
    }

  }

  convertSeltoGroupinfo(sels:UserGroupSelUIInfo[], gi:GroupInfo[])
  {
    while(gi.length > 0)   gi.pop();
    for (let i = 0; i < sels.length; i++)
    {
      gi.push(
        {
          'groupid': sels[i].group.groupid,
          'groupname': sels[i].group.groupname
        }
      )
    }
  }

  /**
   * 
   * @param groups 
   * @returns groupid#groupid
   */
  public static getgroupids(groups:GroupInfo[]):string
  {
    let groupids = "";
    for (let i = 0; i < groups.length; i++)
    {
      groupids += groups[i].groupid.toString();
      groupids += '#';
    }
    groupids = groupids.slice(0, groupids.length - 1);
    return groupids;
  }


}
