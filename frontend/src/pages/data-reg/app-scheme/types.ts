export type AppSchemeItem = {
  no: number;
  id: string;
  product_menu_name: string;
  description: string;
  app_scheme_link: string;
  one_link: string;
  goods_name_list: string | null;
  parent_id: string | null;
  parent_title: string | null;
  start_date: string;
  end_date: string;
  updatedAt: string;
  registeredAt: string;
  status: 'in_service' | 'out_of_service';
};
