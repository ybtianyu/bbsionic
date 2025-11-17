import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {AdvancedBbsSearchOptProvider} from "../../providers/advanced-bbs-search-opt/advanced-bbs-search-opt";
import {AdvancedBbsSearchPage} from "../advanced-bbs-search/advanced-bbs-search";
/**
 * Generated class for the BbsSearchByAuthorInputPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bbs-search-by-author-input',
  templateUrl: 'bbs-search-by-author-input.html',
})
export class BbsSearchByAuthorInputPage {
  author:string;
  advancedSearchPage:AdvancedBbsSearchPage;
  constructor(public navCtrl: NavController, public navParams: NavParams,
              public advancedSearchOpts:AdvancedBbsSearchOptProvider) {
    this.author = "";
    this.advancedSearchPage = this.navParams.get('advancedSearchPage');
  }

  onSearch()
  {
    let customize_code = this.advancedSearchOpts.getAdvancedSearchOpt()['customize_code'];
    if (this.advancedSearchPage.buseMoreSearchOpts)
      this.advancedSearchOpts.setAdvancedSearchOpt(customize_code, this.author, this.advancedSearchPage.postdatebegin_key, this.advancedSearchPage.postdateend_key, this.advancedSearchPage.search_key);
    else
      this.advancedSearchOpts.setAdvancedSearchOpt(customize_code, this.author, "","","");
    console.log("BbsSearchByAuthorInputPage::onSearch: call BbsPage::startAdvancedSearch");
    this.advancedSearchPage.bbspage.startAdvancedSearch();
    this.advancedSearchPage.navCtrl.pop();
    this.advancedSearchPage.bbspage.navCtrl.pop();
  }

}
