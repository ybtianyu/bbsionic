import { Injectable } from '@angular/core';

@Injectable()
export class DatesUtils 
{
    constructor()
    {

    }

    isLeapYear(nYear:number):boolean
    {
      let leapyearcona = (nYear % 400 == 0);
      let leapyearconb = (nYear % 4 == 0 && nYear % 100 != 0);
      return leapyearcona || leapyearconb;
    }

    /**
     * getPreviousDate
     * 返回今天前diff天的年月日，只支持往前跨一个月
     * @param diff 
     * @returns yyyy-mm-dd
     */
    public getPreviousDate(diff:number):string
    {
      let nYear = Number(this.today().substring(0, 4));
      let leapyear = this.isLeapYear(nYear);
      let monthdays:number[] = [31, leapyear?29:28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      let nMonth = Number(this.today().substring(5, 7));
      let nDay = Number(this.today().substring(8, 10));
      nDay -= diff;
      if (nDay <= 0)
      {
        nMonth = nMonth - 1;
        if (nMonth <= 0)
        {
          nYear = nYear - 1;
          nMonth = 12;
          nDay = monthdays[nMonth - 1] + nDay;
        }
        else
        {
          nDay = monthdays[nMonth - 1] + nDay;
        }
      }

      let ret = nYear.toString() + '-' ;
      ret += nMonth < 10 ? '0'+nMonth.toString() : nMonth.toString();
      ret += '-';
      ret += nDay < 10 ? '0'+nDay.toString() : nDay.toString();
      //console.log("week beginning=" + ret);
      return ret;
    }

    /**
     * 
     * @returns yyyy-mm-dd
     */
    public getThisWeekBeginningDateTime():string
    {
      console.log("getThisWeekBeginningDateTime=" + this.getThisWeekBeginningDate() + ' 00:00:00');
      return this.getThisWeekBeginningDate() + ' 00:00:00';
    }

    public getThisWeekBeginningDate():string
    {
      let nM2FDay:number = this.getMon2Friday(this.today().substring(0, 10)); //今天星期几
      //console.log("nM2FDay="+nM2FDay);
      let diff = -(nM2FDay - 1);
      return this.getPreviousDate(-diff);
    }

    public getThisMonthBeginningDateTime():string
    {
      let yearmonth = this.today().substring(0, 7);
      return yearmonth + "-01 00:00:00";
    }
    public getThisMonthBeginningDate():string
    {
      let yearmonth = this.today().substring(0, 7);
      return yearmonth + "-01";
    }
    /**
     * 蔡勒公式
     * 输入：yyyy-mm-dd
     * 输出：星期几number
     */
    getMon2Friday(yearmonthday:string):number
    {
      let y = Number(yearmonthday.substring(2,4));  //year
      let c = Number(yearmonthday.substring(0,2));  //century的前两位
      let m = Number(yearmonthday.substring(5,7));  //month
      //1,2月当成上一年的13,14月
      if (m == 1 || m == 2)
      { 
        m = 12 + m;
        let npreyear = Number(yearmonthday.substring(0,4)) - 1;
        y = Number(npreyear.toString().substring(2,4));
      }
      
      let d = Number(yearmonthday.substring(8,10));
      let nM2FDay:number = 0;
      let w = y + this.divideDownInteger(y,4) + this.divideDownInteger(c, 4) - 2*c + this.divideDownInteger(26*(m+1), 10) + d - 1;
      nM2FDay = w % 7;
      if (nM2FDay == 0) return 7;
      else return nM2FDay;
    }

    /**
     * 
     * a/b向下取整
     */
    divideDownInteger(a:number, b:number):number
    {
      //console.log("divideDownInteger"+ a + "/" + b + "=" + Number((a/b).toString().split('.')[0]) );
      return Number((a/b).toString().split('.')[0]);
    }

    public getMonthNumber():number
    {
            //获取当前时间
            const formatDate = (time:any) => {
                const Dates = new Date(time);
                const year:number = Dates.getFullYear();
                const month:any = (Dates.getMonth() + 1) < 10 ? '0' + (Dates.getMonth() + 1) : (Dates.getMonth() + 1);
                const day:any = Dates.getDate() < 10 ? '0' + Dates.getDate() : Dates.getDate();
                const hour:any = Dates.getHours() < 10 ? '0' + Dates.getHours() : Dates.getHours();
                const minuite:any = Dates.getMinutes() < 10 ? '0' + Dates.getMinutes() : Dates.getMinutes();
                const second:any = Dates.getSeconds() < 10 ? '0' + Dates.getSeconds() : Dates.getSeconds();
                return year + '-' + month + '-' + day + ' ' + hour + ':' + minuite + ':' + second;
              };
              let date = formatDate(new Date().getTime()).substring(0,10);
              let daydiff = -7;
              let year = Number(date.substring(0, 4));
              let month = Number(date.substring(5, 7));
              return month;
    }

    public today():string
    {
            //获取当前时间
            const formatDate = (time:any) => {
              const Dates = new Date(time);
              const year:number = Dates.getFullYear();
              const month:any = (Dates.getMonth() + 1) < 10 ? '0' + (Dates.getMonth() + 1) : (Dates.getMonth() + 1);
              const day:any = Dates.getDate() < 10 ? '0' + Dates.getDate() : Dates.getDate();
              const hour:any = Dates.getHours() < 10 ? '0' + Dates.getHours() : Dates.getHours();
              const minuite:any = Dates.getMinutes() < 10 ? '0' + Dates.getMinutes() : Dates.getMinutes();
              const second:any = Dates.getSeconds() < 10 ? '0' + Dates.getSeconds() : Dates.getSeconds();
              return year + '-' + month + '-' + day + ' ' + hour + ':' + minuite + ':' + second;
            };
            return formatDate(new Date().getTime()).substring(0,10);
    }

    public getweekago():string
    {
            //获取当前时间
            const formatDate = (time:any) => {
              const Dates = new Date(time);
              const year:number = Dates.getFullYear();
              const month:any = (Dates.getMonth() + 1) < 10 ? '0' + (Dates.getMonth() + 1) : (Dates.getMonth() + 1);
              const day:any = Dates.getDate() < 10 ? '0' + Dates.getDate() : Dates.getDate();
              const hour:any = Dates.getHours() < 10 ? '0' + Dates.getHours() : Dates.getHours();
              const minuite:any = Dates.getMinutes() < 10 ? '0' + Dates.getMinutes() : Dates.getMinutes();
              const second:any = Dates.getSeconds() < 10 ? '0' + Dates.getSeconds() : Dates.getSeconds();
              return year + '-' + month + '-' + day + ' ' + hour + ':' + minuite + ':' + second;
            };
            let date = formatDate(new Date().getTime()).substring(0,10);
            let daydiff = -7;
            let year = Number(date.substring(0, 4));
            let month = Number(date.substring(5, 7));
            let day = Number(date.substring(8, 10));
            day = day + daydiff;
            let leapyear = this.isLeapYear(year);
            let monthdays:number[] = [31, leapyear?29:28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if (day <= 0)
            {
              month = month - 1;
              if (month <= 0)
              {
                year = year - 1;
                month = 12;
                day = monthdays[month - 1] + day;
              }
              else
              {
                day = monthdays[month - 1] + day;
              }
            }
            // 默认新帖的判定时间是7天前
            let monthstr = month < 10 ? '0' + month.toString() : month.toString(); 
            let daystr = day < 10 ? '0' + day.toString() : day.toString();
            return (year.toString() + '-' + monthstr + '-' + daystr + ' ' + '00:00:00');
    }


    /**
     * convertDate2UserKindRecentDate
     * 转换日期为本周几或上周几
     * 如果是上周以前，不转换，返回空串
     * @param date yyyy-mm-dd
     */
    public convertDate2UserKindRecentDate(date:string):string
    {
      let convert_seq = ['', '一', '二', '三', '四', '五', '六', '日'];
      let userkinddate = "";
      let today = this.today().substring(0,10);
      if (date > today)//alert("convertDate2UserKindRecentDate 输入参数不支持是今天以后");
        return "";   
      else if (date == today)
        return "今天";
      else if (date == this.getPreviousDate(1))
        return "昨天";
      else if (date == this.getPreviousDate(2))
        return "前天";

      let thisweekMonday:string = this.getThisWeekBeginningDate();
      if (date >= thisweekMonday)
      { // 本周
        userkinddate += "星期";        
      }
      else 
      { // 上周
        let nM2FDay:number = this.getMon2Friday(today);
        let thisMondayDiff = -(nM2FDay - 1);
        let preweekMondayDiff = thisMondayDiff - 7;
        if (date >= this.getPreviousDate(-preweekMondayDiff))
        {
          userkinddate += "上周";
        }
        else //上周以前返回空串
          return "";
      }
      let nM2FDay = this.getMon2Friday(date);
      userkinddate += convert_seq[nM2FDay];
      console.log("convertDate2UserKindRecentDate:userkinddate=" + userkinddate);
      return userkinddate;
    }
}