import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const systemCheck: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  function envSet(name: string, value?: string) {
    if (value) {
      return false;
    }

    return `${name} environment variable is not set`;
  }

  context.response.body = {
    email: {
      issues: [
        // Run verify.
        ...(await context.mailer.verify(true)),
        envSet('MAIL_FROM_USER', context.mailer.config.from_user),
        envSet('SMTP_HOST', context.mailer.config.host),
        envSet('SMTP_PORT', context.mailer.config.port as any),
        envSet('SMTP_SECURITY', context.mailer.config.security),
        envSet('SMTP_USER', context.mailer.config.user),
        envSet('SMTP_PASSWORD', context.mailer.config.password),
        // Is it enabled.
        context.mailer.enabled ? false : 'Mailer is not running',
      ].filter(Boolean),
      enabled: context.mailer.enabled,
    },
  };
};
