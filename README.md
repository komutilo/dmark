# Dmark
Terraform wrapper for multi-stage and multi-stack that adds only a config file.

## Dependencies
- Node.js + npm
- pnpm

## How to install
```sh
npm i -g dmark
```

## How to use

Example with an AWS S3 bucket:  


The `./src/a-bucket/main.tf` file:
```hcl
terraform {
  required_version = ">= 1.3.0"

  required_providers {
    aws = {
      version = "4.32.0"
      source  = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region  = var.region
  profile = var.profile
}

resource "aws_s3_bucket" "a_bucket" {
  bucket = var.name

  tags = {
    Name        = var.name
    Environment = var.stage
  }
}
```


The `./dmark.config.yaml` file:  


```yaml
globals:
  stages:
    __all__:
      vars:
        region: sa-east-1
      backendConfig:
        region: sa-east-1
    dev:
      vars:
        stage: Dev
    staging:
      vars:
        stage: Staging
    prod:
      vars:
        stage: Prod

stacks:
  aBucketStack:
    path: ./src/a-bucket
    description: Just a example with bucket.
    order: 1
    local: true
    labels:
      - admin-only
    stages:
      __all__:
        vars:
          profile: default
      dev:
        vars:
          name: a-dev-bucket
      staging:
        vars:
          name: a-staging-bucket
      prod:
        vars:
          name: a-prod-bucket
```


The Dmark calls examples:
```sh
dmark plan
dmark apply
# ...or any other terraform command;
# it will run all stacks and stages in order!

# or can run a exclusive config:
dmark plan --stack aBucketStack --stage dev
dmark apply --stack aBucketStack --stage dev

```