On start up, application will create itself in the database if it doesn't exist as a global admin and then assign it's self 
an API key. The user will not be able to be login, as it will not have a password. API key will
be hashed in database, but will be a known string, signed by same key as JWT. 

- [ ] Login page
- [ ] POST login with authentication
- [ ] Set cookie with user JWT for single site
- [ ] Set cookie with user JWT for admin (if applicable)
- [ ] Omeka code to pick up JWT and log user in, if not logged in - possibly non-persistent to work with cookie domains
- [ ] Logout endpoint
- [ ] Register endpoint
- [ ] Forgot password page
- [ ] No OAuth endpoints for now.
- [ ] Change/confirm email address, sending confirmation emails
- [ ] See my own statistics on profile page.
- [ ] See tasks assigned to me.
- [x] Madoc - get header HTML
- [x] Madoc - get footer HTML

