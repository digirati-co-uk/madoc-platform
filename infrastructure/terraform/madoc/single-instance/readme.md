# Madoc Single Instance

Sample configuration for creating required infrastructure for hosting Madoc and Madoc DB in a single EC2 instance.

Creates an EC2 instance with EBS volumes in a VPC with single subnet and gateway.

## Prerequisites

* [Terraform](https://www.terraform.io) 0.12+.
* Madoc variables will need to be configured in [AWS Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html). See [environment variables](#Madoc-Environment-Variables), below, for more information.
* Ensure there is a public key in `files\key.pub` for adding to the EC2 instance (e.g. via `ssh-keygen -t rsa -b 4096`). If there is an existing key to be used comment out the `data.template_file` and `aws_key_pair.auth` resources and set the key name in `aws_instance.madoc.key_name` property.
* A value for the Terraform `key_pair_private_key_path` variable. This is for ssh connection for file provisioner.
* A value for the Terraform `prefix` variable. This is to help uniquely identify any resources.

## Usage

Run the following basic Terraform commands to generate the infrastructure.

```bash
terraform init

terraform plan -var="key_pair_private_key_path=/path/to/key" -var="prefix=myprefix"

terraform apply -var="key_pair_private_key_path=/path/to/key" -var="prefix=myprefix"
```

## Madoc Environment Variables

The default bootstrap script, specified as [EC2 user_data](https://www.terraform.io/docs/providers/aws/r/instance.html#user_data) will read secrets from parameter store. The available secrets can be viewed in `docker-compose` file.

These variables must take the form `/madoc/{prefix}/{workspace}/{env-var-name}`. The order of the parameters is important as these are fetched [by path](https://docs.aws.amazon.com/cli/latest/reference/ssm/get-parameters-by-path.html) E.g.

* `/madoc/digirati/default/MYSQL_DATABASE`
* `/madoc/myproj/prd/MYSQL_USER`

Parameters can be stored using the AWS cli

```bash
aws ssm put-parameter --name /madoc/digirati/default/MYSQL_DATABASE --value my-db-name --type SecureString
```

## Files

The following files are provided, these can be altered to suit exact requirements.

* [provider.tf](provider.tf) - basic provider + backend setup.
* [variables.tf](variables.tf) - variables for managing setup.
* [ec2.tf](ec2.tf) - creates and bootstraps EC2 instance with docker-compose file running under systemd. Creates EBS instances for storing data.
* [backup.tf](backup.tf) - infrastructure for taking EBS snapshots.
* [network.tf](network.tf) - VPC, subnets etc.

## Implementation Details

## Backup Process

There are 2 EBS volumes mounted to the EC2 instance. These are mounted as: `/opt/data/` to store working files for mysql and omeka uploads. `/mnt/backup` to stores backups. A snapshot of the drive mounted at `/mnt/backup` is taken once per day @ 03:30 (controllable by tf variables).

Systemd services for backing up data are:

* `madoc-backup.service` - this runs `madoc-backup.timer` to `rsync` omeka_files on the hour (+/- 5 mins) to `/mnt/backup/omeka_files/`.
* `madoc-db-backup@.service` - this runs hourly (on the hour), daily (02:30), weekly (01:30 on Sunday), monthly (00:30 1st of month) timers to take mysql dumps to `/mnt/backup/mysql`. See `/files/rsnapshot.conf` for details.