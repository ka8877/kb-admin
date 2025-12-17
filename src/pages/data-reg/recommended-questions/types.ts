import { IN_SERVICE, OUT_OF_SERVICE } from '@/constants/options';

export type RecommendedQuestionItem = {
  no: number;
  qstId: string;
  serviceCd: string;
  serviceNm: string;
  displayCtnt: string;
  promptCtnt: string | null;
  qstCtgr: string;
  qstStyle: string | null;
  parentId: string | null;
  parentNm: string | null;
  ageGrp: string | null;
  showU17: string;
  impStartDate: string;
  impEndDate: string;
  updatedAt: string;
  createdAt: string;
  status: typeof IN_SERVICE | typeof OUT_OF_SERVICE;
  locked: boolean;
};
