import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Configurator } from '../../../../core/model/configurator.model';
import { ConfiguratorAttributeProductCardComponentOptions } from '../../product-card/configurator-attribute-product-card.component';
import { ConfiguratorAttributeSingleSelectionBaseComponent } from '../base/configurator-attribute-single-selection-base.component';
import { ConfiguratorAttributeQuantityComponentOptions } from '../../quantity';

@Component({
  selector: 'cx-configurator-attribute-single-selection-bundle',
  templateUrl:
    './configurator-attribute-single-selection-bundle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfiguratorAttributeSingleSelectionBundleComponent extends ConfiguratorAttributeSingleSelectionBaseComponent {
  onDeselect(): void {
    super.onDeselect('');
  }

  /**
   * Extract corresponding product card parameters
   *
   * @param {Configurator.Value} value - Value
   * @return {ConfiguratorAttributeProductCardComponentOptions} - New product card options
   */
  extractProductCardParameters(
    value: Configurator.Value
  ): ConfiguratorAttributeProductCardComponentOptions {
    return {
      hideRemoveButton: this.attribute.required,
      fallbackFocusId: this.getFocusIdOfNearestValue(value),
      productBoundValue: value,
      loading$: this.loading$,
      attributeId: this.attribute.attrCode,
    };
  }

  protected getFocusIdOfNearestValue(currentValue: Configurator.Value): string {
    if (!this.attribute.values) {
      return 'n/a';
    }
    let prevIdx = this.attribute.values.findIndex(
      (value) => value.valueCode === currentValue.valueCode
    );
    prevIdx--;
    if (prevIdx < 0) {
      prevIdx = this.attribute.values.length > 1 ? 1 : 0;
    }
    return this.createFocusId(
      this.attribute.attrCode?.toString(),
      this.attribute.values[prevIdx].valueCode
    );
  }

  /**
   *  Extract corresponding quantity parameters
   *
   * @return {ConfiguratorAttributeQuantityComponentOptions} - New quantity options
   */
  extractQuantityParameters(): ConfiguratorAttributeQuantityComponentOptions {
    const quantity: number = this.attribute.quantity ?? 0;
    const initialQuantity = this.attribute.selectedSingleValue ? quantity : 0;

    return super.extractQuantityParameters(initialQuantity);
  }
}
