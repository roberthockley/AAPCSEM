resource "aws_subnet" "aapcs_a" {
  vpc_id            = aws_vpc.aapcs.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "ap-southeast-1a"
  tags = {
    Name = "${var.project.tla}-${var.environment.name}-${var.subnets.name}-a"
    airid = "${var.environment.airid}" 
  }
}

resource "aws_subnet" "aapcs_b" {
  vpc_id            = aws_vpc.aapcs.id
  cidr_block        = "10.0.0.0/24"
  availability_zone = "ap-southeast-1b"
  tags = {
    Name = "${var.project.tla}-${var.environment.name}-${var.subnets.name}-b"
    airid = "${var.environment.airid}" 
  }
}
