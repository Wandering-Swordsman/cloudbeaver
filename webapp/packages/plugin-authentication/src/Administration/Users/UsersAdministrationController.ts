/*
 * cloudbeaver - Cloud Database Manager
 * Copyright (C) 2020 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { observable } from 'mobx';

import { UsersResource } from '@cloudbeaver/core-authentication';
import { injectable } from '@cloudbeaver/core-di';
import { CommonDialogService, ConfirmationDialog } from '@cloudbeaver/core-dialogs';
import { NotificationService } from '@cloudbeaver/core-events';
import { ErrorDetailsDialog } from '@cloudbeaver/core-notifications';
import { GQLErrorCatcher, resourceKeyList } from '@cloudbeaver/core-sdk';

@injectable()
export class UsersAdministrationController {
  @observable isDeleting = false;
  readonly selectedItems = observable<string, boolean>(new Map())
  readonly expandedItems = observable<string, boolean>(new Map())
  readonly error = new GQLErrorCatcher();
  get users() {
    return Array.from(this.usersResource.data.values())
      .sort((a, b) => {
        if (this.usersResource.isNew(a.userId) === this.usersResource.isNew(b.userId)) {
          return 0;
        }
        if (this.usersResource.isNew(a.userId)) {
          return -1;
        }
        return 1;
      });
  }

  get isLoading() {
    return this.usersResource.isLoading() || this.isDeleting;
  }

  constructor(
    private notificationService: NotificationService,
    private usersResource: UsersResource,
    private commonDialogService: CommonDialogService,
  ) { }

  create = () => {
    const user = this.usersResource.addNew();
    this.expandedItems.set(user.userId, true);
  }

  update = async () => {
    try {
      await this.usersResource.refreshAll();
    } catch (exception) {
      if (!this.error.catch(exception)) {
        this.notificationService.logException(exception, 'Users update failed');
      }
    }
  }

  delete = async () => {
    if (this.isDeleting) {
      return;
    }

    const deletionList = Array
      .from(this.selectedItems)
      .filter(([_, value]) => value)
      .map(([userId]) => userId);
    if (deletionList.length === 0) {
      return;
    }

    const confirmed = await this.commonDialogService.open(ConfirmationDialog, {
      title: 'authentication_administration_confirm_user_deletion',
      message: `Would you like to delete users: ${deletionList.join(', ')}`,
    });

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;

    try {

      await this.usersResource.delete(resourceKeyList(deletionList));
      this.selectedItems.clear();

      for (const id of deletionList) {
        this.expandedItems.delete(id);
      }
    } catch (exception) {
      if (!this.error.catch(exception)) {
        this.notificationService.logException(exception, 'User delete failed');
      }
    } finally {
      this.isDeleting = false;
    }
  }

  showDetails = () => {
    if (this.error.exception) {
      this.commonDialogService.open(ErrorDetailsDialog, this.error.exception);
    }
  }
}
