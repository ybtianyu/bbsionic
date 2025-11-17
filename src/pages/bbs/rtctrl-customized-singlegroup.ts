import { HttpClient, HttpParams } from "@angular/common/http";
import { AdvancedBbsSearchOptProvider } from "../../providers/advanced-bbs-search-opt/advanced-bbs-search-opt";
import { DatesUtils } from "../../providers/dates/dates";
import { GlobalsProvider } from "../../providers/globals/globals";
import { UserGroupsProvider } from "../../providers/user-groups/user-groups";
import { BbsPage } from "./bbs";
import { BBSItem, BBSlist } from "./bbslist";
import { List } from "./list";
import { BbsPageRTCtrl, RTCtrl_BBSLastupdatedate } from "./rtctrl-lastupdate";

export class CalendarBBSlist extends List //BBSList
{
  public calendarMarks:CalendarMonthMark[];
  constructor(public user_groups:UserGroupsProvider, public datesUtils:DatesUtils)
  {
    super();
    this.calendarMarks = [];
  }

  public clear()
  {
    super.clear();
    this.calendarMarks = [];
  }


  /**
   * 帮助函数，把JSON数组转换为BBSItem数组
   * @param jsons JSON[]
   * @returns BBSItem[]
   */
       public convertJSONstoItems(jsons:JSON[]):any[]
       {
         var bbsitems:BBSItem[] = [];
         console.log("BBSlist::convertJSONtoItems: jsons.length=" + jsons.length);
         for (let i:number = 0; i < jsons.length; i++)
         {console.log("BBSlist::convertJSONtoItems:jsons[i]['title']=" + jsons[i]['title']);
           /*var item:BBSItem = {
             viewcount:jsons[i]['viewcount'],
             lastupdatedate:jsons[i]['lastupdatedate'],
             lastupdatedate_kind:"",
             createdate:jsons[i]['createdate'],
             id:jsons[i]['id'],
             groupid:jsons[i]['groupid'],
             groupname:this.user_groups.getGroupName(jsons[i]['groupid']),
             title:jsons[i]['title'],
             authorname:jsons[i]['authorname'],
             lastupdateuser:jsons[i]['lastupdateuser'],
             isvote:jsons[i]['isvote'],
             question_issolved:jsons[i]['question_issolved'] == null ? -1 : jsons[i]['question_issolved'],
             newupdatestatus: BBSlist.NO_UPDATE
           }
           */
           try
           {
           var item:BBSItem = new BBSItem(    
             this.datesUtils,
             jsons[i]['createdate'],
             jsons[i]['viewcount'],
             jsons[i]['lastupdatedate'],
             jsons[i]['id'],
             jsons[i]['title'],
             jsons[i]['groupid'],
             this.user_groups.getGroupName(jsons[i]['groupid']),
             jsons[i]['authorname'],
             jsons[i]['lastupdateuser'],
             jsons[i]['isvote'],
             jsons[i]['question_issolved']);
           bbsitems.push(item);
           }
           catch (e)
           {
             var item:BBSItem = new BBSItem(    
               this.datesUtils,
               jsons[i]['createdate'],
               jsons[i]['viewcount'],
               jsons[i]['lastupdatedate'],
               jsons[i]['id'],
               jsons[i]['title'],
               jsons[i]['groupid'],
               "",
               jsons[i]['authorname'],
               jsons[i]['lastupdateuser'],
               jsons[i]['isvote'],
               jsons[i]['question_issolved']);
             bbsitems.push(item);
           }
         }
         return bbsitems;
       }
  public getItem(i:number):any
  {
    console.log("getItem of total" + this.getlist().length);
    return this.getlist()[i];
  }

  public getItemCalendardate(i:number):string
  {
    let item:any = this.getItem(i);
    console.log("list len=" + this.getlist().length);
    return item.createdate;
  }

