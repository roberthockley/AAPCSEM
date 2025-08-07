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
    airid = "${var.environment.airid}"
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

resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id            = aws_vpc.aapcs.id
  service_name      = "com.amazonaws.ap-southeast-1.dynamodb"
  vpc_endpoint_type = "Gateway"

  tags = {
    Name = "${var.project.tla}-${var.environment.name}-${var.vpc.name}-dynamodb"
    airid = "${var.environment.airid}"
  }
}

resource "aws_vpc_endpoint_route_table_association" "db1" {
  route_table_id  = aws_route_table.aapcs_a.id
  vpc_endpoint_id = aws_vpc_endpoint.dynamodb.id
}

resource "aws_vpc_endpoint_route_table_association" "db2" {
  route_table_id  = aws_route_table.aapcs_b.id
  vpc_endpoint_id = aws_vpc_endpoint.dynamodb.id
}

resource "aws_vpc_endpoint" "kinesis" {
  vpc_id            = aws_vpc.aapcs.id
  service_name      = "com.amazonaws.ap-southeast-1.kinesis-streams"
  vpc_endpoint_type = "Interface"
subnet_ids          = [aws_subnet.aapcs_a.id, aws_subnet.aapcs_b.id]
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  private_dns_enabled = true
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-${var.vpc.name}-kinesis-streams"
    airid = "${var.environment.airid}"
  }
}

###############################################################################
# 1. Data sources to get network interfaces for each Interface-type endpoint
###############################################################################

data "aws_network_interface" "ecr" {
  for_each = toset(aws_vpc_endpoint.ecr.network_interface_ids)
  id       = each.value
}

data "aws_network_interface" "ecrdkr" {
  for_each = toset(aws_vpc_endpoint.ecrdkr.network_interface_ids)
  id       = each.value
}

data "aws_network_interface" "lambda" {
  for_each = toset(aws_vpc_endpoint.lambda.network_interface_ids)
  id       = each.value
}

data "aws_network_interface" "logs" {
  for_each = toset(aws_vpc_endpoint.logs.network_interface_ids)
  id       = each.value
}

data "aws_network_interface" "monitoring" {
  for_each = toset(aws_vpc_endpoint.monitoring.network_interface_ids)
  id       = each.value
}

data "aws_network_interface" "kms" {
  for_each = toset(aws_vpc_endpoint.kms.network_interface_ids)
  id       = each.value
}

data "aws_network_interface" "ecstelemetry" {
  for_each = toset(aws_vpc_endpoint.ecstelemetry.network_interface_ids)
  id       = each.value
}

data "aws_network_interface" "ecsagent" {
  for_each = toset(aws_vpc_endpoint.ecsagent.network_interface_ids)
  id       = each.value
}

data "aws_network_interface" "ecs" {
  for_each = toset(aws_vpc_endpoint.ecs.network_interface_ids)
  id       = each.value
}

data "aws_network_interface" "kinesis" {
  for_each = toset(aws_vpc_endpoint.kinesis.network_interface_ids)
  id       = each.value
}

###############################################################################
# 2. Locals to shape each data source
###############################################################################

locals {
  eni_maps = {
    ecr           = { for eni in data.aws_network_interface.ecr : eni.id => eni }
    ecrdkr        = { for eni in data.aws_network_interface.ecrdkr : eni.id => eni }
    lambda        = { for eni in data.aws_network_interface.lambda : eni.id => eni }
    logs          = { for eni in data.aws_network_interface.logs : eni.id => eni }
    monitoring    = { for eni in data.aws_network_interface.monitoring : eni.id => eni }
    kms           = { for eni in data.aws_network_interface.kms : eni.id => eni }
    ecstelemetry  = { for eni in data.aws_network_interface.ecstelemetry : eni.id => eni }
    ecsagent      = { for eni in data.aws_network_interface.ecsagent : eni.id => eni }
    ecs           = { for eni in data.aws_network_interface.ecs : eni.id => eni }
    kinesis       = { for eni in data.aws_network_interface.kinesis : eni.id => eni }
  }

  vpc_endpoint_tags = {
    ecr           = aws_vpc_endpoint.ecr.tags
    ecrdkr        = aws_vpc_endpoint.ecrdkr.tags
    lambda        = aws_vpc_endpoint.lambda.tags
    logs          = aws_vpc_endpoint.logs.tags
    monitoring    = aws_vpc_endpoint.monitoring.tags
    kms           = aws_vpc_endpoint.kms.tags
    ecstelemetry  = aws_vpc_endpoint.ecstelemetry.tags
    ecsagent      = aws_vpc_endpoint.ecsagent.tags
    ecs           = aws_vpc_endpoint.ecs.tags
    kinesis       = aws_vpc_endpoint.kinesis.tags
  }
}

###############################################################################
# 3. Single aws_ec2_tag resource using dynamic for_each for all ENIs and tags
###############################################################################

resource "aws_ec2_tag" "vpc_endpoint_enis" {
  for_each = merge([
    for ep_name, enis in local.eni_maps : merge([
      for eni_id, eni in enis : {
        for tag_key, tag_value in local.vpc_endpoint_tags[ep_name] :
        "${ep_name}-${eni_id}-${tag_key}" => {
          resource_id = eni_id
          key         = tag_key
          value       = tag_value
        }
      }
    ]...)
  ]...)

  resource_id = each.value.resource_id
  key         = each.value.key
  value       = each.value.value
}