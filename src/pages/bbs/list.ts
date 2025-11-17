
export class List
{
  public list:any[];
  protected groupsCnt:number;

  constructor()
  {
    this.list = [];
    this.groupsCnt = 1;
  }

  public getlist():any[] { return this.list; }
  public convertJSONstoItems(data:JSON[]):any[]
  {
    return [];
  }
  public clear()
  {
    this.list = [];
  }
  public setGroupNumber(n)
  {
    this.groupsCnt = n;
  }
  public getGroupNumber():number
  {
    return this.groupsCnt;
  }

  public checkReadCacheValidLoadMoreExtraCondition(groupid:number):boolean
  {
    var group:string = groupid.toString();
    /*if (this.LoadMoreCtrl instanceof CacheLoadMoreCtrl)
    {
      var isCacheSynced:boolean = this.RTCtrl.bhasCacheupdated_groups[group] == false ||
          (this.RTCtrl.bhasCacheupdated_groups[group] && 
              (this.RTCtrl.bhasCacheSynced_groups[group] == false)) // 当已检测到缓存已更新
      return (false == this.RTCtrl.iscacheUpdating_groups[group]) &&
              (true == isCacheSynced);
    }
    else*/
    {
      return true;
    }
  }
  public MergeUniques_SortLastupdate_RecvedList(recvedlist:any[]):any[]
  {
    //console.log("MergeUniques_SortLastupdate_RecvedList::recvedlist.length=" + recvedlist.length);
    //把接收到的列表与App已有列表合并，排序，不去重复项
    this.Merge(recvedlist);
    //console.log("MergeUniques_SortLastupdate_RecvedList:this.bbslist.length=" + this.list.length);
    this.list = this.sortBBSItemListBy_lastupdatedate(this.list);
    //console.log("MergeUniques_SortLastupdate_RecvedList::this.bbslist.length" + this.list.length);
    return this.list;
  }

  sortBBSItemListBy_lastupdatedate(list:any[]):any[]
  {
    //console.log("sortBBSItemListBy_lastupdatedate:list.length=" + list.length);
    var sortedlist:any[] = [];
    var lastupdatedates_bbsitemidx:JSON = JSON.parse('{}');
    var lastupdatedates:string[] = [];
    //console.log("----------------");
    for (let i:number = 0; i < list.length; i++)
    {
    //  console.log(list[i].id + ":" + list[i].lastupdatedate);
      let lastupdatedate = list[i].lastupdatedate;
      lastupdatedates.push(lastupdatedate);
      lastupdatedates_bbsitemidx[lastupdatedate] = i;
    //  console.log(lastupdatedate + "with idx " + i);
    }
    lastupdatedates = lastupdatedates.sort(); //默认升序
    lastupdatedates = lastupdatedates.reverse();
    //console.log(lastupdatedates);
    //console.log(lastupdatedates_bbsitemidx);
    for (let i:number = 0; i < list.length; i++)
    {
   //  console.log("222222222");
      let lastupdatedate = lastupdatedates[i];
      //console.log(lastupdatedate);
      let idx = lastupdatedates_bbsitemidx[lastupdatedate];
      //console.log(idx);
      //console.log(list[idx].id);
      sortedlist.push(list[idx]);
    }
    //console.log("sortBBSItemListBy_lastupdatedate::sortedlist.length=" + sortedlist.length);
    //for (let i = 0; i< sortedlist.length; i++)
    //  console.log("sortBBSItemListBy_lastupdatedate:sortedlist=" + sortedlist[i].id);
    return sortedlist;
  }
  public MergeUniques_RecvedList(recvedlist:any[]):any[]
  {
    console.log("MergeUniques_RecvedList::recvedlist.length=" + recvedlist.length);
    //把接收到的列表与App已有列表合并，排序，不去重复项
    this.Merge(recvedlist);
    return this.list;
  }
  public MergeDuplicates_SortLastupdate_RecvedList(recvedlist:any[]):any[]
  {
    //把接收到的列表与App已有列表合并，排序，去重复项
    this.Merge(recvedlist);
    console.log("MergeDuplicates_SortLastupdate_RecvedList::this.bbslist.length=" + this.list.length);
    this.list = this.DelDuplicates(this.list); //去除重复
    this.list = this.sortBBSItemListBy_lastupdatedate(this.list);
    return this.list;
  }
  public MergeDuplicates_RecvedList(recvedlist:any[]):any[]
  {
    //把接收到的列表与App已有列表合并，排序，去重复项
    this.Merge(recvedlist);
    console.log("MergeDuplicates_RecvedList::this.bbslist.length=" + this.list.length);
    this.list = this.DelDuplicates(this.list); //去除重复
    return this.list;
  }
  public MergeUniques_Sort(recvedlist:any[]):any[]
  {
    console.log("MergeUniques_SortLastupdate_RecvedList::recvedlist.length=" + recvedlist.length);
    //把接收到的列表与App已有列表合并，排序，不去重复项
    this.Merge(recvedlist);
    console.log("MergeUniques_SortLastupdate_RecvedList:this.list.length=" + this.list.length);
    this.list = this.sortBBSItemList(this.list);
    console.log("MergeUniques_SortLastupdate_RecvedList::this.list.length" + this.list.length);
    return this.list;
  }

  public sortBBSItemList(list:any[]):any[]
  {
    return list;
  }

  public Merge(list:any[])
  {

    var list1:any[] = list;
    this.list = this.list.concat(list1);
    /*
    for (let i = 0; i < this.list.length; i++)
    {
      console.log("Merge:this.bbslist id=" + this.list[i].id);
      console.log("Merge:this.bbslist title=" + this.list[i].title);
    }
      */
  }

  DelDuplicates(list:any[]):any[]
  {
    var ret_list:any[] = [];
    var ids:number[] = [];
    for (let i:number = 0; i < list.length; i++)
    {
      //console.log("DelDuplicates::list[i].id=" + list[i].id);
      let id:number = list[i].id;
      let isduplicate = false;
      //console.log(id);
      for (let j = 0; j < ids.length; j++)
      {
        //console.log(ids[j]);
        if (ids[j] == id)
        {
        //  console.log(id);
          isduplicate = true;
          break;
        }
      }
      if (isduplicate)
        continue;
      ret_list.push(list[i]);
      ids.push(id);
    }
    return ret_list;
  }  
    /*
  ListSub:
  返回从list1减去list2的元素的结果，
  */
 ListSub(list1:any[], idlist2:number[]):any[]
 {
   console.log("ListSub:list1=");
   for (var list1elem of list1)
     console.log(list1elem.id);
   console.log("ListSub:list2=");
   for (var list2elem of idlist2)
     console.log(list2elem);
   
   let i = list1.length;
   while (i--)
   {
     var list1elem:any = list1[i];
     let has = false;
     for (let list2elem of idlist2)
     {
       if (list2elem == list1elem.id)
       {
         has = true;
         break;
       }
     }
     if (has)
       list1.splice(i, 1);
   }
   return list1;
 }
}