  protected addCalendarMark(calendarMark:CalendarMonthMark)
  {
    this.calendarMarks.push(calendarMark);
  }
  /**
   * parseAddCalendarMarks
   * 接着CalendarBBSlist.calendarMarks的末尾元素，在bbs.list里根据新合并的BBSItem根据yearmonth继续遍历，
   * 把相同yearmonthd的BBSItem添加到CalendarBBSlist.calendarMarks
   */
   public parseAddCalendarMarks(/*groupid:number*/)
   {
     let bbs:CalendarBBSlist = this;
     console.log(".............. AddCalendarMark .....................");
     let yearmonth = "";
     let start = 0;
     let end = 0;
     //let bbs:CalendarBBSlist = this.bbs_groups.get(Number(groupid));
     let calendarMarks:CalendarMonthMark[] = bbs.calendarMarks;
     let bcontinue = false;
     console.log("calendarMarks length = " + calendarMarks.length);
     // 初始化start, end, yearmonth
     if (calendarMarks.length > 0)
     {
       console.log("calendarMarks.length >>>>>>>>>>>>>>>>>>>> 0");
       let preyearmonth = calendarMarks[calendarMarks.length - 1].yearmonth; //yearmonth
       let prestart = calendarMarks[calendarMarks.length - 1].bbsstart;
       let preend = calendarMarks[calendarMarks.length - 1].bbsend;
       if (this.getItemCalendardate(preend).substring(0, 7) < preyearmonth)
       {
         console.log("it's to start a new calendarMark from the beginning of this procedure of iteration data");
         bcontinue = false;
         start = preend;
         end = start;
         yearmonth = this.getItemCalendardate(start).substring(0, 7);
       }
       else if(this.getItemCalendardate(preend).substring(0, 7) == preyearmonth)
       {
         console.log("continue search end of previous calendarMark");
         bcontinue = true;
         start = prestart;
         end = preend;
         yearmonth = preyearmonth;
 
       }
       console.log(yearmonth);
       console.log(start + ':' + end);
     }
     else
     {console.log()
       console.log("init---------" + "calendarMarks length = " + calendarMarks.length);
       start = 0;
       end = 0;
       yearmonth = this.getItemCalendardate(start).substring(0, 7); 
     }
     console.log("----init complete----");
     console.log("yearmonth=" + yearmonth);
     let bbslen = bbs.getlist().length;
     let btailitemNewMark = false;
     while (end < bbslen)
     {
       console.log("while.....");
       let enditem:BBSItem = this.getItem(end);
       let enditemDate = this.getItemCalendardate(end);
       console.log("enditemDate=" + enditemDate);
       if (enditemDate.substring(0, 7) < yearmonth )
       {
         if (bcontinue == false)
         {
           var mark:CalendarMonthMark = {
           'yearmonth': yearmonth,
           'bbsstart': start,
           'bbsend': end,
           'bbslist': bbs.getlist().slice(start, end)
           };
           bbs.addCalendarMark(mark);
         }
         else
         { //更新当前end到还未扫描到结束的calendarMark
           console.log("continue true branch: calendarMarklen=" + calendarMarks.length);
           calendarMarks[calendarMarks.length - 1].bbsend = end;
           calendarMarks[calendarMarks.length - 1].bbslist = bbs.getlist().slice(calendarMarks[calendarMarks.length - 1].bbsstart,  end);
           bcontinue = false;
         }
         //下一个mark开始
         start = end;
         end = start;  //从start处开始比较
         yearmonth = this.getItemCalendardate(start).substring(0, 7);
         console.log("yearmonth=" + yearmonth);
         console.log("start=" + start);
         //if (end == bbslen - 1)
         //  btailitemNewMark = true;
         continue;        
 
       }
       end += 1;
     }
     console.log("calendarMarks length = " + calendarMarks.length);
     // 最后一遍循环，end<bbslen, 如果到最后一个记录被分开到新一个mark，start:end实际上是最后一个记录。需要添加到这个新mark.
     //  如果最后一个记录也属于yearmonth mark，则start：end是yearmonth mark
     //所以至少还有最后一个记录 如果还没有找到yearmonth的结束，
     //循环结束后，start < end
     //循环里面，如果找到了一个mark的结束，最后一个mark的结束是bbslen
     if (bcontinue == false)
     {
     var mark:CalendarMonthMark = {
       'yearmonth': yearmonth,
       'bbsstart': start,
       'bbsend': end,
       'bbslist': bbs.getlist().slice(start, end)
       };
       bbs.addCalendarMark(mark);
     }
     else
     {
       calendarMarks[calendarMarks.length - 1].bbsend = end;
       calendarMarks[calendarMarks.length - 1].bbslist = bbs.getlist().slice(calendarMarks[calendarMarks.length - 1].bbsstart,  end);
     }
 
     /*
     for (let i = 0; i < bbs.calendarMarks.length; i++)
     {
       let mark = bbs.calendarMarks[i];
       console.log(mark.yearmonth);
       for (let j = 0; j < mark.bbslist.length; j++)
         console.log("    " + mark.bbslist[j].title);
     }
     */
   }
 
}

class CalendarMonthMark
{
  public yearmonth:string;
  public bbsstart;
  public bbsend;
  public bbslist;
}

export class SingleGroupCustomizedRTCtrl extends RTCtrl_BBSLastupdatedate
{
  customize_code:number;
  author_key:string;
  postdatebegin_key;
  postdateend_key;
  search_key:string;

