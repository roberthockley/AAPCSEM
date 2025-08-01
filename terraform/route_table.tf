resource "aws_route_table" "aapcs_a" {
  vpc_id = aws_vpc.aapcs.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_a.id
  }
  tags = {
    Name = "aapcs-a"
    airid = "${var.environment.airid}" 
  }
}

resource "aws_route_table_association" "a" {
  subnet_id      = aws_subnet.aapcs_a.id
  route_table_id = aws_route_table.aapcs_a.id
}

resource "aws_route_table" "aapcs_b" {
  vpc_id = aws_vpc.aapcs.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_b.id
  }
  tags = {
    Name = "aapcs-b"
    airid = "${var.environment.airid}" 
  }
}

resource "aws_route_table_association" "b" {
  subnet_id      = aws_subnet.aapcs_b.id
  route_table_id = aws_route_table.aapcs_b.id
}