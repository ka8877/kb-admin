import { statusType } from '@/pages/history/login/type';
import { Dayjs } from 'dayjs';
import {
  NO,
  APP_SCHEME_ID,
  PRODUCT_MENU_NAME,
  DESCRIPTION,
  APP_SCHEME_LINK,
  ONE_LINK,
  GOODS_NAME_LIST,
  PARENT_ID,
  PARENT_TITLE,
  START_DATE,
  END_DATE,
  UPDATED_AT,
  CREATED_AT,
  STATUS,
  LOCKED,
} from '@/pages/data-reg/app-scheme/data';

export type AppSchemeItem = {
  [NO]: number;
  [APP_SCHEME_ID]: string;
  [PRODUCT_MENU_NAME]: string;
  [DESCRIPTION]: string;
  [APP_SCHEME_LINK]: string;
  [ONE_LINK]: string;
  [GOODS_NAME_LIST]: string | null;
  [PARENT_ID]: string | null;
  [PARENT_TITLE]: string | null;
  [START_DATE]: string;
  [END_DATE]: string;
  [UPDATED_AT]: string;
  [CREATED_AT]: string;
  [STATUS]: statusType;
  [LOCKED]: boolean;
};

export type FormData = {
  [PRODUCT_MENU_NAME]: string;
  [DESCRIPTION]: string;
  [APP_SCHEME_LINK]: string;
  [ONE_LINK]: string;
  [GOODS_NAME_LIST]?: string | null;
  [PARENT_ID]?: string | null;
  [PARENT_TITLE]?: string | null;
  [START_DATE]: Dayjs | null;
  [END_DATE]: Dayjs | null;
};

// 엑셀 validation 함수 타입 정의
export type AppSchemeData = {
  [PRODUCT_MENU_NAME]?: string | null;
  [DESCRIPTION]?: string | null;
  [APP_SCHEME_LINK]?: string | null;
  [ONE_LINK]?: string | null;
  [GOODS_NAME_LIST]?: string | null;
  [PARENT_ID]?: string | null;
  [PARENT_TITLE]?: string | null;
  [START_DATE]?: string | Date | null;
  [END_DATE]?: string | Date | null;
};
