export type ApiKey = {
  id: string;
  owner_id: number;
  label: string;
  credential_hash: string;
  last_ip: any; // ??
  last_accessed?: Date;
  created: Date;
};
