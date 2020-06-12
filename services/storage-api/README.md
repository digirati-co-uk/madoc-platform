# Storage API


## JWT options
Available scopes:
* files.read - read all files
* files.write - create new files
* files.update - update existing files
* site.admin - all the above

Files will be stored under the JWT issuer by default:
* `/${iss}/${bucket}/${file_name}`

If an S3 bucket has been configured to map to a bucket, this will be flipped:
* `/${s3_bucket}/${iss}/${file_name}`

If an S3 bucket has been configured to map an issuer AND a bucket:
* `/${s3_bucket}/${file_name}`

Custom option to override which JWT field used in place of the issuer (default `iss`).

Should allow a single bucket to be used for many issuers (in Madoc - sites) or one bucket
to be assigned to one set of content (e.g. manifests). This is transparent to the
usage of the service.
