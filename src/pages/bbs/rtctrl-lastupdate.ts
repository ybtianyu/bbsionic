import { HttpClient, HttpParams } from "@angular/common/http";
import { DatesUtils } from "../../providers/dates/dates";
import { GlobalsProvider } from "../../providers/globals/globals";
import { GroupInfo, UserGroupsProvider } from "../../providers/user-groups/user-groups";
import { RequestMessage } from "../request-detail/request-detail";
import { DBLoadMoreCtrl } from "./bbs";
import { BBSItem, BBSlist } from "./bbslist";

export class RTCtrl_BBSLastupdatedate// extends Lastupdatedate_RTCtrl
{
  groups: GroupInfo[];
  protected nseg_groups:JSON; // number
  protected lastupdatedate_earliest_groups:string; //手机上每组最后的记录的更新时间
  public bhasMoreData_groups:JSON; //boolean
  protected hasReceivedLastData_groups:JSON;
  //protected bbs:any;
  protected bbs_groups:Map<number, any>;
  protected bcompleteupdatestatus:Map<number, boolean>;  //<groupid, bcomplete>

  constructor(public http:HttpClient, public user_groups:UserGroupsProvider, public globals:GlobalsProvider,
              public datesUtils:DatesUtils)
  {
    this.nseg_groups = JSON.parse('{}');
    this.lastupdatedate_earliest_groups = JSON.parse('{}');
    this.bhasMoreData_groups = JSON.parse('{}');
    this.hasReceivedLastData_groups = JSON.parse('{}');
    this.bcompleteupdatestatus = new Map<number, boolean>();
    this.groups = [];
    this.bbs_groups = new Map<number, any>();
  }

  public reset()
  {console.log("RTCtrl_BBSLastupdatedate::reset.................");
      //清除bbs记录
      this.bbs_groups.forEach((v, k) => {
        this.bbs_groups.get(k).clear();
      })
      //创建新组的bbs
      for (let i = 0; i < this.groups.length; i++)
      {
        let groupid = this.groups[i].groupid;
        if (this.bbs_groups.get(Number(groupid)) == undefined)
        {
          this.setbbslist(groupid);
        }
        else
            console.log("RTCtrl_BBSLastupdatedate::reset: do not set bbs list for group " + groupid + " list length=" + this.bbs_groups.get(Number(groupid)).list.length);
      }  
    for (let i = 0; i < this.groups.length; i++)
    {
      let groupid = this.groups[i].groupid;
      var group:string = groupid.toString();
      this.lastupdatedate_earliest_groups[group] = "";
      this.bhasMoreData_groups[group] = true;
      this.hasReceivedLastData_groups[group] = false;
      this.setnseg(1, groupid);
      this.setGroupCompleteUpdateStatus(groupid, false);
    }
  
  }

  public createbbslist()
  {
    for (let i = 0; i < this.groups.length; i++)
    {
      let group:string = this.groups[i].groupid.toString();
      let groupid:number = this.groups[i].groupid;
      this.setbbslist(groupid);
    }
  }

  protected setbbslist(groupid:number)
  {
    if (this.bbs_groups.get(Number(groupid)) == undefined)
    {
      console.log("RTCtrl_BBSLastupdatedate::setbbslist: set BBSlist for group " + groupid);
      this.bbs_groups.set(groupid, new BBSlist(this.user_groups, this.datesUtils));
    }
  }

  public getGroupsCount():number
  {
    return this.groups.length;
  }

  public setGroups(groups:GroupInfo[])
  {
    while (this.groups.length > 0)   this.groups.pop();
    for (let i = 0; i < groups.length; i++)
    {
      this.groups.push(groups[i]);
    }
  }

  public getgroups():GroupInfo[]  { return this.groups; }

  public setnseg(nseg:number, groupid:number)
  {
    //console.log("RTCtrl_BBSLastupdatedate::setnseg:groupid=" + groupid + ",nseg=" + nseg);
    this.nseg_groups[groupid.toString()] = nseg;
  }

