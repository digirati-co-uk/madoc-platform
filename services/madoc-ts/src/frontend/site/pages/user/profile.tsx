import { stringify } from 'query-string';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/navigation/Button';
import { FlexSpacer } from '../../../shared/layout/FlexSpacer';
import { Heading1 } from '../../../shared/typography/Heading1';
import { Input, InputContainer, InputLabel } from '../../../shared/form/Input';
import { LoginActions, LoginContainer } from '../../../shared/layout/LoginContainer';
import { SuccessMessage } from '../../../shared/callouts/SuccessMessage';
import { useLocationQuery } from '../../../shared/hooks/use-location-query';
import { useFormResponse, useSite, useUser } from '../../../shared/hooks/use-site';
import { HrefLink } from '../../../shared/utility/href-link';

export const ProfilePage: React.FC = () => {
  const user = useUser();
  const site = useSite();
  const navigate = useNavigate();
  const form = useFormResponse<{ success?: boolean }>();
  const query = useLocationQuery<{ success?: boolean }>();
  const { t } = useTranslation();

  useEffect(() => {
    if (!query.success && form?.success) {
      navigate(`/profile?${stringify({ success: true })}`);
    }
  }, [query, form]);

  if (!user) {
    return <Navigate to={'/'} />;
  }

  return (
    <div>
      <form method="POST" action={`/s/${site.slug}/profile`}>
        <LoginContainer>
          <Heading1 $margin>{t('Profile')}</Heading1>
          {form?.success ? <SuccessMessage>{t('Profile updated')}</SuccessMessage> : null}

          <InputContainer>
            <InputLabel htmlFor="name">{t('Display name')}</InputLabel>
            <Input type="text" name="name" id="name" defaultValue={user.name} />
          </InputContainer>

          <InputContainer>
            <LoginActions>
              <FlexSpacer>
                <HrefLink href={'/profile/password'}>{t('Change password')}</HrefLink>
              </FlexSpacer>
              <Button type="submit" $primary>
                {t('Update profile')}
              </Button>
            </LoginActions>
          </InputContainer>
        </LoginContainer>
      </form>
    </div>
  );
};
