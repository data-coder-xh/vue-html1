export interface ColumnDefinition {
  Field: string;
  Type: string;
  Null: 'YES' | 'NO';
  Key: string;
  Default: string | null;
  Extra: string;
}

export interface TablePayload {
  columns: ColumnDefinition[];
  rows: Record<string, any>[];
  primaryKey: string | null;
}
