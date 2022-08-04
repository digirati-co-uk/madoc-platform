import { stringify } from 'query-string';
import { useEffect } from 'react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/navigation/Button';
import { FlexSpacer } from '../../../shared/layout/FlexSpacer';
import { Heading1 } from '../../../shared/typography/Heading1';
import { Input, InputContainer, InputLabel } from '../../../shared/form/Input';
import { LoginActions, LoginContainer } from '../../../shared/layout/LoginContainer';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { useFormResponse, useSite, useUser } from '../../../shared/hooks/use-site';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const site = useSite();
  const user = useUser();
  const form = useFormResponse<{ forgotSuccess?: boolean }>();
  const navigate = useNavigate();
  const query = useLocationQuery<{ success?: string }>();

  useEffect(() => {
    if (user) {
      return;
    }
    if (!query.success && form?.forgotSuccess) {
      navigate(`/forgot-password?${stringify({ success: true })}`);
    }
    if (query.success && !form?.forgotSuccess) {
      navigate(`/forgot-password`);
    }
  }, [form?.forgotSuccess, query.success]);

  if (user) {
    return <Navigate to="/" />;
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
