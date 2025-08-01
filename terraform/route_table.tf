resource "aws_route_table" "aapcs" {
  vpc_id = aws_vpc.aapcs.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.aapcs.id
  }
  tags = {
    Name = "aapcs"
    airid = "${var.environment.airid}" 
  }
}

resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.aapcs_a.id
  route_table_id = aws_route_table.aapcs.id
}

resource "aws_route_table_association" "b" {
  subnet_id      = aws_subnet.aapcs_b.id
  route_table_id = aws_route_table.aapcs.id
}