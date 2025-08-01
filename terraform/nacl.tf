resource "aws_default_network_acl" "aapcs" {
  default_network_acl_id = aws_vpc.aapcs.default_network_acl_id
  tags = {
    Name = "${var.project.tla}-${var.environment.name}-${var.vpc.name}"
    airid = "${var.environment.airid}" 
  }
}

resource "aws_network_acl_rule" "aapcsi" {
  network_acl_id = aws_default_network_acl.aapcs.id
  rule_number    = 200
  egress         = false
  protocol       = "-1"
  rule_action    = "allow"
  cidr_block     = "0.0.0.0/0"
  from_port      = 0
  to_port        = 0
}

resource "aws_network_acl_rule" "aapcse" {
  network_acl_id = aws_default_network_acl.aapcs.id
  rule_number    = 200
  egress         = true
  protocol       = "-1"
  rule_action    = "allow"
  cidr_block     = "0.0.0.0/0"
  from_port      = 0
  to_port        = 0
}