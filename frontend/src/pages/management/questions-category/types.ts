export type RowItem = {
  no: number;
  category_nm: string;
  service_cd: string;
  // status_code is stored as 'Y' (active) or 'N' (inactive). UI displays 한글 labels.
  status_code: 'Y' | 'N';
};
