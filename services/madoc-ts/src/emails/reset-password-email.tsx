import { render } from 'mjml-react';
import * as Email from 'mjml-react';
import React from 'react';

export const ResetPasswordEmail: React.FC<{ installationTitle: string; username: string; resetLink: string }> = ({
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
              Reset your password
            </Email.MjmlText>
            <Email.MjmlText color="#333" fontSize={14} lineHeight="1.5">
              If you requested a password reset for <b>{username}</b>, click on the link below to complete the process.
              If you didn't request a new password, you can safely delete this email.
            </Email.MjmlText>
            <Email.MjmlButton backgroundColor="#3579f6" href={resetLink} fontSize={16}>
              Reset your password
            </Email.MjmlButton>
            <Email.MjmlText color="#333" fontSize={14} lineHeight="1.5">
              Or copy and paste this link into your browser
            </Email.MjmlText>
            <Email.MjmlText color="#333" fontSize={14} lineHeight="1.5">
              <a href={resetLink}>{resetLink}</a>
            </Email.MjmlText>
          </Email.MjmlColumn>
        </Email.MjmlSection>
      </Email.MjmlBody>
    </Email.Mjml>
  );
};

export function createResetPasswordText(vars: { installationTitle: string; username: string; resetLink: string }) {
  return `
${vars.installationTitle}

Reset your password

If you requested a password reset for ${vars.username}, click on the link below to complete the process.
If you didn't request a new password, you can safely delete this email.

${vars.resetLink}
  `;
}

export function createResetPasswordEmail(vars: { installationTitle: string; username: string; resetLink: string }) {
  return render(
    <ResetPasswordEmail
      installationTitle={vars.installationTitle}
      username={vars.username}
      resetLink={vars.resetLink}
    />
  ).html;
}