  public Refresh(refresher:any)
  {
    console.log("RTCtrl::RefreshGroups: set bcompleteupdatestatus for groups with false");
    this.reset();
    this.sendReadSegRequest(refresher);
  }

  protected sendReadSegRequest(refresher:any)
  {
    for (let i = 0; i < this.groups.length; i++)
    {
      let groupid = this.groups[i].groupid;
      this.sendSingleGroupReadSegRequest(groupid, refresher);
    }
  }
  
  public requestNextSeg(infiniteScroll:any = undefined)
  {
    for (let i = 0; i < this.groups.length; i++)
    {
      let groupid = this.groups[i].groupid;
      console.log("requestNextSeg" + this.hasReceivedLastData_groups[groupid.toString()]);
      if (this.hasReceivedLastData_groups[groupid.toString()] == true && this.bhasMoreData_groups[groupid.toString()])
      {
        this.nseg_groups[groupid.toString()] += 1;
        //console.log("RTCtrl_BBSLastupdatedate::requestNextSeg: "+ this.nseg_groups[groupid.toString()].toString() + " for group " + groupid.toString());
        this.sendSingleGroupReadSegRequest(groupid, infiniteScroll);
      }
      else if (this.bhasMoreData_groups[groupid.toString()] == false)
      {
        console.log("RTCtrl_BBSLastupdatedate::requestNextSeg: skip request, because the requested group has no more data.");
        if (infiniteScroll != undefined || infiniteScroll != null)
          infiniteScroll.complete();
      }
      else
      {
        console.log("RTCtrl_BBSLastupdatedate::requestNextSeg: skip request, because the previous request has not received data");
        console.log("RTCtrl_BBSLastupdatedate::requestNextSeg: skiped sequence " +  this.nseg_groups[groupid.toString()].toString() + " for group " + groupid.toString());
        if (infiniteScroll != undefined || infiniteScroll != null)
          infiniteScroll.complete();
      }
    }
  }

  protected sendSingleGroupReadSegRequest(groupid:number, UICtrl:any)
  {console.log("RTCtrl_BBSLastupdatedate::sendSingleGroupReadSegRequest set false.................");
    let group = groupid.toString();
    this.hasReceivedLastData_groups[group] = false;
    var nseg:number = this.nseg_groups[group];
    console.log("Lastupdatedate_DBRTCtrl::sendReadSegRequest for groupid " + groupid + "of nseg " + nseg);
    //console.log("RTCtrl_BBSLastupdatedate::sendReadSegRequest: lastupdatedate=" + this.lastupdatedate_earliest_groups[group]);
    const params = new HttpParams()
    .set('groupid',groupid.toString())
    .set('lastupdatedate',this.lastupdatedate_earliest_groups[group]) //用于数据库分段查询
    
    let options = {
      "withCredentials":true,
      params:params
    };
    this.http.get<any>(this.globals.server + 'bbs/getbbsSeg/'+ nseg + '/', options).
    subscribe(
      data => this.ProcessServerResponse(data, UICtrl),
      err => this.requestServerErrorProcedure(nseg, UICtrl)//console.log(JSON.stringify(err))
    );
  }

  public hasMoreDataofGroup(groupid:number):boolean
  {
    if (this.bhasMoreData_groups[groupid.toString()])
        return true;
    else
      return false;
  }

  public hasReceivedLastData(groupid:number):boolean
  {
    return this.hasReceivedLastData_groups[groupid.toString()];
  }
  
  public hasAllGroupsReceivedLastData():boolean
  {
    let ret = true;
    for (let i = 0; i < this.groups.length; i++)
    {
      let group = this.groups[i];
      if (this.hasReceivedLastData(group.groupid) == false)
      {
        ret = false;
        return ret;
      } 
    }
    return ret;
  }

