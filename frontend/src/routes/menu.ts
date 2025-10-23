export type MenuItem = {
  label: string;
  path: string;
  icon?: string; // placeholder for icon id or name
  children?: MenuItem[];
};
