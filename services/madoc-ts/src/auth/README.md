# Authentication strategies
This feature is currently in development with the minimal  pieces in place for an implementation
to be built on top of. By utilising PassportJS we can enable user in Madoc to link an account identifier
from a 3rd party service (like GitHub) and then login using that provider.

When a user logs in with a service (like GitHub), the user is authenticated, the ID checked against the database
and then a JWT is exchanged. We don't intend to use the access tokens provided by these services, only exchange
for our own JWT tokens.


### Creating providers.
The idea is to be able to link PassportJS providers easily by containing them in one place. 

So a definition would be structured like this:
```js
const keyFromEnv = process.env.MY_PROVIDER_KEY || '';

const myProvider = {
  isAvailable() {
    return !!keyFromEnv;
  },
  register() {
    passport.use(
      new MyProviderStrategy(
        {
          some_key: keyFromEnv,
          /* ... */
        }
      )
    )
  },
  routes(loginWithProvider) {
    return {
      'auth-my-strategy': [
        TypedRouter.GET, 
        '/auth/my-strategy',  
        passport.authenticate('my-provier', { /* ... */ }),
        loginWithProvider,
      ],
    };
  }
};
```

and then added to the index of this auth folder. If the environment variables are there then it will
be enabled and the routes will be registered.

Most strategies will have an authorize step, where you map the response to a user object. Check
the GitHub example for how this currently works. 

### Registering / linking

At the moment there is no way to link or register using this integration. However, this functionality can be built 
on top of these definitions by expanding `loginWithProvider` and possibly offering different paths for the user after
authenticating (while already logged in for example).