  protected ProcessServerResponse(data:any, UICtrl:any)
  {
    var status_code:number = data['status_code'];
    var nseg:number = data['nseg'];
    var error_code:number = 0;
    var groupid:number = data['groupid'];
    var group:string = groupid.toString();
    var recvedbbslist:JSON[] = data['bbslist'];
    var mergelist:BBSItem[] = [];  // recvedbbslist的BBSItem[]类型
    //console.log("RTCtrl_BBSLastupdatedate::ProcessServerResponse:nseg,status_code=" + nseg + ',' + status_code);
    //console.log("SingleGroupRTCtrl::ProcessServerResponse: bbslist length=" + data['bbslist'].length);
    if (status_code == 0)
    {  // 本次接收记录中的更新时间最早的那条记录
      console.log("RTCtrl_BBSLastupdatedate::ProcessServerResponse: has received bbs items data");
      this.lastupdatedate_earliest_groups[group] = recvedbbslist[recvedbbslist.length -1]['lastupdatedate'];
      //标记数据已经接受处理完成
      this.hasReceivedLastData_groups[group] = true;
      //console.log("ProcessServerResponse" + this.hasReceivedLastData_groups.get(Number(groupid)));
      /*for (let i = 0; i < mergelist.length; i++)
      {
        console.log("RTCtrl_BBSLastupdatedate::mergelist[i].title=" + mergelist[i].title);
      }
      */
      if (data['nseg'] == 1)
      {//刷新时接收完所有数据后，结束refresher显示
        let refresher = UICtrl;
        if (refresher != undefined || refresher != null)
        {
          if (this.hasAllGroupsReceivedLastData())
            refresher.complete();
        }
      }
      else
      {
        let infiniteScroll = UICtrl;
        if (infiniteScroll != undefined || infiniteScroll != null)
        {
          if (this.hasAllGroupsReceivedLastData())
            infiniteScroll.complete();
        }
      }
        //合并数据
        //console.log("RTCtrl_BBSLastupdatedate::ProcessServerResponse::recvedbbslist.length=" + recvedbbslist.length + " for nseg" + nseg);
        //console.log("RTCtrl_BBSLastupdatedate.groupsCnt=" + this.getGroupsCount());
        mergelist = this.bbs_groups.get(Number(groupid)).convertJSONstoItems(recvedbbslist);
        this.bbs_groups.get(Number(groupid)).MergeUniques_RecvedList(mergelist);
        console.log("bbs_groups.get().length=" + this.bbs_groups.get(Number(groupid)).list.length);
        console.log("mergelist len=" + mergelist.length);
      /*  if (this.getGroupsCount() > 1)
        {
          //this.bbs.MergeUniques_SortLastupdate_RecvedList(mergelist);
        }
        else if(this.getGroupsCount() == 1)
        {
          this.bbs.MergeUniques_RecvedList(mergelist);
        }
        */  
        /*
        for (let i = 0; i < this.bbs.list.length; i++)
        {
          console.log("RTCtrl_BBSLastupdatedate::bbs[i].title=" + this.bbs.list[i].title);
        }
        */
    }
    else if (status_code < 0)
    {
          error_code = data['error_code'];

          if (status_code == -1 && error_code == 2)
          {
            //服务器没有数据返回，数据库已读完
            console.log("RTCtrl_BBSLastupdatedate::ProcessServerResponse:DB has been read out for group "+ groupid.toString());
            //标记数据已经接受处理完成,没有后续数据
            this.hasReceivedLastData_groups[group] = true;
            this.bhasMoreData_groups[group] = false;    
            if (data['nseg'] == 1)
            {//刷新时接收完所有数据后，结束refresher显示
              let refresher = UICtrl;
              if (refresher != undefined || refresher != null)
              {
                if (this.hasAllGroupsReceivedLastData())
                  refresher.complete();
              }
            }
            else
            {
              let infiniteScroll = UICtrl;
              if (infiniteScroll != undefined || infiniteScroll != null)
              {
                if (this.hasAllGroupsReceivedLastData())
                  infiniteScroll.complete();
              }
            }      
          }
          else if (status_code == -1 && error_code == 3)
          {
            console.log("RTCtrl_BBSLastupdatedate::ProcessServerResponse: Queried with Invalid information");

              if (UICtrl != undefined || UICtrl != null)
                UICtrl.complete();  
            alert("请求错误，请检查输入参数如作者是否正确!");
          }
          else
          {
          /*  if (data['nseg'] == 1)
            {//刷新时结束refresher显示
              if (refresher != undefined || refresher != null)
                refresher.complete();
            }*/
            alert("服务器出现异常");
          }
    }

    // 打上新帖和更新的标记
    let numgroupid:number = Number(groupid);
    if (data['bbslist'].length > 0)
    {
      if (this.isGroupCompleteUpdate(groupid) == false)
      {
        this.UpdateUpdateStatusfordata(groupid);
      }
    }
    else
    {
      this.setGroupCompleteUpdateStatus(groupid, true);
    }
  }

