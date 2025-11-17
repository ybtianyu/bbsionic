import { HttpClient } from "@angular/common/http";
import { DatesUtils } from "../../providers/dates/dates";
import { GlobalsProvider } from "../../providers/globals/globals";
import { GroupInfo, UserGroupsProvider } from "../../providers/user-groups/user-groups";
import { BbsPage } from "./bbs";
import { BBSItem, BBSlist } from "./bbslist";
import { BbsPageRTCtrl } from "./rtctrl-lastupdate";



class BBSlistLatestInfo
{
  public weekend:number;  // -1代表没有本周数据
  public monthend:number; // -1代表没有本月数据
  public weeklist:ThisWeekBBSlist[];
  public monthlist:ThisWeekBBSlist[];
  public weekrestlist:ThisWeekBBSlist[];
  public monthrestlist:ThisWeekBBSlist[];

  //当weeklist=[]时，表示没
  constructor()
  {
    this.weekend = -1;
    this.monthend = -1;
    this.weeklist = [];
    this.monthlist = [];
    this.weekrestlist = [];
    this.monthrestlist = [];
  }

}

export class ThisWeekBBSlist extends BBSlist
{
  public thisweekmonth:BBSlistLatestInfo;
  public bweekcomplete:boolean;
  public bmonthcomplete: boolean;
  constructor(public user_groups:UserGroupsProvider, public datesUtils:DatesUtils)
  {
    super(user_groups, datesUtils);
    this.thisweekmonth = new BBSlistLatestInfo();
    this.bweekcomplete = false;
    this.bmonthcomplete = false;
  }

  public clear()
  {
    super.clear();  
  }

}

export class SingleGroupRTCtrl extends BbsPageRTCtrl
{
  constructor(public bbspage:BbsPage,public http:HttpClient, public user_groups:UserGroupsProvider, 
    public globals:GlobalsProvider, public datesUtils:DatesUtils)
  {
    super(bbspage, http, user_groups, globals, datesUtils);
  }

  public reset()
  {
    super.reset();
    this.bbs_groups.get(Number(this.groups[0].groupid)).bweekcomplete = false;
    this.bbs_groups.get(Number(this.groups[0].groupid)).bmonthcomplete = false;
    this.bbs_groups.get(Number(this.groups[0].groupid)).thisweekmonth.weekend = -1;
    this.bbs_groups.get(Number(this.groups[0].groupid)).thisweekmonth.monthend = -1;
    this.bbs_groups.get(Number(this.groups[0].groupid)).thisweekmonth.weeklist = [];
    this.bbs_groups.get(Number(this.groups[0].groupid)).thisweekmonth.monthlist = [];
    this.bbs_groups.get(Number(this.groups[0].groupid)).thisweekmonth.weekrestlist = [];
    this.bbs_groups.get(Number(this.groups[0].groupid)).thisweekmonth.monthrestlist = [];
  }

  public setGroups(groups:GroupInfo[])
  {
    if (groups.length != 1)
    {
      alert("SingleGroupRTCtrl对象只能设置一个组");
      return;
    }
    else
      super.setGroups(groups);
  }

  protected setbbslist(groupid:number)
  {
    if (this.bbs_groups.get(Number(groupid)) == undefined)
    {
      console.log("SingleGroupRTCtrl::setbbslist: set ThisWeekBBSlist for group " + groupid);
      this.bbs_groups.set(groupid, new ThisWeekBBSlist(this.user_groups, this.datesUtils));
    }
  }

  /**
   * Refresh
   * 确保在调用RTCtrl_BBSLastupdatedate::Refresh发送请求前把所有组进行键设置
   */
  public Refresh(refresher:any)
  {
    super.Refresh(refresher);
  }

  private getgroupsKey(groupids:number[])
  {
    if (groupids.length == 1)
      return groupids.toString();

            let ids = groupids.sort();
            let groupskey = "";
            for (let id of ids)
            {
              groupskey += id.toString();
              groupskey += "#";
            }
            groupskey = groupskey.slice(0, groupskey.length - 1);
            return groupskey;
  }

