# Capture Model Import / Export

## Export endpoint

eg.
GET http://example.org/model-export/inline/:id

Where id is the id of an Item-Set or Item in omeka
 
 ### Installation
 
 ##### Repository
 Clone this repository into your modules folder in Omeka-S
```
$ cd modules
$ git clone git@github.com:digirati-co-uk/omeka-capture-model-import.git CaptureModelImport
```
 and run composer install from the folder
 ```
 $ cd CaptureModelImport
 $ composer install
 ```
 
### Running
Install module in the usual way from within the Modules section of the Admin UI in Omeka-S.
An additional Admin menu item should then appear. Selecting this will present a form to select the file to import.

The file can contain JSON or YAML input.

There are samples of input Yaml and Json files.
There are a few things to be aware of.

Within the files, there are references to some Omeka artifacts, such as ResourceTemplates.
The id's for these may need to be adjusted to reflect those in the target system.


