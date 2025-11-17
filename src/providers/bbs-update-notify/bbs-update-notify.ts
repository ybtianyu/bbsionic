import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { List } from '../../pages/bbs/list';
import { GlobalsProvider } from '../globals/globals';


class LastUpdatedate
{
  cur_lastupdatedate:string;
  next_lastupdatedate:string;
  constructor(groupid:number)
  {
    // to do if localstorage does not have groupid record
    this.cur_lastupdatedate = "";
    this.next_lastupdatedate = "";
  }
}
class DummyPage
{
  list:List[];
  constructor()
  {
  this.list = [];
  }
};
/*
  Generated class for the BbsUpdateNotifyProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BbsUpdateNotifyProvider {

  constructor(public http: HttpClient, public globals:GlobalsProvider) {
    console.log('Hello BbsUpdateNotifyProvider Provider');
  }

  public addFav(groupid:number)
  {
  }
  public removeFav(groupid:number)
  {
  }
  public updateFav(groupid:number, newtime:string)
  {
  }

  /*
  updateReadFav
  设置cur_lastupdatedate
  */
  public updateReadFav(groupid:number, lastupdatedate:string)
  {
  }

  /*
  getGroupUpdateNotifyStatus
  获取指定groupid的喜好组的话题是否有更新，有更新返回1，没有更新返回0或负数
  */
  public getGroupUpdateNotifyStatus(groupid:number):number
  {
    return 0;
  }

  public getLastUpdate(groupid:number):string
  {
    return ""
  }

  public pullLatestUpdates(groupid:number)
  {

  }
}