  protected ProcessServerResponse(data: any, refresher:any)
  {
    this.globals.bbspage.clearPrompt_ServerUnavailable();
    super.ProcessServerResponse(data, refresher);   
    var status_code:number = data['status_code'];
    var nseg:number = data['nseg'];
    var error_code:number = 0;
    var groupid:number = data['groupid'];
    if (nseg == 1)
    {// 更新BbsPage::jgroupsLatestdate对应组的最新更新时间
      if (data['bbslist'].length > 0)
      {
        //console.log("BbsPageCtrl::ProcessServerResponse: update latestdate of group " + groupid.toString() + " in BbsPageCtrl.jgroupsLatestdate");
        var lastupdateitem:BBSItem = this.convertJSONtoItem(data['bbslist'][0]);
        this.bbspage.jgroupsLatestdate[groupid.toString()] = lastupdateitem.lastupdatedate.substring(0, 19);
      }
    }

    //解析并把bbsitem归类到thisweekmonth
    if (data['bbslist'].length > 0)
    {
      if (this.bbs_groups.get(Number(groupid)).bweekcomplete == false)
      {
        this.parseThisWeek(groupid, this.datesUtils.getThisWeekBeginningDateTime(), nseg);        
      }
      let weekend = this.bbs_groups.get(Number(groupid)).thisweekmonth.weekend;
      if (weekend != -1)
      {        
        this.bbs_groups.get(Number(groupid)).thisweekmonth.weekrestlist = this.bbs_groups.get(Number(groupid)).getlist().slice(weekend, this.bbs_groups.get(Number(groupid)).getlist().length);
      }
      else
      {
        this.parseThisMonth(groupid, this.datesUtils.getThisMonthBeginningDateTime(), nseg);
        let monthend = this.bbs_groups.get(Number(groupid)).thisweekmonth.monthend;
        if (monthend != -1)
        {//本月前的数据归类为本月前
          this.bbs_groups.get(Number(groupid)).thisweekmonth.monthrestlist = this.bbs_groups.get(Number(groupid)).getlist().slice(monthend, this.bbs_groups.get(Number(groupid)).getlist().length);
        }
        else
        {//所有bbs数据都归类为本月前
          this.bbs_groups.get(Number(groupid)).thisweekmonth.monthrestlist = this.bbs_groups.get(Number(groupid)).getlist();
        }
      }

    }
    console.log("ProcessServerResponse: this week end = " + this.bbs_groups.get(Number(groupid)).thisweekmonth.weekend);
    console.log("ProcessServerResponse: this month end = " + this.bbs_groups.get(Number(groupid)).thisweekmonth.monthend);


  }

  /**
   * 
   * @param groupid 
   * @param monthStartDateTime "2022-12-01 00:00:00"
   * @param nseg 
   * @returns 
   */
  parseThisMonth(groupid:number, monthStartDateTime:string, nseg:number)
  {
    console.log(".............. parseThisMonth .....................");
    let start = 0;
    let end = 0;
    let bbs:ThisWeekBBSlist = this.bbs_groups.get(Number(groupid));
    let bmonthcontinue = false;
    let bbslen = bbs.getlist().length;
    console.log("parseWeekMonth: bbslen =" + bbslen);

    if (bbs.thisweekmonth.monthend == -1)
    {
      if (nseg > 1)
      {
        bbs.bmonthcomplete = true;
        return;
      }
      else if (nseg == 1)
      {
        start = 0;
        end = 0;
        bmonthcontinue = true;
      }
    }
    else 
    { 
      if (bbs.getlist()[end].lastupdatedate.substring(0, 19) < monthStartDateTime )
      {
        bbs.bmonthcomplete = true;
      }
      else
      bmonthcontinue = true; //标记继续找本周结束位置
    }
    console.log("parseWeekMonth: end =" + end);
    if (bmonthcontinue)
    {//继续找本周结束位置
      while (end < bbslen)
      {
        console.log("while.....");
        if (bbs.getlist()[end].lastupdatedate.substring(0, 19) >= monthStartDateTime)
        {
          end += 1;
        }
        else
        {
          break;
        }
      }
      if (end == 0)
      {
        console.log("parseWeekMonth: There is no data of this month for this data");
        bbs.bmonthcomplete = true;
        return;
        //查找本月数据

      }
      else if (end == bbslen)
      {//遍历到了当前数据的末尾
        bbs.thisweekmonth.monthend = end;
        bbs.thisweekmonth.monthlist = bbs.getlist().slice(0, end);
      }
      else
      {// 找到了本周结束位置
        bbs.thisweekmonth.monthend = end;
        bbs.thisweekmonth.monthlist = bbs.getlist().slice(0, end);
        bbs.bmonthcomplete = true;
      }
    }
  
  }

