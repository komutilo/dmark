terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region = "sa-east-1"
}

variable "stage" {
  type        = string
  description = "The current stage of the infrastructure."
}

variable "bucket_prefix" {
  type        = string
  description = "An input of a specific bucket name prefix."
}

resource "aws_s3_bucket" "bucket" {
  bucket        = "${var.stage}-${var.bucket_prefix}-bucket"
  force_destroy = true
}

output "bucket_name" {
  value = aws_s3_bucket.bucket.id
}
