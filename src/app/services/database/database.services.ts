import { AngularFireDatabase } from 'angularfire2/database';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import * as firebase from 'firebase';

@Injectable()
export class DatabaseService {

    constructor(public db: AngularFireDatabase) { }

    getPushKey() {
        return this.db.createPushId();
    }

    getObject(path: string): Observable<any> {
        const ref = this.db.object(path);
        return ref.valueChanges();
    }

    getList(path: string): Observable<any[]> {
        const ref = this.db.list(path);
        return ref.valueChanges();
    }

    async setObject(path: string, data: any): Promise<void> {
        const ref = this.db.object(path);
        return ref.set(data);
    }

    async updateObject(path: string, data: any): Promise<void> {
        const ref = this.db.object(path);
        return ref.update(data);
    }

    uploadFile(file: File, path: string) {
        const storageRef = firebase.storage().ref().child(path);
        const uploadTask = storageRef.put(file);
        return uploadTask;
    }

    uploadBase64(file: string, path: string) {
        const storageRef = firebase.storage().ref().child(path);
        const uploadTask = storageRef.putString(file);
        return uploadTask;
    }

    async removeObject(path: string): Promise<void> {
        const ref = this.db.object(path);
        return ref.remove();
    }

}
