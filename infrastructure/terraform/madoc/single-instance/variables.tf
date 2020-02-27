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
  type        = string
  description = "AWS region"
  default     = "eu-west-1"
}

variable availability_zone {
  type        = string
  description = "Availability zone"
  default     = "eu-west-1a"
}

variable ebs_size {
  type        = number
  description = "Size of EBS volume, in GB"
  default     = 30
}

variable ebs_backup_size {
  type        = number
  description = "Size of EBS backup volume, in GB"
  default     = 30
}

variable "ebs_backup_retain_count" {
  type        = number
  description = "The number of EBS snapshots to retain"
  default     = 14
}

variable "ebs_backup_interval" {
  type        = number
  description = "How often EBS snapshot policy should be evaluated"
  default     = 24
}

variable "ebs_backup_times" {
  type        = string
  description = "Time, in 24 hour clock format, of when EBS snapshot policy should be evaluated"
  default     = "03:30"
}

variable "instance_type" {
  type        = string
  description = "Instance size of EC2 instance"
  default     = "t2.small"
}

variable "docker_compose_file" {
  type        = string
  description = "Relative path to compose file for Madoc"
  default     = "../../../../docker-compose.madoc.yml"
}

variable "prefix" {
  type        = string
  description = "Prefix to help uniquely identify resources"
}

variable key_pair_private_key_path {
  type        = string
  description = "Path to private key for connecting to EC2 instance"
}