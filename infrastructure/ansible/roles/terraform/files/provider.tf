provider "aws" {
  version = "~> 2.46"
  region  = var.region
}

terraform {
  backend "s3" {
  }
}