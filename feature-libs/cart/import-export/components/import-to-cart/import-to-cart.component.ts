import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ProductsData } from '../../core/model';
import { ImportExportService, ImportToCartService } from '../../core/services';

@Component({
  selector: 'cx-import-to-cart',
  templateUrl: './import-to-cart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportToCartComponent {
  protected subscription = new Subscription();
  constructor(
    protected importExportService: ImportExportService,
    protected importToCartService: ImportToCartService
  ) {}

  importProducts(file: FileList): void {
    this.importToCartService
      .csvToData(file)
      .pipe(take(1))
      .subscribe((data) =>
        this.importToCartService.loadProductsToCart(data as ProductsData)
      );
  }
}