  requestServerErrorProcedure(nseg:number, UICtrl:any)
  {
    if (nseg == 1)
    {//刷新时接收完所有数据后，结束refresher显示
      let refresher = UICtrl;
      if (refresher != undefined || refresher != null)
        refresher.complete();
    }
    else
    {
      let infiniteScroll = UICtrl;
      if (infiniteScroll != undefined || infiniteScroll != null)
        infiniteScroll.complete();
    } 
    console.log("请求服务器失败!");
    if (this.globals.bbspage != undefined)
      this.globals.bbspage.setPrompt_ServerUnavailable();
  }

  setGroupCompleteUpdateStatus(groupid:number, bcomplete:boolean)
  {
    this.bcompleteupdatestatus.set(groupid, bcomplete);
    if (bcomplete == true)
      console.log("RTCtrl_BBSLastupdatedate::ProcessServerResponse: Update for group " + groupid.toString() + " of BBSItems status Complete!");
  }

  /**
   * isGroupCompleteUpdate
   * 是否某个组已完成BBSItem::newupdatestatus属性更新
   * @param groupid 
   * @returns 
   */
  isGroupCompleteUpdate(groupid:number):boolean
  {
    return this.bcompleteupdatestatus.get(Number(groupid));
  }

    /**
   * UpdateUpdateStatusfordata
   * 对ProcessServerResponse函数接收的data里的BBSItem的newupdatestatus属性做更新
   */
     UpdateUpdateStatusfordata(groupid:number)
     {
       var bbslist:BBSItem[] = this.bbs_groups.get(Number(groupid)).getlist();
       let lastupdate:string = "";
       console.log("this.globals.NewSpringDay=" + this.globals.NewSpringDay);
       if (this.globals.NewSpringDay != "")
       {//在春节期间，新帖保持新帖状态
        lastupdate = this.globals.NewSpringDay;
        console.log("RTCtrl_BBSLastupdatedate::UpdateUpdateStatusfordata: take NewSpringDay as lastupdate: " + lastupdate);
       }
       else     
       {//非春节时间内，使用保存的更新时间
         lastupdate = this.globals.bbsgroupsLastLatestUpdate.getLastLatestUpdatedate(groupid);
         console.log("RTCtrl_BBSLastupdatedate::UpdateUpdateStatusfordata: Update the RTCtrl.bbs items' update status of group " + groupid.toString());
         console.log("RTCtrl_BBSLastupdatedate::UpdateUpdateStatusfordata: group latest update date is " + lastupdate);
         if (lastupdate == undefined)
         { // 未定义时设置为7天前globals.defaultlastupdatedate
           console.log("RTCtrl_BBSLastupdatedate::UpdateUpdateStatusfordata: query lastupdate of group failed in globals.bbsgroupsLastLatestUpdate, set lastupdate of one week ago by default " + this.globals.defaultlastupdatedate);
           lastupdate = this.globals.defaultlastupdatedate;
           this.globals.bbsgroupsLastLatestUpdate.setLastLatestUpdatedate(groupid, lastupdate);
         }
        }
       for (let i = 0; i < bbslist.length; i++)
       {
         if (bbslist[i].groupid == groupid)
         {
           if (bbslist[i].lastupdatedate <= lastupdate)
           {
             console.log("i=" + i);
             console.log("................Equal. set Complete");
             //设置改组的BBSItem的newupdatestatus属性已更新完成
             this.setGroupCompleteUpdateStatus(groupid, true);
             break;
           }
           if (bbslist[i].createdate > lastupdate)
           {
             bbslist[i]['newupdatestatus'] = BBSlist.NEW_TOPIC;
           }
           else if (bbslist[i].lastupdatedate > lastupdate)
           {
              if (this.globals.NewSpringDay == "") //春节期间不显示更新贴的标记
                bbslist[i]['newupdatestatus'] = BBSlist.UPDATE_TOPIC;
           }
         }
       }
     }
   
