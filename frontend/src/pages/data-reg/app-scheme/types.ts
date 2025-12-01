import { Dayjs } from 'dayjs';

export type AppSchemeItem = {
  no: number;
  appSchemeId: string;
  productMenuName: string;
  description: string;
  appSchemeLink: string;
  oneLink: string;
  goodsNameList: string | null;
  parentId: string | null;
  parentTitle: string | null;
  startDate: string;
  endDate: string;
  updatedAt: string;
  createdAt: string;
  status: 'in_service' | 'out_of_service';
};

export type FormData = {
  productMenuName: string;
  description: string;
  appSchemeLink: string;
  oneLink: string;
  goodsNameList?: string | null;
  parentId?: string | null;
  parentTitle?: string | null;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
};

// 엑셀 validation 함수 타입 정의
export type AppSchemeData = {
  productMenuName?: string | null;
  description?: string | null;
  appSchemeLink?: string | null;
  oneLink?: string | null;
  goodsNameList?: string | null;
  parentId?: string | null;
  parentTitle?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
};
