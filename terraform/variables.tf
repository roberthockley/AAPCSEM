variable "project" {
  type = object({
    tla = string
  })
  sensitive = false
}

variable "environment" {
  type = object({
    name       = string
    region     = string
    account_id = string
    airid      = string
  })
  sensitive = false
}

variable "dynamo" {
  type = object({
    table_name1 = string
    hash_key1   = string
    sort_key1   = string
  })
  sensitive = false
}

variable "s3" {
  type = object({
    bucket_name1 = string
  })
  sensitive = false
}

variable "cloudfront" {
  type = object({
    name1 = string
  })
  sensitive = false
}

variable "ecs" {
  type = object({
    cluster_name     = string
    repository_name  = string
    task_family_name = string
    task_name        = string
    service_name     = string
  })
  sensitive = false
}

variable "load_balancer" {
  type = object({
    load_balancer_name = string
    target_group1_name = string
  })
  sensitive = false
}

variable "vpc" {
  type = object({
    name = string
  })
  sensitive = false
}

variable "subnets" {
  type = object({
    name = string
  })
  sensitive = false
}

variable "security_group" {
  type = object({
    name1 = string
    name2 = string
    name3 = string
  })
  sensitive = false
}
