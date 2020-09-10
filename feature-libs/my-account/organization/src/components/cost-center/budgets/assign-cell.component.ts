import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  OutletContextData,
  TableDataOutletContext,
} from '@spartacus/storefront';
import { CostCenterService } from 'feature-libs/my-account/organization/src/core';
import { Budget } from '../../../core/model/budget.model';
import { OrganizationItemService } from '../../shared/organization-item.service';

@Component({
  template: `
    <button (click)="assign()" class="link">
      {{ isAssigned ? 'unassign' : 'assign' }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignBudgetCellComponent {
  constructor(
    protected outlet: OutletContextData<TableDataOutletContext>,
    protected organizationItemService: OrganizationItemService<Budget>,
    protected costCenterService: CostCenterService
  ) {}

  get isAssigned(): boolean {
    return this.outlet.context.selected;
  }

  assign() {
    this.organizationItemService.key$
      .subscribe((key) => {
        this.isAssigned
          ? this.costCenterService.unassignBudget(key, this.outlet.context.code)
          : this.costCenterService.assignBudget(key, this.outlet.context.code);
      })
      .unsubscribe();
  }
}