import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import {HttpClientModule} from '@angular/common/http';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { RegistPage } from '../pages/regist/regist';
import { MePage } from '../pages/me/me';
import {WideSocialPage} from '../pages/wide-social/wide-social';
import {WildSocialSearchPage} from '../pages/wild-social-search/wild-social-search';
import {BbsMyPage} from '../pages/bbs-my/bbs-my';
import {BbsSearchResultPage} from '../pages/bbs-search-result/bbs-search-result';
import { ModifyUserInfoPage } from '../pages/modify-user-info/modify-user-info';
import { MyGroupsPage } from '../pages/my-groups/my-groups';
import { GroupInfoPage } from '../pages/group-info/group-info';
import {GroupConfigPage} from '../pages/group-config/group-config';
import {FriendVisitFromGroupConfigPage} from '../pages/friendfrom-group-config/friendfrom-group-config';
import {GroupSetTagPage} from '../pages/group-set-tag/group-set-tag';
import { SearchMemberPage } from '../pages/search-member/search-member';
import { GroupMemberPage } from '../pages/group-member/group-member';
import {ViewUserBasicInfoPage} from '../pages/view-user-basic-info/view-user-basic-info';
import {ViewUserGroupInfoPage} from '../pages/view-user-group-info/view-user-group-info';
import {NewGroupPage} from "../pages/new-group/new-group";
import { TabBbsPage } from '../pages/tab-bbs/tab-bbs';
import { QaPage } from '../pages/qa/qa';
import {RequestDetailPage} from '../pages/request-detail/request-detail';
import {UserRequestConfirmPage} from '../pages/user-request-confirm/user-request-confirm';
import {RequestFriendGroupTargetPage} from '../pages/request-friend-group-target/request-friend-group-target';
import { BbsPage } from '../pages/bbs/bbs';
import {BbsDetailPage} from '../pages/bbs-detail/bbs-detail';
import {QuestionDetailPage} from '../pages/question-detail/question-detail';
import {CommentReplyPage} from '../pages/comment-reply/comment-reply'
import {MarkAnswerPage} from '../pages/mark-answer/mark-answer'
import {ImageBrowserPage} from "../pages/image-browser/image-browser";
import {SpontaneousActivityPage} from "../pages/spontaneous-activity/spontaneous-activity";
//import {LoginPageModule} from "../pages/login/login.module";
import { GlobalsProvider } from '../providers/globals/globals';
import { UserLogRegProvider } from '../providers/user-log-reg/user-log-reg';
import {BbsNewPostEditPage} from "../pages/bbs-new-post-edit/bbs-new-post-edit";
import {BbsNewQuestionPostPage} from "../pages/bbs-new-question-post/bbs-new-question-post";
import {BbsVotersPickPage} from "../pages/bbs-voters-pick/bbs-voters-pick";
import {SetSortingPage} from "../pages/set-sorting/set-sorting";
import {AdvancedBbsSearchPage} from "../pages/advanced-bbs-search/advanced-bbs-search";
import {BbsSearchByAuthorInputPage} from "../pages/bbs-search-by-author-input/bbs-search-by-author-input"
import {BbsPostTargetGroupPickPage} from "../pages/bbs-post-target-group-pick/bbs-post-target-group-pick"
import {BbsPostQuestionTargetGroupPickPage} from "../pages/bbs-post-question-target-group-pick/bbs-post-question-target-group-pick";
import { BrowseOneTribeTopicsPage } from '../pages/browse-one-tribe-topics/browse-one-tribe-topics';
import {RequestBrowseGroupPage} from '../pages/request-browse-group/request-browse-group';
import { ImgServiceProvider } from '../providers/img-service/img-service';
import { ImagePicker } from '@ionic-native/image-picker';
import { GetHttpDataProvider } from '../providers/get-http-data/get-http-data';
import { ToastServiceProvider } from '../providers/toast-service/toast-service';
//import { BbsGroupManagerProvider } from '../providers/bbs-group-manager/bbs-group-manager';
import { UserGroupsProvider } from '../providers/user-groups/user-groups';
import { SpringFestival } from '../providers/festival/springfestival'
import { AdvancedBbsSearchOptProvider } from '../providers/advanced-bbs-search-opt/advanced-bbs-search-opt';
import { Md5Provider } from '../providers/md5/md5';
import { BbsUpdateNotifyProvider } from '../providers/bbs-update-notify/bbs-update-notify';
import { DatesUtils } from '../providers/dates/dates';
import { ImagesListPage } from '../pages/images-list/images-list-page';
import { ImagesListMarkPage } from '../pages/images-list-mark/images-list-mark-page';
import { MarkImageBrowserPage } from '../pages/mark-image-browser/mark-image-browser';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';import { BBSStoryDateConfirmPage } from '../pages/bbs-storydate-confirm/bbs-storydate-confirm';
import { GroupReferredObjectsPage } from '../pages/GroupReferredObjects/group-referredobjects';
export class MyHammerConfig extends HammerGestureConfig  {overrides = <any>{/* override hammerjs default configuration*/'pan': {threshold: 5},'swipe': {velocity: 0.4,threshold: 20,direction: 31 },'press':{}}}


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    RegistPage,
    MePage,
    WideSocialPage,
    WildSocialSearchPage,
    BbsMyPage,
    BbsSearchResultPage,
    ModifyUserInfoPage,
    MyGroupsPage,
    GroupInfoPage,
    GroupConfigPage,
    GroupReferredObjectsPage,
    FriendVisitFromGroupConfigPage,
    GroupSetTagPage,
    SearchMemberPage,
    GroupMemberPage,
    ViewUserBasicInfoPage,
    ViewUserGroupInfoPage,
    NewGroupPage,
    TabBbsPage,
    BbsPage,
    SetSortingPage,
    AdvancedBbsSearchPage,
    BbsSearchByAuthorInputPage,
    BbsDetailPage,
    QuestionDetailPage,
    BBSStoryDateConfirmPage,
    BbsPostTargetGroupPickPage,
    BbsPostQuestionTargetGroupPickPage,
    BbsNewPostEditPage,
    BbsNewQuestionPostPage,
    BbsVotersPickPage,
    CommentReplyPage,
    MarkAnswerPage,
    BrowseOneTribeTopicsPage,
    RequestBrowseGroupPage,
    RequestDetailPage,
    UserRequestConfirmPage,
    RequestFriendGroupTargetPage,
    QaPage,
    SpontaneousActivityPage,
    ImageBrowserPage,
    ImagesListPage,
    ImagesListMarkPage,
    MarkImageBrowserPage
  ],
  imports: [
    BrowserModule,
    //IonicModule.forRoot(MyApp),
    IonicModule.forRoot(MyApp,{
      tabsHideOnSubPages: 'true'         //隐藏全部子页面tabs
    }),
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    RegistPage,
    MePage,
    WideSocialPage,
    WildSocialSearchPage,
    BbsMyPage,
    BbsSearchResultPage,
    ModifyUserInfoPage,
    MyGroupsPage,
    GroupInfoPage,
    GroupConfigPage,
    GroupReferredObjectsPage,
    FriendVisitFromGroupConfigPage,
    GroupSetTagPage,
    SearchMemberPage,
    GroupMemberPage,
    ViewUserBasicInfoPage,
    ViewUserGroupInfoPage,
    NewGroupPage,
    TabBbsPage,
    BbsPage,
    SetSortingPage,
    AdvancedBbsSearchPage,
    BbsSearchByAuthorInputPage,
    BbsDetailPage,
    QuestionDetailPage,
    BBSStoryDateConfirmPage,
    BbsPostTargetGroupPickPage,
    BbsPostQuestionTargetGroupPickPage,
    BbsNewPostEditPage,
    BbsNewQuestionPostPage,
    BbsVotersPickPage,
    CommentReplyPage,
    MarkAnswerPage,
    BrowseOneTribeTopicsPage,
    RequestBrowseGroupPage,
    RequestDetailPage,
    UserRequestConfirmPage,
    RequestFriendGroupTargetPage,
    QaPage,
    SpontaneousActivityPage,
    ImageBrowserPage,
    ImagesListPage,
    ImagesListMarkPage,
    MarkImageBrowserPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
	  ImagePicker, //图片
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    GlobalsProvider,
    UserLogRegProvider,
    ImgServiceProvider,
    GetHttpDataProvider,
    ToastServiceProvider,
    UserGroupsProvider,
    SpringFestival,
    DatesUtils,
    AdvancedBbsSearchOptProvider,
    Md5Provider,
    BbsUpdateNotifyProvider,
    { provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig }
  ]
})
export class AppModule {}
