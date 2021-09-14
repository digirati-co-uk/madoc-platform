import { stringify } from 'query-string';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { Button } from '../../../shared/atoms/Button';
import { ErrorMessage } from '../../../shared/atoms/ErrorMessage';
import { FlexSpacer } from '../../../shared/atoms/FlexSpacer';
import { Heading1 } from '../../../shared/atoms/Heading1';
import { Input, InputContainer, InputLabel } from '../../../shared/atoms/Input';
import { LoginActions, LoginContainer } from '../../../shared/atoms/LoginContainer';
import { SuccessMessage } from '../../../shared/atoms/SuccessMessage';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { useFormResponse, useSite, useUser } from '../../../shared/hooks/use-site';
import { HrefLink } from '../../../shared/utility/href-link';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();
  const site = useSite();
  const form = useFormResponse<{ loginError?: boolean; email?: string; success?: boolean }>();
  const didError = form?.loginError || false;
  const { redirect } = useLocationQuery();

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div>
      {form && form.success ? <SuccessMessage>{t('You may now login')}</SuccessMessage> : null}
      <LoginContainer>
        <Heading1 $margin>{t('Login')}</Heading1>
        <form method="post" action={`/s/${site.slug}/login?${stringify({ redirect })}`}>
          <InputContainer $error={didError}>
            <InputLabel htmlFor="email">{t('Email')}</InputLabel>
            <Input type="text" required defaultValue={form?.email} name="email" id="email" />
          </InputContainer>
          <InputContainer $error={didError}>
            <InputLabel htmlFor="password">{t('Password')}</InputLabel>
            <Input type="password" required name="password" id="password" />
            {didError ? <ErrorMessage $small>Incorrect email or password</ErrorMessage> : null}
          </InputContainer>
          <InputContainer>
            <LoginActions>
              <FlexSpacer>
                <HrefLink href={`/forgot-password`}>{t('Forgot password?')}</HrefLink>
              </FlexSpacer>
              <Button $primary>{t('Login')}</Button>
            </LoginActions>
          </InputContainer>
        </form>
      </LoginContainer>
    </div>
  );
};