  /**
   * parseThisWeek
   * 接着CalendarBBSlist.calendarMarks的末尾元素，在bbs.list里根据新合并的BBSItem根据yearmonth继续遍历，
   * 把相同yearmonthd的BBSItem添加到CalendarBBSlist.calendarMarks
   */
   parseThisWeek(groupid:number, mondayDateTime:string, nseg:number)
  {
    console.log(".............. parseThisWeek .....................");
    let start = 0;
    let end = 0;
    let bbs:ThisWeekBBSlist = this.bbs_groups.get(Number(groupid));
    let bweekcontinue = false;
    let bbslen = bbs.getlist().length;
    console.log("parseWeekMonth: bbslen =" + bbslen);

    if (bbs.thisweekmonth.weekend == -1)
    {
      if (nseg > 1)
      {
        bbs.bweekcomplete = true;
        return;
      }
      else if (nseg == 1)
      {
        start = 0;
        end = 0;
        bweekcontinue = true;
      }
    }
    else 
    { 
      if (bbs.getlist()[end].lastupdatedate.substring(0, 19) < mondayDateTime )
      {
        bbs.bweekcomplete = true;
      }
      else
        bweekcontinue = true; //标记继续找本周结束位置
    }
    console.log("parseWeekMonth: end =" + end);
    if (bweekcontinue)
    {//继续找本周结束位置
      while (end < bbslen)
      {
        console.log("while.....");
        if (bbs.getlist()[end].lastupdatedate.substring(0, 19) >= mondayDateTime)
        {
          end += 1;
        }
        else
        {
          break;
        }
      }
      if (end == 0)
      {
        console.log("parseWeekMonth: There is no data of this week for this data");
        bbs.bweekcomplete = true;
        return;
        //查找本月数据

      }
      else if (end == bbslen)
      {//遍历到了当前数据的末尾
        bbs.thisweekmonth.weekend = end;
        bbs.thisweekmonth.weeklist = bbs.getlist().slice(0, end);
      }
      else
      {// 找到了本周结束位置
        bbs.thisweekmonth.weekend = end;
        bbs.thisweekmonth.weeklist = bbs.getlist().slice(0, end);
        bbs.bweekcomplete = true;
      }
    }
  
  }

  /*
     *   对data数据里BBSItem的newupdatestatus属性进行更新
   *   同时，如果data是用户刷新接收到第一段数据，并且置了bSeg1UpdateItemStatusSeg1标记，
   * 把该data对应的groupid用户组的最新更新时间进行更新，更新为globals.bbsgroupsLastLatestUpdate
   * 对象里的groupid对应的时间，该时间是用户手动刷新前，RTCtrl.bbs里面data对应组的BBSItem记录
   * 中是最后更新的帖子的最后更新时间
   * @param data 从服务器返回的数据，其中data['bbslist']包含返回的BBSItem列表
   
  ProcessServerResponse(data)
  {

    //刷新保存多组模式或单选组的最新时间
    if (data['bbslist'].length > 0)
    {
        if (this.isAllGroupsCompletedUpdate() == false)
        {
            if (this.isGroupCompleteUpdate(groupid) == false)
            {
              if (nseg == 1)
              {
                  if (this.bSeg1UpdateItemStatusSeg1 == true)
                  { //把该data对应的groupid用户组的最新更新时间进行更新
                    let latestdatetime:string = this.globals.bbsgroupsLastLatestUpdate.getLastLatestUpdatedate(groupid);
                    console.log("SingleGroupRTCtrl::ProcessServerResponse: set latestupdatedate for group " + groupid + " with " + latestdatetime);
                    this.globals.bbsgroupsLastLatestUpdate.setLastLatestUpdatedate(groupid, latestdatetime);
                  }
                  else
                  {
                    this.UpdateUpdateStatusfordata();
                  }
              }
              else
              {
                this.UpdateUpdateStatusfordata();
              }
            }
            else
              super.ProcessServerResponse(data);
        }
        else
        {
          super.ProcessServerResponse(data);
          return;
        }   

    }
    else
    {
      this.setGroupCompleteUpdateStatus(groupid, true);
    }

    if (this.isAllGroupsCompletedUpdate())
      this.bSeg1UpdateItemStatusSeg1 = false;

    super.ProcessServerResponse(data);

  }
  */
  
}