resource "aws_security_group" "aapcs" {
  name        = "${var.project.tla}-${var.environment.name}-${var.security_group.name1}"
  vpc_id      = aws_vpc.aapcs.id
  description = "Security group for kvs-dg-integrator Fargate task"
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
  tags = {
    Name = "${var.project.tla}-${var.environment.name}-${var.security_group.name1}"
    airid = "${var.environment.airid}" 
  }
}

resource "aws_security_group_rule" "aapcs" {
  type                     = "ingress"
  from_port                = 3000
  to_port                  = 3000
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.load_balancer.id
  security_group_id        = aws_security_group.aapcs.id
  description              = "Allow HTTP from source security group"
}

resource "aws_security_group" "load_balancer" {
  name        = "${var.project.tla}-${var.environment.name}-${var.security_group.name2}"
  vpc_id      = aws_vpc.aapcs.id
  description = "Security group for AAPCS load balancer"
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
  tags = {
    Name = "${var.project.tla}-${var.environment.name}-${var.security_group.name2}"
    airid = "${var.environment.airid}" 
  }
}