  convertJSONtoItem(jsons:JSON):BBSItem
  {
    /*  var item:BBSItem = {
        viewcount:jsons['viewcount'],
        lastupdatedate:jsons['lastupdatedate'],
        lastupdatedate_kind:"",
        createdate:jsons['createdate'],
        id:jsons['id'],
        groupid:jsons['groupid'],
        groupname:this.user_groups.getGroupName(jsons['groupid']),
        title:jsons['title'],
        authorname:jsons['authorname'],
        lastupdateuser:jsons['lastupdateuser'],
        isvote:jsons['isvote'],
        question_issolved:jsons['question_issolved'] == null ? -1 : jsons['question_issolved'],
        newupdatestatus: BBSlist.NO_UPDATE
      }*/
      try
      {
      var item:BBSItem = new BBSItem(    
        this.datesUtils,
        jsons['createdate'],
        jsons['viewcount'],
        jsons['lastupdatedate'],
        jsons['id'],
        jsons['title'],
        jsons['groupid'],
        this.user_groups.getGroupName(jsons['groupid']),
        jsons['authorname'],
        jsons['lastupdateuser'],
        jsons['isvote'],
        jsons['question_issolved'] );
      return item;
      }
      catch (e)
      {
        var item:BBSItem = new BBSItem(    
          this.datesUtils,
          jsons['createdate'],
          jsons['viewcount'],
          jsons['lastupdatedate'],
          jsons['id'],
          jsons['title'],
          jsons['groupid'],
          "", //this.user_groups.getGroupName(jsons['groupid']),
          jsons['authorname'],
          jsons['lastupdateuser'],
          jsons['isvote'],
          jsons['question_issolved'] );
        return item;
      }
  }
}

class RequestMessageList
{
  public list:RequestMessage[];

  constructor()
  {
    this.list = [];
  }

  public push(request:RequestMessage)
  {
    this.list.push(request);
  }

  public clear()
  {
    while (this.list.length > 0) { this.list.pop(); }
  }
}

/**
 * 含请求信息的RTCtrl
 */
export class BbsPageRTCtrl extends RTCtrl_BBSLastupdatedate
{
  requestslistGroupsMap: Map<number, RequestMessageList>;  //<groupid, requests>
  seglen: number = 10;  //与服务器的seglen保持一致
  constructor(public bbspage:any, public http:HttpClient, public user_groups:UserGroupsProvider, 
              public globals:GlobalsProvider, public datesUtils:DatesUtils)
  {
    super(bbspage, user_groups, globals, datesUtils);
    this.requestslistGroupsMap = new Map<number, RequestMessageList>();
  }

  public reset()
  {
    super.reset();
    this.requestslistGroupsMap.forEach((v, k) => {
      this.requestslistGroupsMap.get(k).clear();
    })
    //创建新组的RequestMessageList
    for (let i = 0; i < this.groups.length; i++)
    {
        let groupid = this.groups[i].groupid;
        if (this.requestslistGroupsMap.get(Number(groupid)) == undefined)
          this.requestslistGroupsMap.set(groupid, new RequestMessageList());
    }
  }

  public setGroups(groups:GroupInfo[])
  {
    super.setGroups(groups);
    // this.requestslistGroupsMap.forEach 
    for (let i = 0; i < this.groups.length; i++)
    {
      let groupid:number = this.groups[i].groupid;
      this.requestslistGroupsMap.set(groupid, new RequestMessageList());
    }
  }

