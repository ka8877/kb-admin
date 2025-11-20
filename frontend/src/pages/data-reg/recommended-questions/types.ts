export type RecommendedQuestionItem = {
  no: number;
  qst_id: string;
  service_nm: string;
  display_ctnt: string;
  prompt_ctnt: string | null;
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
