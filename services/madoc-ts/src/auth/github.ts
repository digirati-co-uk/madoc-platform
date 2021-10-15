import passport from 'koa-passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { RouteMiddleware } from '../types/route-middleware';
import { TypedRouter } from '../utility/typed-router';

const clientID = process.env.GITHUB_CLIENT_ID || '';
const clientSecret = process.env.GITHUB_CLIENT_SECRET || '';
const callbackURL = process.env.GITHUB_CLIENT_CALLBACK_URL || '';

export const github = {
  isAvailable() {
    return clientID && clientSecret && callbackURL;
  },
  register() {
    if (!github.isAvailable()) {
      throw new Error('Github not enabled');
    }
    passport.use(
      new GitHubStrategy(
        {
          clientID,
          clientSecret,
          callbackURL,
        },
        (accessToken: string, refreshToken: string, profile: any, done: any) => {
          fetch(`https://api.github.com/user/emails`, {
            headers: {
              Accept: 'application/vnd.github.v3+json',
              Authorization: `token ${accessToken}`,
            },
          })
            .then(resp => resp.json())
            .then(emails => {
              const primary = emails.find((e: any) => e.verified && e.primary);

              if (!primary) {
                done(new Error('No valid email'));
                return;
              }

              done(null, {
                id: profile.id,
                provider: 'github',
                details: {
                  name: profile.displayName,
                  username: profile.username,
                  email: primary.email,
                },
              });
            });
        }
      )
    );
  },
  router(loginWithProvider: RouteMiddleware) {
    return {
      'auth/github': [TypedRouter.GET, '/auth/github', [passport.authenticate('github', { scope: ['user:email'] })]],
      'auth/github-callback': [
        TypedRouter.GET,
        '/auth/github/callback',
        [passport.authenticate('github', { failureRedirect: '/login', session: false }), loginWithProvider],
      ],
    };
  },
};
