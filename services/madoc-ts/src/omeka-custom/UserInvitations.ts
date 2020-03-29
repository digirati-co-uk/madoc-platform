export type UserInvitations = {
  id: number;
  invitation_id: string;
  owner_id?: number;
  site_id: number;
  role: string;
  site_role: string;
  expires: Date;
  created_at: Date;
  uses_left?: number;
  message?: string;
};