  public Refresh(refresher:any)
  {
      super.Refresh(refresher);
      this.getGroupRequests();
  }

  public getGroupRequests()
  {
    for (let i = 0; i < this.groups.length; i++)
    {
      let groupid:number = this.groups[i].groupid;
      this.getSingleGroupRequests(groupid)
    }
  }
  protected getSingleGroupRequests(groupid:number)
  {
    const params = new HttpParams().set('groupid', groupid.toString())
    let options = {
      "params":params,
      "withCredentials":true
    };
    this.http.get<any>(this.globals.server + 'group/getUnhandledRequests/', options).
    subscribe(
      data => this.onRecvGroupRequestsList(data),
      err => alert("获取消息失败")//console.log(JSON.stringify(err))
    );
  }

  onRecvGroupRequestsList(data:JSON)
  {
    for (let request of data['requests'])
    {
      let groupid:number = request['groupid'];
      let requesttext = request['requesttext'];
      if (requesttext == null)
        requesttext = "";
      console.log("request['requestdatetime']=" + request['requestdatetime']);
      this.requestslistGroupsMap.get(Number(groupid)).push(
        {
          "requestcode":request['requestcode'],
          "fromuser":request['fromuser'],
          "fromgroupid":request['fromgroupid'],
          "fromgroupname":request['fromgroupname'],
          "targetgroupid":request['targetgroupid'],
          "targetgroupname":request['targetgroupname'],
          //"biddirectvisit":request['biddirectvisit'],
          "title":request['title'],
          "requesttext":requesttext,
          "groupid":request['groupid'],
          "groupname":this.user_groups.getGroupName(request['groupid']),
          "requestdatetime":request['requestdatetime'].substring(0, 19)
        }
      );
    }
  }
  protected ProcessServerResponse(data:any, UICtrl:any)
  {
    super.ProcessServerResponse(data, UICtrl);
    var status_code:number = data['status_code'];
    var groupid:number = data['groupid'];
    var nseg:number = data['nseg'];
    var recvedbbslist:JSON[] = data['bbslist'];
    if (status_code == 0)
    {
      let bbs:BBSlist = this.bbs_groups.get(Number(groupid));
      console.log("BbsPageRTCtrl::ProcessServerResponse: bbslen = " + bbs.getlist().length);
      for (let i = (nseg-1)*this.seglen; i < bbs.getlist().length; i++)
      {
        console.log("nseg=" + nseg);
        console.log("title1=" + bbs.getlist()[i].title);
        let bbsitem:BBSItem = this.convertAny2BBSItem(bbs.getlist()[i]);
        //console.log("p11111111111111" + bbsitem.question_issolved);
        //console.log("p22222222222" + bbs.getlist()[i].question_issolved);
        bbsitem.updateMemberDate_kind();
        this.AssignValue_date_kind(bbs.getlist(), i, bbsitem);
        console.log("title2=" + bbs.getlist()[i].title);
        //to delete bbsitem
      }
    }
  }

  AssignValue_date_kind(list:any[], index:number, item:BBSItem)
  {
    list[index].lastupdatedate_kind = item.lastupdatedate_kind;
    list[index].createdate_kind = item.createdate_kind;
    //list[index].viewcount = item.viewcount,
    //list[index].lastupdatedate = item.lastupdatedate,
    //list[index].id = item.id,
    //list[index].title = item.title,
    //list[index].groupid = item.groupid,
    //list[index].groupname = item.groupname,
    //list[index].authorname = item.authorname,
    //list[index].lastupdateuser = item.lastupdateuser,
    //list[index].isvote = item.isvote,
    //list[index].question_issolved = item.question_issolved
  }

