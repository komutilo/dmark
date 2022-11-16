# Dmark

<!-- Badges -->
[![git last tag][img-github-tag-badge]][link-github-tags] [![npm last version][img-npm-version-badge]][link-npm]

Terraform wrapper for multi-stage and multi-stack that adds only a config file. Perfect for no HCP projects.

## Dependencies


**Runtime**  
- Node.js + npm


**Development**  
- pnpm
---
## How to install
```sh
npm i -g dmark
```

## How to use

Example with an AWS S3 bucket:  


The `./src/a-bucket/main.tf` file:
```hcl
terraform {
  required_version = ">= 1.3.4"

  required_providers {
    aws = {
      version = "4.39.0"
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

[img-github-tag-badge]:https://img.shields.io/github/v/tag/komutilo/dmark?style=flat-square
[img-npm-version-badge]:https://img.shields.io/npm/v/dmark/latest?style=flat-square
[img-github-workflow-badge]:https://img.shields.io/github/workflow/status/komutilo/dmark/deploy/main?style=flat-square
[link-github-tags]:https://github.com/komutilo/dmark/tags
[link-npm]:https://www.npmjs.com/package/dmark
