import { Roles } from './../../models/roles/roles.models';
import { AngularFireAuth } from 'angularfire2/auth';
import { DatabaseService } from './../database/database.services';
import { Injectable, EventEmitter } from '@angular/core';
import { IUser } from '../../models/user/user.models';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase';
import { IAccount } from '../../models/account/account.models';

@Injectable()
export class AuthenticationService {

  private canEdit: EventEmitter<boolean>;
  private canDelete: EventEmitter<boolean>;
  private bursaryPath = 'users/bursary/';

  constructor(private afAuth: AngularFireAuth,
    private db: DatabaseService) {
  }

  public async forgotPassword(email: string): Promise<any> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  // Returns whether or not the user is authenticated
  public isAuthenticated(): boolean {
    const user = this.afAuth.auth.currentUser;
    if (user) {
      return user ? user.emailVerified : false;
    }
    return false;
  }

  public getAccount$(): Observable<IAccount> {
    return this.afAuth.authState.switchMap(user => {
      if (user) {
        return this.db.getObject(`${this.bursaryPath}/account`);
      }
      return [];
    });
  }

  public getUser$(): Observable<IUser> {
    return this.afAuth.authState.switchMap(user => {
      if (user) {
        return this.db.getObject(`${this.bursaryPath}/${user.uid}`);
      }
      return [];
    });
  }

  public getAuthState() {
    return this.afAuth.authState;
  }

  // Returns an observable of whether or not the user is authenticated
  public isAuthenticated$(): Observable<boolean> {
    return this.afAuth.authState.map(user => user != null ? user.emailVerified : false);
  }

  public async login(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password).then(user => {
      if (user) {
        return this.db.getObject(`users/bursary/${user.uid}/role`).map(role => {
          console.log(role);
          if (role && role >= Roles.busary_general && role <= Roles.busary_admin) {
            return true;
          }
          return false;
        });
      }
    });
  }

  public async logout(): Promise<any> {
    return this.afAuth.auth.signOut().then(() => console.log('Logged out successfully'));
  }

  public async updateUserData(user: IUser): Promise<void> {
    if (user) {
      return this.db.updateObject(`users/bursary/${user.uid}`, user);
    }
  }

  public sendPasswordResetEmail(email: string): Promise<any> {
    return firebase.auth().sendPasswordResetEmail(email);
  }

}