  convertAny2BBSItem(e:any):BBSItem
  {
    /*
    var item:BBSItem = new BBSItem(    
      this.datesUtils,
      e.createdate,
      e.viewcount,
      e.lastupdatedate,
      e.id,
      e.title,
      e.groupid,
      this.user_groups.getGroupName(e.groupid),
      e.authorname,
      e.lastupdateuser,
      e.isvote,
      e.question_issolved == null ? -1 : e.question_issolved
    );
    return item;
    */
    return new BBSItem(    
      this.datesUtils,
      e.createdate,
      e.viewcount,
      e.lastupdatedate,
      e.id,
      e.title,
      e.groupid,
      this.user_groups.getGroupName(e.groupid),
      e.authorname,
      e.lastupdateuser,
      e.isvote,
      e.question_issolved
    );
    
  }
}
/**
 * BBSGroupsLastUpdate
 * 记录，更新各个组的最新更新时间，并提供持久性保持和读取操作
 * jgroupsLastupdate JSON,记录各个组帖子的最新更新的时间
 * {
 *   ‘group1id':"2021.01.01 10:00:00",
 *   ...
 * }
 * 其中groupid是字符串
 * 
 */
 export class BBSGroupsLastUpdate
 {
   jgroupsLastupdate:JSON;  //记录各个组帖子的最新更新的时间
   public lastLatestupdatedate:string;
   
   constructor(public globals:GlobalsProvider)
   {
     this.jgroupsLastupdate = JSON.parse("{}");
     this.lastLatestupdatedate = "";
   }
   public getLastLatestUpdatedate(groupid:number):string
   {
     //return this.jgroupsLastupdate.get(groupid);
     return this.jgroupsLastupdate[groupid.toString()];
   }
   public setLastLatestUpdatedate(groupid:number, dt:string)
   {
     console.log("BBSGroupsLastUpdate::setLastLatestUpdatedate: Set new lastupdatetime of group " + groupid + " with " + dt);
     this.jgroupsLastupdate[groupid.toString()] = dt;
   }
 
   public updateDeprecatedGroupDatetime()
   {
      let group_keys:string[] = this.getjsonKeys(this.jgroupsLastupdate);
      for (let i = 0; i < group_keys.length; i++)
      {
        let groupkey = group_keys[i];
        console.log(this.jgroupsLastupdate[groupkey] + ":" + this.globals.defaultlastupdatedate);
        if (this.jgroupsLastupdate[groupkey] < this.globals.defaultlastupdatedate)
        {
          console.log("BBSGroupsLastUpdate::updateDeprecatedGroupDatetime: group " + groupkey + " the last updatedate is deprecated");
          this.jgroupsLastupdate[groupkey] = this.globals.defaultlastupdatedate;
          console.log("BBSGroupsLastUpdate::updateDeprecatedGroupDatetime: group " + groupkey + " the last updatedate is updated to " + this.globals.defaultlastupdatedate);
        }
      }
   }

   getjsonKeys(data:JSON):string[]
   {
    let keys:string[] = [];
    let totalstr = JSON.stringify(data);
    //console.log("totalstr:" + totalstr);
    let itemsstr = totalstr.split(',');
    for (let i = 0; i < itemsstr.length; i++)
    {
      let str = itemsstr[i];
      console.log(str);
      let key:string = str.split(':')[0]
      let start = key.indexOf('\"');
      let end = key.lastIndexOf('\"');
      key = key.substring(start + 1, end);
      keys.push(key);
    }
    //console.log("getjsonKeys: ................");
    //for (let i = 0; i < keys.length; i++) { console.log(keys[i]); }
    return keys;
   }

   public loadGroupsLastUpdatetimefromStorgage()
   {
     let storagestr = window.localStorage.getItem(this.globals.key_groupsLastupdatetime);
     if (storagestr != undefined && storagestr != "")
       this.jgroupsLastupdate = JSON.parse(storagestr);
     console.log("BBSGroupsLastUpdate::loadGroupsLastUpdatetimefromStorgage: jgroupsLastupdate = ");
     console.log(this.jgroupsLastupdate);
   }
 
   public saveGroupsLastUpdatetimetoStorage()
   {
     let jsontostr:string = JSON.stringify(this.jgroupsLastupdate);
     console.log("saveGroupsLastUpdatetimetoStorage:" + jsontostr);
     window.localStorage.setItem(this.globals.key_groupsLastupdatetime, jsontostr);
   }
 
 }