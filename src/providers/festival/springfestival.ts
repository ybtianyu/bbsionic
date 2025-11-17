import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GlobalsProvider } from '../globals/globals';
import {BbsDetailPage} from '../../pages/bbs-detail/bbs-detail';
import {BbsSearchResultPage} from '../../pages/bbs-search-result/bbs-search-result';
/**
 * Generated class for the BbsMyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 @Injectable()
export class SpringFestival {
  isSpringFestival: boolean;
  NewSpringDay: string;

  constructor(public http: HttpClient, public globals:GlobalsProvider) 
  {
    this.isSpringFestival = false;
    this.NewSpringDay = "";
  }
  

  public getSpringFestival(){  
    return new Promise<string> ((resolve, reject) => {
      let options = {
        "withCredentials":true
      };
      this.http.get<any>(this.globals.server + 'getspringfestival/', options).subscribe(res => {
          //console.log("OK.Received spring festival informations");//('%c 请求处理成功 %c', 'color:red', 'url', url, 'res', res);
          this.ProcessSpringFestivalResponse(res);
          try{
              resolve(JSON.stringify(res)); 
          }catch(error){
            reject("fail");        // 失败
          }
        }, error => {
          console.log("Fail getSpringFestival");//('%c 请求处理失败 %c', 'color:red', 'url', url, 'err', error);
        reject(error);
    }); });
      /*  try{      
          onRecvGroupsData("success");    // 成功
        }
        catch(error){
            reject("fail");        // 失败
        }  */

  }

  ProcessSpringFestivalResponse(data:JSON)
  {
    this.isSpringFestival = data['isSpringFestival'];
    this.NewSpringDay = data['springFestivalDate'];
    if (this.isSpringFestival)
      this.globals.NewSpringDay = this.NewSpringDay;
    else
      this.globals.NewSpringDay = "";
    console.log("ProcessSpringFestivalResponse: isSpringFestival=" + this.isSpringFestival);
    console.log("ProcessSpringFestivalResponse: NewSpringDay=" + this.NewSpringDay)
  }

}
