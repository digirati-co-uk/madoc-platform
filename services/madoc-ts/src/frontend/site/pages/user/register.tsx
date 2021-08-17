import { stringify } from 'query-string';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useHistory } from 'react-router-dom';
import { Button } from '../../../shared/atoms/Button';
import { ErrorMessage } from '../../../shared/atoms/ErrorMessage';
import { FlexSpacer } from '../../../shared/atoms/FlexSpacer';
import { Heading1 } from '../../../shared/atoms/Heading1';
import { Input, InputContainer, InputLabel } from '../../../shared/atoms/Input';
import { LoginActions, LoginContainer } from '../../../shared/atoms/LoginContainer';
import { LocaleString } from '../../../shared/components/LocaleString';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { useFormResponse, useSite, useSystemConfig, useUser } from '../../../shared/hooks/use-site';
import { HrefLink } from '../../../shared/utility/href-link';

export const Register: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();
  const site = useSite();
  const systemConfig = useSystemConfig();
  const query = useLocationQuery();
  const history = useHistory();
  const form = useFormResponse<{
    invitation?: any;
    emailError: boolean;
    unknownError: boolean;
    name?: string;
    email?: string;
    registerSuccess?: boolean;
  }>();

  const didError = form?.emailError || form?.unknownError;

  useEffect(() => {
    if (user) {
      return;
    }
    if (!query.success && form?.registerSuccess) {
      history.push(`/register?${stringify({ success: true })}`);
    }
    if (query.success && !form?.registerSuccess) {
      history.push(`/register`);
    }
  }, [form?.registerSuccess, history, query.success, user]);

  if (!user && !systemConfig.enableRegistrations) {
    return <Redirect to="/login" />;
  }

  if (form?.registerSuccess) {
    return (
      <div>
        <LoginContainer>
          <Heading1 $margin>{t('Register')}</Heading1>
          <p>{t('We have sent you an email with a link to complete your registration.')}</p>
        </LoginContainer>
      </div>
    );
  }

  if (user && !form?.invitation) {
    return <Redirect to="/" />;
  }

  if (user && form?.invitation) {
    // @todo.
    return (
      <div>
        <form method="POST" action={`/s/${site.slug}/madoc/register`}>
          <LoginContainer>
            <Heading1 $margin>Invitation</Heading1>
            <p style={{ marginBottom: 20 }}>
              <LocaleString>{form.invitation.message}</LocaleString>
            </p>
            <InputContainer>
              <LoginActions>
                <FlexSpacer />
                <Button type="submit" $primary>
                  {t('Accept invite')}
                </Button>
              </LoginActions>
            </InputContainer>
          </LoginContainer>
          <input type="hidden" name="code" value={form.invitation.id} />
        </form>
      </div>
    );
  }

  return (
    <div>
      <form method="POST" action={`/s/${site.slug}/madoc/register`}>
        <LoginContainer>
          {form?.invitation ? (
            <>
              <Heading1 $margin>Invitation</Heading1>
              <p style={{ marginBottom: 20 }}>
                <LocaleString>{form.invitation.message}</LocaleString>
              </p>
            </>
          ) : (
            <>
              <Heading1 $margin>{t('Register')}</Heading1>
            </>
          )}
          <InputContainer>
            <InputLabel htmlFor="name">{t('Display name')}</InputLabel>
            <Input type="text" name="name" id="name" defaultValue={form?.name} />
          </InputContainer>
          <InputContainer $error={didError}>
            <InputLabel htmlFor="email">{t('Email')}</InputLabel>
            <Input type="text" name="email" id="email" defaultValue={form?.email} />
            {form?.emailError ? <ErrorMessage $small>{t('Email already in use')}</ErrorMessage> : null}
          </InputContainer>
          <InputContainer>
            <LoginActions>
              <FlexSpacer>
                {t('Already have an account?')} <HrefLink href="/login">{t('Login')}</HrefLink>
              </FlexSpacer>
              <Button type="submit" $primary>
                {t('Register')}
              </Button>
            </LoginActions>
          </InputContainer>
        </LoginContainer>
        {form?.invitation ? <input type="hidden" name="code" value={form.invitation.id} /> : null}
      </form>
    </div>
  );
};
