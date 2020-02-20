# Madoc Single Instance

Sample configuration for creating required infrastructure for hosting Madoc and Madoc DB in a single EC2 instance.

## Usage

```bash
terraform init

terraform plan

terraform apply
```

## Files

The following files are provided, these can be altered to suit exact requirements.

* provider.tf - basic provider + backend setup.
* variables.tf - optional/required values for managing setup.
* ec2.tf - creates and bootstraps EC2 instance with docker-compose file running under systemd. Creates EBS instance for storing mysql data.
* backup.tf - infrastructure for backing up mysql data from EBS to S3 bucket.
* networking.tf - route53 infrastructure for routing traffic to machine.
* output.tf - 