import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { VendorsRoutingModule } from './vendors-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { VendorHomePageComponent } from './pages/home/vendors.home.page';
import { NewVendorPageComponent } from './pages/new-vendor/new-vendor.page';
import { ManageVendorsPageComponent } from './pages/manage-vendors/manage-vendors.page';
import { NewVendorFormComponent } from './components/new-vendor-form/new-vendor-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    VendorsRoutingModule
  ],
  declarations: [
    ManageVendorsPageComponent,
    NewVendorFormComponent,
    NewVendorPageComponent,
    VendorHomePageComponent
  ]
})
export class VendorsModule { }
