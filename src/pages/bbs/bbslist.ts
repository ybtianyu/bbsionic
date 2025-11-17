import { DatesUtils } from "../../providers/dates/dates";
import { UserGroupsProvider } from "../../providers/user-groups/user-groups";
import { List } from "./list";

export class BBSItem
{
  public viewcount:number;
  public lastupdatedate:string;
  public lastupdatedate_kind;
  public createdate:string;
  public createdate_kind:string;
  public id:number;
  public title:string;
  public groupid:number;
  public groupname:string;
  public authorname:string;
  public lastupdateuser:string;
  public isvote:boolean;
  public newupdatestatus:number;  // 0, 1,2
  /*
  question_issolved
   0:提问解答未完成, 服务器数据库对应字段question_issolved是0
   1:提问解答已完成, 服务器数据库对应字段question_issolved是1
   -1：非提问贴, 服务器数据库对应字段question_issolved是null
  */
  public question_issolved:number;  // -1, 0, 1;
  
  constructor(public datesUtils:DatesUtils, createdate:string, viewcount:number, lastupdatedate:string, id:number, 
    title:string, groupid:number, groupname:string, authorname:string, lastupdateuser:string, isvote:boolean, 
    questiion_issolved, newupdatestatus = BBSlist.NO_UPDATE)
  {
    //console.log("ccccccccccccquest" + questiion_issolved);
    this.createdate = createdate;
    this.createdate_kind = "";
    this.viewcount = viewcount;
    this.lastupdatedate = lastupdatedate;
    this.lastupdatedate_kind = "";
    this.id = id;
    this.title = title;
    this.groupid = groupid;
    this.groupname = groupname;
    this.authorname = authorname;
    this.lastupdateuser = lastupdateuser;
    this.isvote = isvote;
    /*if (0 == null)
      console.log("0 == null")
    else console.log("0 != null");
    */
    if (questiion_issolved == 0 || questiion_issolved == 1)
      this.question_issolved = questiion_issolved;
    else if (questiion_issolved == null || questiion_issolved == -1) //非问题贴
      this.question_issolved = -1; 
    this.newupdatestatus = newupdatestatus;    //默认不是新帖和更新回复的贴
    //console.log("c2222222222222quest" + this.question_issolved);
    //赋值lastupdatedate_kind
    //this.updateMemberDate_kind();
  }

  public updateMemberDate_kind()
  {
    console.log("BBSItem::updateMemberDate_kind");
    //lastupdatedate是上周和本周时，lastupdatedate_kind赋值为星期几
    this.lastupdatedate_kind = this.getKindDate(this.lastupdatedate);
    this.createdate_kind = this.getKindDate(this.createdate);
  }

  /**
   * getKindDate
   * 返回星期几，如本周一，上周二。如果日期是上周一以前，返回空串
   * @param dt yyyy-mm-dd
   * @returns 
   */
  getKindDate(dt:string):string
  {
    let kinddt:string = "";
    let nM2FDay:number = this.datesUtils.getMon2Friday(this.datesUtils.today().substring(0, 10));
    let thisMondayDiff = -(nM2FDay - 1);
    let preweekMondayDiff = thisMondayDiff - 7;
    
    console.log("BBSItem::getKindDate preweekMonday=" + this.datesUtils.getPreviousDate(-preweekMondayDiff));
    if (dt.substring(0, 10) >= this.datesUtils.getPreviousDate(-preweekMondayDiff))
    {
      console.log("BBSlist::getKindDate: convert date " + dt.substring(0, 10));
      kinddt = this.datesUtils.convertDate2UserKindRecentDate(dt.substring(0, 10));
    }
    return kinddt;
  }
}


export class BBSlist extends List
{
  static NEW_TOPIC:number = 1;
  static UPDATE_TOPIC:number = 2;
  static NO_UPDATE = 0;

  private lastLatestupdatedate_groups:JSON;

  constructor(public user_groups:UserGroupsProvider, public datesUtils:DatesUtils)
  {
    super();

    this.lastLatestupdatedate_groups = JSON.parse('{}');
  }

  //public getBBSItem(index:number):
     /**
      * 查找bbsid在BBSlist::list中的索引
      * @param bbsid 
      * @returns 
      */
     getitemIndex(bbsid:number)
     {
       for (let i = 0; i < this.list.length; i++)
       {
         let item:BBSItem = this.list[i];
         if (item.id == bbsid)
         {
           return i;
         }
       }
       return -1;
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

  public getGroupLastLatestUpdatedate(groupid:string):string
  {    
    let lastlatestdate:string;
    if (this.lastLatestupdatedate_groups[groupid] == undefined)
      lastlatestdate = "";
    else
      lastlatestdate = this.lastLatestupdatedate_groups[groupid];
    return lastlatestdate;
    
  }
  
  public Merge(list:BBSItem[])
  {
    super.Merge(list);
  }

}