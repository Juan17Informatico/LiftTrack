export interface DatabaseMigration {
  id: string;
  name: string;
  up: string;
}
