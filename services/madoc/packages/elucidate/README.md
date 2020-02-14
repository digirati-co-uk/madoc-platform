# Omeka-S Module Starter Kit
This starter kit is aimed at developers who want to develop modules for Omeka-S (https://github.com/omeka/omeka-s) and get up and running quickly. 
It provides a skeleton to work with and an IDE friendly development experience.

### Requirements & Rationale and how to remove them.
- **PHP 7** - in our example we explore how to use PHP 7s scalar types to aid configuration management, in addition to 
an alternative template rendering system which currently requires PHP 7 to run. You can remove this dependency when
creating your own module by removing scalar type hints and amending the composer.json.
 - **Twig** - In order to render the twig templates you will need an Omeka-S installation with the `ZfcTwig` extension.
 
 ### Installation
 
 ##### Repository
 Clone this repository into your modules folder in Omeka-S
```
$ cd modules
$ git clone git@github.com:stephenwf/omeka-module-starter-kit.git OmekaModuleStarterKit
```
 and run composer install from the folder
 ```
 $ cd OmekaModuleStarterKit
 $ composer install
 ```
 
 ##### ZfcTwig (optional)
If you would like to use Twig and see the example in twig running you need to install a Zend extension.
 To continue without twig, see the instructions below.

 In the root of your Omeka-S installation:
 ```
$ composer require kokspflanze/zfc-twig
```
In your `application/config/application.config.php` add `ZfcTwig` to the first array:

```php
<?php
$reader = new Zend\Config\Reader\Ini;
return [
    'modules' => [
        'Zend\Form',
        'Zend\I18n',
        'Zend\Mvc\I18n',
        'Zend\Mvc\Plugin\Identity',
        'Zend\Navigation',
        'Zend\Router',
        'Omeka',
        'ZfcTwig', // <-- Add this line
    ]
...
```
With that installed, you can use twig templates in your module.


### Running
To see the example after installing, go to your Omeka-S site, in the admin section go to your modules and enable the
"OmekaModuleStarterKit" to enable it. You should now, while logged in as an admin, be able to go to `/starter-kit/movies`
and see it all working together.

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