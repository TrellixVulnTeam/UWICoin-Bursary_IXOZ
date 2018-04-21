import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreRoutingModule } from './core-routing.module';
import { MainNavigationComponent } from './components/main-navigation/main-navigation.component';
import { SideNavigationComponent } from './components/side-navigation.component.ts/side-navigation.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { QRCodeComponent } from './components/qrcode-scanner/qrcode-scanner.component';
import { NotFoundPageComponent } from './pages/404/404.page';
import { DebounceClickDirective } from './directives/debounce/debounce-click.directive';


@NgModule({
  imports: [
    CommonModule,
    CoreRoutingModule,
    ZXingScannerModule.forRoot(),
  ],
  declarations: [
    DebounceClickDirective,
    MainNavigationComponent,
    NotFoundPageComponent,
    QRCodeComponent,
    SideNavigationComponent,
  ],
  exports: [
    CoreRoutingModule,
    DebounceClickDirective,
    MainNavigationComponent,
    NotFoundPageComponent,
    QRCodeComponent,
    SideNavigationComponent,
  ]
})
export class CoreModule { }
