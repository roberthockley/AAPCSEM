resource "aws_internet_gateway" "aapcs" {
  vpc_id = aws_vpc.aapcs.id
  tags = {
    Name = "${var.project.tla}-${var.environment.name}-${var.vpc.name}-igw"
    airid = "${var.environment.airid}"
  }
}
