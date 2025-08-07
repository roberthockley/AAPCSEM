resource "aws_default_security_group" "aapcs" {
  vpc_id = aws_vpc.aapcs.id
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-default"
    airid = "${var.environment.airid}"
  }
}

resource "null_resource" "clear_default_sg_rules" {
  provisioner "local-exec" {
    command = <<EOT
    SG_ID=${aws_default_security_group.aapcs.id}
    aws ec2 revoke-security-group-ingress --group-id $SG_ID --protocol all --port all --cidr 0.0.0.0/0
    aws ec2 revoke-security-group-egress --group-id $SG_ID --protocol all --port all --cidr 0.0.0.0/0
    EOT
  }

  depends_on = [aws_vpc.aapcs]
}


resource "aws_security_group" "aapcs" {
  name        = "${var.project.tla}-${var.environment.name}-${var.security_group.name1}"
  vpc_id      = aws_vpc.aapcs.id
  description = "Security group for AAPCS Fargate task"
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-${var.security_group.name1}"
    airid = "${var.environment.airid}"
  }
}


#resource "aws_vpc_security_group_egress_rule" "aapcs" {
#  security_group_id = aws_security_group.aapcs.id
#  description       = "Default Outbound"
#  cidr_ipv4         = "0.0.0.0/0"
#  from_port         = 0
#  ip_protocol       = "tcp"
#  to_port           = 0
#  tags = {
#    Name = "Load Balancer Health Check"
#    airid = "${var.environment.airid}"
#  }
#}

resource "aws_vpc_security_group_ingress_rule" "aapcs" {
  security_group_id            = aws_security_group.aapcs.id
  description                  = "Load Balancer Listener"
  referenced_security_group_id = aws_security_group.load_balancer.id
  from_port                    = var.ecs.port
  ip_protocol                  = "tcp"
  to_port                      = var.ecs.port
  tags = {
    Name  = "Load Balancer Health Check"
    airid = "${var.environment.airid}"
  }
}

resource "aws_vpc_security_group_egress_rule" "aapcs_vpc_endpoints" {
  security_group_id            = aws_security_group.aapcs.id
  description                  = "Default Outbound"
  referenced_security_group_id = aws_security_group.vpc_endpoints.id
  from_port                    = 443
  ip_protocol                  = "tcp"
  to_port                      = 443
  tags = {
    Name  = "VPC Endpoints"
    airid = "${var.environment.airid}"
  }
}

resource "aws_security_group" "load_balancer" {
  name        = "${var.project.tla}-${var.environment.name}-${var.security_group.name2}"
  vpc_id      = aws_vpc.aapcs.id
  description = "Security group for AAPCS load balancer"
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-${var.security_group.name2}"
    airid = "${var.environment.airid}"
  }
}

resource "aws_vpc_security_group_ingress_rule" "load_balancer" {
  security_group_id = aws_security_group.load_balancer.id
  description       = "Load Balancer Listener"
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = var.load_balancer.listener_port
  ip_protocol       = "tcp"
  to_port           = var.load_balancer.listener_port
  tags = {
    Name  = "Load Balancer Listener"
    airid = "${var.environment.airid}"
  }
}

resource "aws_vpc_security_group_egress_rule" "load_balancer" {
  security_group_id            = aws_security_group.load_balancer.id
  description                  = "Default Outbound"
  referenced_security_group_id = aws_security_group.aapcs.id
  from_port                    = var.ecs.port
  ip_protocol                  = "tcp"
  to_port                      = var.ecs.port
  tags = {
    Name  = "Load Balancer Health Check"
    airid = "${var.environment.airid}"
  }
}

resource "aws_vpc_security_group_egress_rule" "load_balancer_vpc_endpoints" {
  security_group_id            = aws_security_group.load_balancer.id
  description                  = "Default Outbound"
  referenced_security_group_id = aws_security_group.vpc_endpoints.id
  from_port                    = 443
  ip_protocol                  = "tcp"
  to_port                      = 443
  tags = {
    Name  = "VPC Endpoints"
    airid = "${var.environment.airid}"
  }
}

resource "aws_security_group" "vpc_endpoints" {
  name        = "${var.project.tla}-${var.environment.name}-${var.security_group.name3}"
  vpc_id      = aws_vpc.aapcs.id
  description = "Security group for VPC Endpoints"
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-${var.security_group.name3}"
    airid = "${var.environment.airid}"
  }
}

resource "aws_vpc_security_group_ingress_rule" "vpc_endpoints" {
  security_group_id = aws_security_group.vpc_endpoints.id
  description       = "Allow incoming access to endpoints"
  cidr_ipv4         = "10.0.0.0/16"
  from_port         = 443
  ip_protocol       = "tcp"
  to_port           = 443
  tags = {
    Name  = "VPC Endpoint Access"
    airid = "${var.environment.airid}"
  }
}
