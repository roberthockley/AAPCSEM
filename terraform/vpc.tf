resource "aws_vpc" "aapcs" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "${var.project.tla}-${var.environment.name}-${var.vpc.name}"
    airid = "${var.environment.airid}" 
  }
}