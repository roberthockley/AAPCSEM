resource "aws_vpc" "aapcs" {
  cidr_block                           = "10.0.0.0/16"
  enable_dns_hostnames                 = "true"
  enable_dns_support                   = "true"
  enable_network_address_usage_metrics = "false"
  instance_tenancy                     = "default"
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-${var.vpc.name}"
    airid = "${var.environment.airid}"
  }
}

resource "aws_flow_log" "aapcs" {
  iam_role_arn    = aws_iam_role.ai_aapcs_flow_logs.arn
  log_destination = aws_cloudwatch_log_group.vpcflow_logs.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.aapcs.id
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-${var.vpc.name}"
    airid = "${var.environment.airid}"
  }
}
