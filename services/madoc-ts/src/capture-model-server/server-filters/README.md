## From old parser

* Document
  * revisionIds?: string[];  (1)
  * publishedRevisionIds?: string[]; (2)
  * idsRemovedByPublishedRevisions?: string[]; (3)
  * onlyRevisionFields?: boolean; (4)
* Model
  * userId?: string; (5)
  * revisionId?: string; (6)
  * revisionStatus?: string; (7)
  * onlyRevisionFields?: boolean; (8)
  * showAllRevisions?: boolean; (9)

## Pre-save validation / filters

One problem is that when a model or revision is saved the user might not be able to make all the changes they want. 
They are only allowed to edit revisions that belong to them - unless they are an administrator or reviewer. 


## Personal models
Like personal notes could a user create their own capture model templates and then use them in projects as notes.

## Helpers

* List of field, document and selector identifiers that the current user CANNOT edit


## Filters
* (1) Filter out document to a set of revisions (+published)

* Filter out in progress revisions not created by the current user
* Filter to a published-only set of fields?
