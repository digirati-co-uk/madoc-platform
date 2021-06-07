// TODO are the optional fields typed correctly?
export type UserInvitation = {
  id: number;
  invitation_id: string;
  owner_id?: number | null;
  site_id: number;
  role: string;
  site_role: string;
  expires: Date;
  created_at: Date;
  uses_left?: number | null;
  message?: string | null;
};
