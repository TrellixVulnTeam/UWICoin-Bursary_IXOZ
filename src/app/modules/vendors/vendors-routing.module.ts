import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VendorHomePageComponent } from './pages/home/vendors.home.page';
import { NewVendorPageComponent } from './pages/new-vendor/new-vendor.page';
import { ManageVendorsPageComponent } from './pages/manage-vendors/manage-vendors.page';

const routes: Routes = [
  {
    path: 'page',
    component: VendorHomePageComponent,
    children: [
      {
        path: 'new-vendor',
        component: NewVendorPageComponent
      },
      {
        path: 'manage-vendors',
        component: ManageVendorsPageComponent
      },
      {
        path: '',
        redirectTo: 'new-vendor',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'page',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorsRoutingModule { }
