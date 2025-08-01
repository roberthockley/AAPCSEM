resource "aws_vpc_endpoint" "ecr" {
  vpc_id              = aws_vpc.aapcs.id
  service_name        = "com.amazonaws.ap-southeast-1.ecr.api"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [aws_subnet.aapcs_a.id, aws_subnet.aapcs_b.id]
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-${var.vpc.name}-ecrapi"
    airid = "${var.environment.airid}"
  }
}

resource "aws_vpc_endpoint" "ecrdkr" {
  vpc_id            = aws_vpc.aapcs.id
  service_name      = "com.amazonaws.ap-southeast-1.ecr.dkr"
  vpc_endpoint_type = "Interface"
subnet_ids          = [aws_subnet.aapcs_a.id, aws_subnet.aapcs_b.id]
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-${var.vpc.name}-ecr-dkr"
    airid = "${var.environment.airid}"
  }
}

resource "aws_vpc_endpoint" "lambda" {
  vpc_id              = aws_vpc.aapcs.id
  service_name        = "com.amazonaws.ap-southeast-1.lambda"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [aws_subnet.aapcs_a.id, aws_subnet.aapcs_b.id]
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-${var.vpc.name}-lambda"
    airid = "${var.environment.airid}"
  }
}

resource "aws_vpc_endpoint" "logs" {
  vpc_id              = aws_vpc.aapcs.id
  service_name        = "com.amazonaws.ap-southeast-1.logs"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [aws_subnet.aapcs_a.id, aws_subnet.aapcs_b.id]
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-${var.vpc.name}-logs"
    airid = "${var.environment.airid}"
  }
}

resource "aws_vpc_endpoint" "monitoring" {
  vpc_id              = aws_vpc.aapcs.id
  service_name        = "com.amazonaws.ap-southeast-1.monitoring"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [aws_subnet.aapcs_a.id, aws_subnet.aapcs_b.id]
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-${var.vpc.name}-monitoring"
    airid = "${var.environment.airid}"
  }
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.aapcs.id
  service_name      = "com.amazonaws.ap-southeast-1.s3"
  vpc_endpoint_type = "Gateway"

  tags = {
    Name = "${var.project.tla}-${var.environment.name}-${var.vpc.name}-s3"
  }
}

resource "aws_vpc_endpoint_route_table_association" "web1" {
  route_table_id  = aws_route_table.aapcs_a.id
  vpc_endpoint_id = aws_vpc_endpoint.s3.id
}

resource "aws_vpc_endpoint_route_table_association" "web2" {
  route_table_id  = aws_route_table.aapcs_b.id
  vpc_endpoint_id = aws_vpc_endpoint.s3.id
}

resource "aws_vpc_endpoint" "kms" {
  vpc_id            = aws_vpc.aapcs.id
  service_name      = "com.amazonaws.ap-southeast-1.kms"
  vpc_endpoint_type = "Interface"
subnet_ids          = [aws_subnet.aapcs_a.id, aws_subnet.aapcs_b.id]
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-${var.vpc.name}-kms"
    airid = "${var.environment.airid}"
  }
}
resource "aws_vpc_endpoint" "ecstelemetry" {
  vpc_id            = aws_vpc.aapcs.id
  service_name      = "com.amazonaws.ap-southeast-1.ecs-telemetry"
  vpc_endpoint_type = "Interface"
subnet_ids          = [aws_subnet.aapcs_a.id, aws_subnet.aapcs_b.id]
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-${var.vpc.name}-ecstelemetry"
    airid = "${var.environment.airid}"
  }
}

resource "aws_vpc_endpoint" "ecsagent" {
  vpc_id            = aws_vpc.aapcs.id
  service_name      = "com.amazonaws.ap-southeast-1.ecs-agent"
  vpc_endpoint_type = "Interface"
subnet_ids          = [aws_subnet.aapcs_a.id, aws_subnet.aapcs_b.id]
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-${var.vpc.name}-ecsagent"
    airid = "${var.environment.airid}"
  }
}

resource "aws_vpc_endpoint" "ecs" {
  vpc_id            = aws_vpc.aapcs.id
  service_name      = "com.amazonaws.ap-southeast-1.ecs"
  vpc_endpoint_type = "Interface"
subnet_ids          = [aws_subnet.aapcs_a.id, aws_subnet.aapcs_b.id]
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-${var.vpc.name}-ecs"
    airid = "${var.environment.airid}"
  }
}
