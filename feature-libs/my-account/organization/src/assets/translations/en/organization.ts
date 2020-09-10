import { budget } from './budget.i18n';
import { costCenter } from './cost-center.i18n';
import { orderApproval, orderApprovalList } from './order-approval.i18n';
import { permission } from './permission.i18n';
import { unit, unitAssignApprovers, unitAssignRoles } from './units.i18n';
import {
  userGroup,
  userGroupAssignPermissions,
  userGroupAssignUsers,
} from './user-group.i18n';
import {
  user,
  userAssignApprovers,
  userAssignPermissions,
  userAssignUserGroups,
} from './user.i18n';

/**
 * The organization i18n labels provide generic labels for all organization sub features.
 * Once #7154 is in place, we can start adding specific i18n labels. The organization labels
 * will then serve as a backup.
 */

export const organization = {
  organization: {
    enabled: 'Active',
    disabled: 'Disabled',

    enable: 'Enable',
    disable: 'Disable',

    name: 'Name',
    code: 'Code',

    back: '',
    close: 'close',

    cancel: 'Cancel',
    ok: 'Ok',

    add: 'Add',
    create: 'Create {{name}}',
    edit: 'Edit',
    save: 'Save {{name}}',
    delete: 'Delete',

    assign: 'Assign',

    manage: 'Manage',

    active: 'Active',
    status: 'Status',
    details: 'Details',

    messages: {
      emptyList: 'The list is empty',
    },
    userRoles: {
      b2bcustomergroup: 'Customer',
      b2bapprovergroup: 'Approver',
      b2bmanagergroup: 'Manager',
      b2badmingroup: 'Admin',
    },

    breadcrumb: 'Organization',
  },

  // sub feature labels are added below
  costCenter,
  budget,
  unit,
  unitAssignRoles,
  unitAssignApprovers,
  userGroup,
  userGroupAssignUsers,
  userGroupAssignPermissions,
  user,
  userAssignApprovers,
  userAssignPermissions,
  userAssignUserGroups,
  permission,
  orderApproval,
  orderApprovalList,
};