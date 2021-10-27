import { Heading1 } from '../../src/frontend/shared/typography/Heading1';
import { Button } from '../../src/frontend/shared/navigation/Button';
import { ErrorMessage } from '../../src/frontend/shared/callouts/ErrorMessage';
import { LoginContainer, LoginActions } from '../../src/frontend/shared/layout/LoginContainer';
import { Input, InputContainer, InputLabel } from '../../src/frontend/shared/form/Input';
import * as React from 'react';
import styled from 'styled-components';

export default { title: 'Legacy/User pages' };

const FlexAction = styled.div`
  flex: 1 1 0px;
`;

export const Login_Page = () => {
  return (
    <div>
      <LoginContainer>
        <Heading1 $margin>Login</Heading1>
        <InputContainer>
          <InputLabel htmlFor="email">Email</InputLabel>
          <Input type="text" name="email" id="email" />
        </InputContainer>
        <InputContainer>
          <InputLabel htmlFor="password">Password</InputLabel>
          <Input type="password" name="password" id="password" />
        </InputContainer>
        <InputContainer>
          <LoginActions>
            <FlexAction>
              <a href="#">Forgot password?</a>
            </FlexAction>
            <Button $primary>Login</Button>
          </LoginActions>
        </InputContainer>
      </LoginContainer>
    </div>
  );
};

export const Login_Page_Error = () => {
  return (
    <div>
      <LoginContainer>
        <Heading1 $margin>Login</Heading1>
        <InputContainer $error>
          <InputLabel htmlFor="email">Email</InputLabel>
          <Input type="text" name="email" id="email" />
        </InputContainer>
        <InputContainer $error>
          <InputLabel htmlFor="password">Password</InputLabel>
          <Input type="password" name="password" id="password" />
          <ErrorMessage $small>Incorrect email or password</ErrorMessage>
        </InputContainer>
        <InputContainer>
          <LoginActions>
            <FlexAction>
              <a href="#">Forgot password?</a>
            </FlexAction>
            <Button $primary>Login</Button>
          </LoginActions>
        </InputContainer>
      </LoginContainer>
    </div>
  );
};

export const Registration_Page = () => {
  return (
    <div>
      <LoginContainer>
        <Heading1 $margin>Register</Heading1>
        <InputContainer>
          <InputLabel htmlFor="name">Display name</InputLabel>
          <Input type="text" name="name" id="name" />
        </InputContainer>
        <InputContainer>
          <InputLabel htmlFor="email">Email</InputLabel>
          <Input type="text" name="email" id="email" />
        </InputContainer>
        <InputContainer>
          <LoginActions>
            <FlexAction>
              Already have an account? <a href="#">Login</a>
            </FlexAction>
            <Button $primary>Register</Button>
          </LoginActions>
        </InputContainer>
      </LoginContainer>
    </div>
  );
};

export const Registration_Page_Error = () => {
  return (
    <div>
      <LoginContainer>
        <Heading1 $margin>Register</Heading1>
        <InputContainer>
          <InputLabel htmlFor="name">Display name</InputLabel>
          <Input type="text" name="name" id="name" />
        </InputContainer>
        <InputContainer $error>
          <InputLabel htmlFor="email">Email</InputLabel>
          <Input type="text" name="email" id="email" />
          <ErrorMessage $small>Email already in use</ErrorMessage>
        </InputContainer>
        <InputContainer>
          <LoginActions>
            <FlexAction>
              Already have an account? <a href="#">Login</a>
            </FlexAction>
            <Button $primary>Register</Button>
          </LoginActions>
        </InputContainer>
      </LoginContainer>
    </div>
  );
};

export const Registration_Page_After = () => {
  return (
    <div>
      <LoginContainer>
        <Heading1 $margin>Register</Heading1>
        <p>We have sent you an email with a link to complete your registration.</p>
      </LoginContainer>
    </div>
  );
};

