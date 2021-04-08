import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nModule, provideDefaultConfig } from '@spartacus/core';
import { ImportToCartComponent } from './import-to-cart.component';
import { defaultFileValidityConfig } from '../../core/config';

@NgModule({
  imports: [CommonModule, I18nModule],
  declarations: [ImportToCartComponent],
  exports: [ImportToCartComponent],
  providers: [provideDefaultConfig(defaultFileValidityConfig)],
})
export class ImportToCartModule {}