  constructor(public bbspage:BbsPage,public http:HttpClient, public user_groups:UserGroupsProvider, 
    public globals:GlobalsProvider, public advancedSearchOpts:AdvancedBbsSearchOptProvider, 
    public datesUtils:DatesUtils)
  {
    super(http, user_groups, globals, datesUtils);
  }

  /**
   * Refresh
   * 确保在调用RTCtrl_BBSLastupdatedate::Refresh发送请求前把所有组进行键设置
   */
   public Refresh(refresher:any)
   {
    super.Refresh(refresher);
   }

  protected setbbslist(groupid:number)
  {
    if (this.bbs_groups.get(Number(groupid)) == undefined)
    {
      console.log("SingleGroupCustomizedRTCtrl::setbbslist: set CalendarBBSlist for group " + groupid);
      this.bbs_groups.set(groupid, new CalendarBBSlist(this.user_groups, this.datesUtils));
    }
  }

  public updateAdvancedSearchOptions()
  {
    //先清除搜索选项
      this.customize_code = 0;
      this.author_key = "";
      this.postdatebegin_key = "";
      this.postdateend_key = "";
      this.search_key = "";
      //使用搜索选项里的设置
      let sopt:string = this.advancedSearchOpts.getAdvancedSearchOpt();
      let jopt = JSON.parse(sopt);
      this.customize_code = jopt['customize_code'];
      this.author_key = (jopt['author_key'] == undefined ? "" : jopt['author_key']);
      this.postdatebegin_key = (jopt['postdatebegin_key'] == undefined ? "" : jopt['postdatebegin_key']);
      this.postdateend_key = (jopt['postdateend_key'] == undefined ? "" : jopt['postdateend_key']);
      this.search_key = (jopt['search_key'] == undefined ? "" : jopt['search_key']);
      if (this.search_key != "")
      {
        alert("配置错误，搜索内容应该为空");
        //Exception
      }
      console.log(sopt);
      console.log(this.search_key + '#' + this.author_key);
  }

  protected sendSingleGroupReadSegRequest(groupid:number, refresher:any)
  {console.log("SingleGroupCustomizedRTCtrl::sendSingleGroupReadSegRequest set false.................");
    let group = groupid.toString();
    this.hasReceivedLastData_groups[group] = false;
    var nseg:number = this.nseg_groups[group];
    console.log("SingleGroupCustomizedRTCtrl::sendReadSegRequest for groupid " + groupid + "of nseg " + nseg);
    //console.log("SingleGroupCustomizedRTCtrl::sendReadSegRequest: lastupdatedate=" + this.lastupdatedate_earliest_groups[group]);
    let groupstr = "";
    for (let i = 0; i < this.getgroups().length; i++)
    {
      let groupid = this.getgroups()[i].groupid;
      groupstr += groupid.toString();
      groupstr += '#';
    }
    groupstr = groupstr.substring(0, groupstr.length - 1); //去除末尾的‘#’
    const params = new HttpParams()
    .set('groups',groupstr)
    .set('customize_code', this.customize_code.toString())
    .set('author_key', this.author_key)
    .set('postdatebegin_key', this.postdatebegin_key)
    .set('postdateend_key', this.postdateend_key)
    .set('search_key', this.search_key)
    
    let options = {
      "withCredentials":true,
      params:params
    };
    this.http.get<any>(this.globals.server + 'bbs/getbbsAdvancedSearchSegDB/'+ nseg + '/', options).
    subscribe(
      data => this.ProcessServerResponse(data, refresher),
      err => this.requestServerErrorProcedure(nseg, refresher)//console.log(JSON.stringify(err))
    );
  }
  
  protected ProcessServerResponse(data: any, refresher:any)
  {
    this.globals.bbspage.clearPrompt_ServerUnavailable();
    super.ProcessServerResponse(data, refresher);   
    var status_code:number = data['status_code'];
    var nseg:number = data['nseg'];
    var error_code:number = 0;
    var groupid:number = data['groupid'];

    //解析并把bbsitem归类到calendarMarks
    if (data['bbslist'].length > 0)
    {
      let bbs:CalendarBBSlist = this.bbs_groups.get(Number(groupid));
      console.log("ProcessServerResponse: bbs len=" + bbs.getlist().length);
      bbs.parseAddCalendarMarks(/*groupid*/);
    }
    console.log("ProcessServerResponse: calendarMarkslen = " + this.bbs_groups.get(Number(groupid)).calendarMarks.length);
    /*
    for (let i = 0; i < this.bbs.calendarMarks.length; i++)
    {
      let mark = this.bbs.calendarMarks[i];
      console.log(mark.yearmonth);
      for (let j = 0; j < mark.bbslist.length; j++)
        console.log("    " + mark.bbslist[j].title);
    }
    */
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