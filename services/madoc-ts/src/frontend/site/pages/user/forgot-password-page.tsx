import { stringify } from 'query-string';
import { useEffect } from 'react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useHistory } from 'react-router-dom';
import { Button } from '../../../shared/atoms/Button';
import { FlexSpacer } from '../../../shared/atoms/FlexSpacer';
import { Heading1 } from '../../../shared/atoms/Heading1';
import { Input, InputContainer, InputLabel } from '../../../shared/atoms/Input';
import { LoginActions, LoginContainer } from '../../../shared/atoms/LoginContainer';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { useFormResponse, useSite, useUser } from '../../../shared/hooks/use-site';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const site = useSite();
  const user = useUser();
  const form = useFormResponse<{ forgotSuccess?: boolean }>();
  const history = useHistory();
  const query = useLocationQuery<{ success?: string }>();

  useEffect(() => {
    if (user) {
      return;
    }
    if (!query.success && form?.forgotSuccess) {
      history.push(`/forgot-password?${stringify({ success: true })}`);
    }
    if (query.success && !form?.forgotSuccess) {
      history.push(`/forgot-password`);
    }
  }, [form?.forgotSuccess, history, query.success]);

  if (user) {
    return <Redirect to="/" />;
  }

  if (form?.forgotSuccess) {
    return (
      <div>
        <LoginContainer>
          <Heading1 $margin>{t('Forgot password')}</Heading1>
          <p>
            {t(
              'Thank you, if your email is registered with this site we will send you an email with a link to complete your password reset.'
            )}
          </p>
        </LoginContainer>
      </div>
    );
  }

  return (
    <div>
      <form method="post" action={`/s/${site.slug}/forgot-password`}>
        <LoginContainer>
          <Heading1 $margin>{t('Forgot password')}</Heading1>
          <p>{t('Please enter your email and we will sent you a link to recover your account.')}</p>
          <InputContainer>
            <InputLabel htmlFor="email">{t('Email')}</InputLabel>
            <Input type="text" name="email" id="email" />
          </InputContainer>
          <InputContainer>
            <LoginActions>
              <FlexSpacer />
              <Button $primary>{t('Reset password')}</Button>
            </LoginActions>
          </InputContainer>
        </LoginContainer>
      </form>
    </div>
  );
};
