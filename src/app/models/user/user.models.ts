import { IAccount } from '../account/account.models';
import { Roles } from '../roles/roles.models';


export interface IUser {
    account?: IAccount;
    account_setup?: boolean;
    created?: boolean;
    flag?: boolean;
    full_name?: string;
    email?: string;
    uid?: string;
    role?: Roles;
    position?: string;
}
