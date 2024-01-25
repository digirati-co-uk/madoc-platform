import { stringify } from 'query-string';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { Button } from '../../../shared/navigation/Button';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { Heading1 } from '../../../shared/typography/Heading1';
import { Input, InputContainer, InputLabel } from '../../../shared/form/Input';
import { LoginActions, LoginContainer } from '../../../shared/layout/LoginContainer';
import { SuccessMessage } from '../../../shared/callouts/SuccessMessage';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { useFormResponse, useSite, useSystemConfig, useUser } from '../../../shared/hooks/use-site';
import { HrefLink } from '../../../shared/utility/href-link';
import { ArrowForwardIcon } from '../../../shared/icons/ArrowForwardIcon';
import { LoginMessage } from '../../../tailwind/components/LoginMessage';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();
  const site = useSite();
  const system = useSystemConfig();
  const form = useFormResponse<{ loginError?: boolean; email?: string; success?: boolean }>();
  const didError = form?.loginError || false;
  const { redirect } = useLocationQuery();

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      {form && form.success ? <SuccessMessage>{t('You may now login')}</SuccessMessage> : null}
      <LoginContainer>
        <Heading1 $margin>{t('Login')}</Heading1>
        {system?.loginHeader ? (
          <div dangerouslySetInnerHTML={{ __html: system.loginHeader }} style={{ marginBottom: '1em' }} />
        ) : null}
        {system.enableRegistrations ? (
          <LoginMessage>
            <span>{t(`Don't have an account?`)}</span>
            <HrefLink
              href={`/register?${stringify({ redirect })}`}
              style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }}
            >
              {t('Sign up now')} <ArrowForwardIcon />
            </HrefLink>
          </LoginMessage>
        ) : null}
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
            {system?.loginFooter ? (
              <div dangerouslySetInnerHTML={{ __html: system.loginFooter }} style={{ marginBottom: '1em' }} />
            ) : null}
            <LoginActions>
              <div style={{ flex: 1 }}>
                <HrefLink href={`/forgot-password`}>{t('Forgot password?')}</HrefLink>
              </div>
              <Button $primary>{t('Login')}</Button>
            </LoginActions>
          </InputContainer>
        </form>
      </LoginContainer>
    </div>
  );
};
