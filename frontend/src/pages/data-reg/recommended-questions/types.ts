export type RecommendedQuestionItem = {
  no: number;
  qst_id: string;
  service_nm: string;
  qst_ctnt: string;
  qst_ctgr: string;
  qst_style: string | null;
  parent_id: string | null;
  parent_nm: string | null;
  age_grp: string | null;
  under_17_yn: string;
  imp_start_date: string;
  imp_end_date: string;
  updatedAt: string;
  registeredAt: string;
  status: 'in_service' | 'out_of_service';
};
