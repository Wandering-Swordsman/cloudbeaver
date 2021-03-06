/*
 * cloudbeaver - Cloud Database Manager
 * Copyright (C) 2020 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { css } from 'reshadow';

export const baseFormControlStyles = css`
  field {
    display: flex;
    flex: auto;
    box-sizing: border-box;
    align-items: center;
    padding: 12px;
    min-height: 54px;

    & input, 
    & textarea {
      flex: 1;
      min-height: 26px;
    }
  }

  field-label {
    composes: theme-typography--body1 from global;
    box-sizing: border-box;
    width: 150px;
    text-align: right;
    padding-right: 24px;
    line-height: 16px;
    font-weight: 500;
  }
`;
