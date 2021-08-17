import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../shared/atoms/Button';
import { ErrorMessage } from '../../../shared/atoms/ErrorMessage';
import { FlexSpacer } from '../../../shared/atoms/FlexSpacer';
import { Heading1 } from '../../../shared/atoms/Heading1';
import { Input, InputContainer, InputLabel } from '../../../shared/atoms/Input';
import { LoginActions, LoginContainer } from '../../../shared/atoms/LoginContainer';
import { useFormResponse, useSite } from '../../../shared/hooks/use-site';
import { HrefLink } from '../../../shared/utility/href-link';

export const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const site = useSite();
  const { c1, c2, error, formError, activate } =
    useFormResponse<{
      error: boolean;
      c1: string;
      c2: string;
      formError?: boolean;
      activate?: boolean;
    }>() || {};
  const [didError, setDidError] = useState(formError);

  if (error || !c1 || !c2) {
    return (
      <div>
        <LoginContainer>
          <Heading1 $margin>{t('Reset password')}</Heading1>
          <ErrorMessage>{t('Invalid or expired code.')}</ErrorMessage>
          <InputContainer>
            <HrefLink href={`/forgot-password`}>{t('Request another reset')}</HrefLink>
          </InputContainer>
        </LoginContainer>
      </div>
    );
  }

  return (
    <div>
      <LoginContainer>
        <Heading1 $margin>{activate ? t('Register') : t('Reset password')}</Heading1>
        <p>
          {activate
            ? t('Thank you, your email is confirmed. Please choose a password.')
            : t('Please choose a new password')}
        </p>
        <form method="post" action={`/s/${site.slug}/madoc/reset-password`}>
          <InputContainer $error={formError}>
            <InputLabel htmlFor="p1">{t('Password')}</InputLabel>
            <Input type="password" required name="p1" id="p1" />
          </InputContainer>
          <InputContainer $error={didError}>
            <InputLabel htmlFor="p2">{t('Confirm password')}</InputLabel>
            <Input type="password" required name="p2" id="p2" />
            {didError ? <ErrorMessage $small>{t('Passwords do not match')}</ErrorMessage> : null}
          </InputContainer>
          <InputContainer>
            <LoginActions>
              <FlexSpacer />
              <Button $primary disabled={didError}>
                {activate ? t('Complete registration') : t('Reset password')}
              </Button>
            </LoginActions>
          </InputContainer>

          <input type="hidden" value={c1} name="c1" />
          <input type="hidden" value={c2} name="c2" />
        </form>
      </LoginContainer>
    </div>
  );
};
