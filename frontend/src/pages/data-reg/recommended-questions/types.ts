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

// SearchField 타입 정의
export type SearchFieldOption = {
  label: string;
  value: string | number;
};

export type SearchField =
  | {
      field: string;
      label: string;
      type: 'select';
      options: SearchFieldOption[];
    }
  | {
      field: string;
      label: string;
      type: 'radio';
      options: SearchFieldOption[];
    }
  | {
      field: string;
      label: string;
      type: 'text';
    }
  | {
      type: 'textGroup';
      fields: Array<{ field: string; label: string }>;
    }
  | {
      field: string;
      label: string;
      type: 'dateRange';
      position: 'start' | 'end';
      dataField?: string;
    };
