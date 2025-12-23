import {
  NO,
  ACTED_AT,
  TABLE_NAME,
  PK_VALUE,
  OPERATION,
  DB_USER,
  BEFORE_DATA,
  AFTER_DATA,
  AUDIT_LOG_ID,
} from './data';

export type DataChangeItem = {
  [NO]: number;
  [AUDIT_LOG_ID]: number | string;
  [ACTED_AT]: string;
  [TABLE_NAME]: string;
  [PK_VALUE]: string;
  [OPERATION]: string;
  [DB_USER]: string;
  [BEFORE_DATA]: string;
  [AFTER_DATA]: string;
};
