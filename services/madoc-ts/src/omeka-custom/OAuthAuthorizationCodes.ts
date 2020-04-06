export type OAuthAuthorizationCodes = {
  authorization_code: string;
  client_id: string;
  user_id: string;
  redirect_uri: string;
  expires: Date;
  scope: string;
};