export const Forgot_Password_Page = () => {
  return (
    <div>
      <LoginContainer>
        <Heading1 $margin>Forgot password</Heading1>
        <p>Please enter your email and we will sent you a link to recover your account.</p>
        <InputContainer>
          <InputLabel htmlFor="email">Email</InputLabel>
          <Input type="text" name="email" id="email" />
        </InputContainer>
        <InputContainer>
          <LoginActions>
            <FlexAction />
            <Button $primary>Confirm</Button>
          </LoginActions>
        </InputContainer>
      </LoginContainer>
    </div>
  );
};

export const Activate_Account_Page = () => {
  // Only shown if password is null and user needs to choose a password before logging in.
  return (
    <div>
      <LoginContainer>
        <Heading1 $margin>Register</Heading1>
        <p>Thank you, your email is confirmed. Please choose a password.</p>
        <InputContainer>
          <InputLabel htmlFor="p1">Password</InputLabel>
          <Input type="password" name="p1" id="p1" />
        </InputContainer>
        <InputContainer>
          <InputLabel htmlFor="p2">Confirm password</InputLabel>
          <Input type="password" name="p2" id="p2" />
        </InputContainer>
        <InputContainer>
          <LoginActions>
            <FlexAction />
            <Button $primary>Complete registration</Button>
          </LoginActions>
        </InputContainer>
      </LoginContainer>
    </div>
  );
};

export const Reset_Password_Page = () => {
  return (
    <div>
      <LoginContainer>
        <Heading1 $margin>Reset password</Heading1>
        <p>Please choose a new password.</p>
        <InputContainer>
          <InputLabel htmlFor="p1">Password</InputLabel>
          <Input type="password" name="p1" id="p1" />
        </InputContainer>
        <InputContainer>
          <InputLabel htmlFor="p2">Confirm password</InputLabel>
          <Input type="password" name="p2" id="p2" />
        </InputContainer>
        <InputContainer>
          <LoginActions>
            <FlexAction />
            <Button $primary>Confirm</Button>
          </LoginActions>
        </InputContainer>
      </LoginContainer>
    </div>
  );
};

export const Existing_User_Accept_Invite = () => {
  return (
    <div>
      <LoginContainer>
        <Heading1 $margin>Invitation</Heading1>
        <p>
          <strong>Stephen</strong> is inviting you to <strong>My Madoc Site</strong>
        </p>
        <p>This is a message that appears on the invitation that can be customised when creating the invitation.</p>
        <InputContainer>
          <LoginActions>
            <FlexAction />
            <Button $primary>Accept invite</Button>
          </LoginActions>
        </InputContainer>
      </LoginContainer>
    </div>
  );
};

export const Accept_Invite = () => {
  return (
    <div>
      <LoginContainer>
        <Heading1 $margin>Invitation</Heading1>
        <p>
          <strong>Stephen</strong> is inviting you to <strong>My Madoc Site</strong>
        </p>
        <p>This is a message that appears on the invitation that can be customised when creating the invitation.</p>
        <InputContainer>
          <InputLabel htmlFor="name">Display name</InputLabel>
          <Input type="text" name="name" id="name" />
        </InputContainer>
        <InputContainer>
          <InputLabel htmlFor="email">Email</InputLabel>
          <Input type="text" name="email" id="email" />
        </InputContainer>
        <InputContainer>
          <InputLabel htmlFor="p1">Password</InputLabel>
          <Input type="password" name="p1" id="p1" />
        </InputContainer>
        <InputContainer>
          <InputLabel htmlFor="p2">Confirm password</InputLabel>
          <Input type="password" name="p2" id="p2" />
        </InputContainer>
        <InputContainer>
          <LoginActions>
            <FlexAction>
              Already have an account? <a href="#">Login</a>
            </FlexAction>
            <Button $primary>Register</Button>
          </LoginActions>
        </InputContainer>
      </LoginContainer>
    </div>
  );
};
