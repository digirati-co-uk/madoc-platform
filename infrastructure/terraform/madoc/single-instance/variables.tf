data "aws_caller_identity" "current" {}

locals {
  # Common tags to be assigned to all resources
  common_tags = {
    "environment" = terraform.workspace
    "terraform"   = true
    "system"      = "madoc"
    "prefix"      = var.prefix
  }

  account_id = data.aws_caller_identity.current.account_id
}

variable "region" {
  description = "AWS region"
  default     = "eu-west-1"
}

variable availability_zone {
  description = "Availability zone"
  default     = "eu-west-1a"
}

variable ebs_size {
  description = "Size of EBS volume, in GB"
  default     = 30
}

variable "instance_type" {
  description = "Instance size of EC2 instance"
  default     = "t2.small"
}

variable "docker_compose_file" {
  description = "Relative path to compose file for Madoc"
  default     = "../../../../docker-compose.madoc.yml"
}

variable "prefix" {
  description = "Prefix to help uniquely identify resources"
}

variable key_pair_private_key_path {
  description = "Path to private key for connecting to EC2 instance"
}