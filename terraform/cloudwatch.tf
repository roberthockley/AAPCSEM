resource "aws_cloudwatch_log_group" "aapcs_logs" {
  name = "/ecs/${var.project.tla}-${var.environment.name}-${var.ecs.cluster_name}"
  retention_in_days = 7
  tags = {
    airid = "${var.environment.airid}"
  }
}

resource "aws_cloudwatch_log_group" "vpcflow_logs" {
  name = "/vpc-flow-logs/${var.project.tla}-${var.environment.name}-${var.vpc.name}"
  retention_in_days = 7
  tags = {
    airid = "${var.environment.airid}"
  }
}
