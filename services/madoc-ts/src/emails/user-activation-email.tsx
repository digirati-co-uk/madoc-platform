import { render } from 'mjml-react';
import * as Email from 'mjml-react';
import React from 'react';

export const UserActivationEmail: React.FC<{ installationTitle: string; username: string; resetLink: string }> = ({
  installationTitle,
  resetLink,
  username,
}) => {
  return (
    <Email.Mjml>
      <Email.MjmlBody>
        <Email.MjmlSection backgroundColor="#fff">
          <Email.MjmlColumn>
            <Email.MjmlText fontSize={30} fontWeight={600}>
              {installationTitle}
            </Email.MjmlText>
            <Email.MjmlText fontSize={18} fontWeight={600}>
              Activate your account
            </Email.MjmlText>
            <Email.MjmlText color="#333" fontSize={14} lineHeight="1.5">
              Hi <b>{username}</b>, thanks for signing up with us.
            </Email.MjmlText>
            <Email.MjmlText color="#333" fontSize={14} lineHeight="1.5">
              Please click on the activation link below to verify your email.
            </Email.MjmlText>
            <Email.MjmlButton background-color="#3579f6" href={resetLink} fontSize={16}>
              Activate your account
            </Email.MjmlButton>
          </Email.MjmlColumn>
        </Email.MjmlSection>
      </Email.MjmlBody>
    </Email.Mjml>
  );
};

export function createUserActivationText(vars: { installationTitle: string; username: string; resetLink: string }) {
  return `
${vars.installationTitle}

Activate your account

Hi ${vars.username}, thanks for signing up with us.
Please click on the activation link below to verify your email.

${vars.resetLink}
  `;
}

export function createUserActivationEmail(vars: { installationTitle: string; username: string; resetLink: string }) {
  return render(
    <UserActivationEmail
      installationTitle={vars.installationTitle}
      username={vars.username}
      resetLink={vars.resetLink}
    />
  ).html;
}
