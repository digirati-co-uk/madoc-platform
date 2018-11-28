# PublicUser
Omeka-S module for allow public user registrations and logins

## Components
All the pieces required to implement a full public user system.

### Controllers
These are the current controllers for admin [login](https://github.com/omeka/omeka-s/blob/develop/application/src/Controller/LoginController.php) and [registration](https://github.com/omeka/omeka-s/blob/develop/application/src/Controller/Admin/UserController.php) that can be adapted for our module.

* Site user controller
  * loginAction [MVP] 
  * logoutAction [MVP]
  * registerAction
  * forgotPasswordAction
  * createPasswordAction

- User account controller
   - showDetailsAction [MVP]
   - editAccountAction
   
- Public user admin controller
   - pendingUsersAction

### Blocks
- Login form block
- Registration form block
- Current user welcome / prompt to login combo block [MVP]

### Configuration
- Self-registered user role
- Toggle self-activation (otherwise admin has to approve users)

## Issues
- User roles are not fluid
  - Need to subclass [Omekas ACL](https://github.com/omeka/omeka-s/blob/071059283750a582418b7cd163c3f43d9e46cb5a/application/src/Permissions/Acl.php)
  - Need to override `UserIsAllowed` factory to use our ACL [source](https://github.com/omeka/omeka-s/blob/ccec0a2758a084df118c051653903b9ec412c3db/application/src/Mvc/Controller/Plugin/UserIsAllowed.php)
  - [All other uses](https://github.com/omeka/omeka-s/search?utf8=%E2%9C%93&q=%22Omeka%5CPermissions%5CAcl%22&type=)
  

### Requirements & Rationale and how to remove them.
- **PHP 7** - in our example we explore how to use PHP 7s scalar types to aid configuration management, in addition to 
an alternative template rendering system which currently requires PHP 7 to run. You can remove this dependency when
creating your own module by removing scalar type hints and amending the composer.json.
 - **Twig** - In order to render the twig templates you will need an Omeka-S installation with the `ZfcTwig` extension.

### Running
To see the example after installing, go to your Omeka-S site, in the admin section go to your modules and enable
"PublicUser" to enable it. You should now, while logged in as an admin

### Compilation
The main addition in this starter kit is access to Composer and the wide range of libraries you can install from it. One
issue with this is distributing modules as zip files. In this starter kit you can run a "compilation" set to create a
zip file with your composer dependencies bundled. This is currently experimental, and may cause issues if you install
conflicting dependencies.

To compile your module, make sure you run the installation steps above, and then run this from the root of your module:
```
./bin/package
```
If successful you will have a zip file in a build directory of your module. This is fully portable and can be dropped in
another Omeka-S installation with ease. 

### Packagist
You can also submit your module to packagist (https://packagist.org/) and have your users pull it down in their omeka-s
installation just like a normal composer dependency. This is currently un-tested, but should result in a better resolution of
package versions than the zip method.