export const DB_TO_UI_ROLE_MAP: Record<string, 'ADMIN' | 'SCOUT' | 'REGISTRAR' | 'VIEWER'> = {
  super_admin: 'ADMIN',
  provincial_admin: 'ADMIN',
  match_commissioner: 'REGISTRAR',
  data_operator: 'REGISTRAR',
  scout: 'SCOUT',
};

export const ADMIN_DB_ROLES = [
  'super_admin',
  'provincial_admin',
  'match_commissioner',
  'data_operator',
  'scout',
];
