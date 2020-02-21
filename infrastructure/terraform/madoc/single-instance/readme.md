# Madoc Single Instance

Sample configuration for creating required infrastructure for hosting Madoc and Madoc DB in a single EC2 instance.

## Prerequisites

* [Terraform](https://www.terraform.io) 0.12+.
* A value for the Terraform `prefix` variable will need to be specified. This is to help uniquely identify any resources. This will typically be the project/client name.
* Any Madoc variables will need to be configured in [AWS Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html). See [environment variables](#Madoc-Environment-Variables), below, for more information.

## Usage

Run the following basic Terraform commands to generate the infrastructure.

```bash
terraform init

terraform plan

terraform apply
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

* provider.tf - basic provider + backend setup.
* variables.tf - optional/required values for managing setup.
* ec2.tf - creates and bootstraps EC2 instance with docker-compose file running under systemd. Creates EBS instance for storing mysql data.
* backup.tf - infrastructure for backing up mysql data from EBS to S3 bucket.
* networking.tf - route53 infrastructure for routing traffic to machine.
* output.tf - 