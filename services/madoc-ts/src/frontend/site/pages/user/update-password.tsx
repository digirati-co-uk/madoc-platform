import { stringify } from 'query-string';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/navigation/Button';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { FlexSpacer } from '../../../shared/layout/FlexSpacer';
import { Heading1 } from '../../../shared/typography/Heading1';
import { Input, InputContainer, InputLabel } from '../../../shared/form/Input';
import { LoginActions, LoginContainer } from '../../../shared/layout/LoginContainer';
import { SuccessMessage } from '../../../shared/callouts/SuccessMessage';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { useFormResponse, useSite, useUser } from '../../../shared/hooks/use-site';
import { HrefLink } from '../../../shared/utility/href-link';

export const UpdatePasswordPage: React.FC = () => {
  const user = useUser();
  const site = useSite();
  const { t } = useTranslation();
  const query = useLocationQuery<{ e1?: string; e2?: string; success?: string }>();
  const form = useFormResponse<{
    passwordError?: boolean;
    invalidPassword?: boolean;
    passwordChangeSuccess?: boolean;
  }>();
  const navigate = useNavigate();

  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [passwordError, setPasswordError] = useState(form?.passwordError);
  const [invalidPassword, setInvalidPasswordError] = useState(form?.invalidPassword);

  function checkPasswords() {
    if (p1 && p2 && p1 !== p2) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
  }

  useEffect(() => {
    if (!query.e1 && form?.passwordError) {
      navigate(`/profile/password?${stringify({ e1: true })}`);
    }
    if (!query.e2 && form?.invalidPassword) {
      navigate(`/profile/password?${stringify({ e2: true })}`);
    }
    if (!query.success && form?.passwordChangeSuccess) {
      navigate(`/profile/password?${stringify({ success: true })}`);
    }
  }, [form?.invalidPassword, form?.passwordChangeSuccess, form?.passwordError, history, query, user]);

  if (!user) {
    return <Navigate to={'/'} />;
  }

  return (
    <div>
      {form?.passwordChangeSuccess ? (
        <>
          <LoginContainer>
            <Heading1 $margin>{t('Change password')}</Heading1>
            <SuccessMessage>{t('Password changed')}</SuccessMessage>
            <InputContainer>
              <div>
                <Button $primary as={HrefLink} href={'/'}>
                  {t('Back to homepage')}
                </Button>
              </div>
            </InputContainer>
          </LoginContainer>
        </>
      ) : (
        <>
          <form method="POST" action={`/s/${site.slug}/profile/password`}>
            <LoginContainer>
              <Heading1 $margin>{t('Change password')}</Heading1>

              <InputContainer $error={invalidPassword}>
                <InputLabel htmlFor="password_old">{t('Current password')}</InputLabel>
                <Input
                  type="password"
                  name="password_old"
                  id="password_old"
                  onBlur={() => setInvalidPasswordError(false)}
                />
                {invalidPassword ? <ErrorMessage $small>{t('Invalid password')}</ErrorMessage> : null}
              </InputContainer>

              <br />

              <InputContainer $error={passwordError}>
                <InputLabel htmlFor="p1">{t('New password')}</InputLabel>
                <Input
                  type="password"
                  name="p1"
                  id="p1"
                  value={p1}
                  onBlur={checkPasswords}
                  onChange={e => setP1(e.currentTarget.value)}
                />
              </InputContainer>
              <InputContainer $error={passwordError}>
                <InputLabel htmlFor="p2">{t('Confirm password')}</InputLabel>
                <Input
                  type="password"
                  name="p2"
                  id="p2"
                  value={p2}
                  onBlur={checkPasswords}
                  onChange={e => setP2(e.currentTarget.value)}
                />
                {passwordError ? <ErrorMessage $small>{t('New passwords do not match')}</ErrorMessage> : null}
              </InputContainer>

              <InputContainer>
                <LoginActions>
                  <FlexSpacer />
                  <Button type="submit" $primary $disabled={!p1 || !p2 || invalidPassword || passwordError}>
                    {t('Update profile')}
                  </Button>
                </LoginActions>
              </InputContainer>
            </LoginContainer>
          </form>
        </>
      )}
    </div>
  );
};
