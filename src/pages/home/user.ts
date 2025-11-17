import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

export class User {
 // public isLogin:boolean;
  public username:string;
  constructor() {
   // this.isLogin = false;
    this.username = "tianyu";
  }

  public setusername(name:string)
  {
    this.username = name;
  }
  public getUsername():string
  {
    return this.username;
  }
}
