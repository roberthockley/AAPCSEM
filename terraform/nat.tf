##### Create Nat Gateway

resource "aws_eip" "nat_a" {
  domain               = "vpc"
  network_border_group = "ap-southeast-1"
  #network_interface    = aws_network_interface.nat_a_ihs_preprdezpub_eni.id
  public_ipv4_pool = "amazon"
  tags = {
    Name = "${var.project.tla}-${var.environment.name}-${var.subnets.name}-nat-a"
    airid = "${var.environment.airid}" 
  }
}

resource "aws_eip" "nat_b" {
  domain               = "vpc"
  network_border_group = "ap-southeast-1"
  #network_interface    = aws_network_interface.nat_b_ihs_preprdezpub_eni.id
  public_ipv4_pool = "amazon"
  tags = {
    Name = "${var.project.tla}-${var.environment.name}-${var.subnets.name}-nat-b"
    airid = "${var.environment.airid}" 
  }
}

resource "aws_nat_gateway" "nat_a" {
  allocation_id     = aws_eip.nat_a.allocation_id
  connectivity_type = "public"
  #private_ip        = var.nat.a_ip
  subnet_id         = aws_subnet.aapcs_public_a.id
  tags = {
    Name = "${var.project.tla}-${var.environment.name}-${var.subnets.name}-nat-a"
    airid = "${var.environment.airid}" 
  }
}

resource "aws_nat_gateway" "nat_b" {
  allocation_id     = aws_eip.nat_b.allocation_id
  connectivity_type = "public"
  #private_ip        = var.nat.b_ip
  subnet_id         = aws_subnet.aapcs_public_b.id
  tags = {
    Name = "${var.project.tla}-${var.environment.name}-${var.subnets.name}-nat-b"
    airid = "${var.environment.airid}" 
  }
}

# Tag NAT Gateway A's ENI
resource "aws_ec2_tag" "nat_a_eni_tags" {
  resource_id = aws_nat_gateway.nat_a.network_interface_id

  key   = "Name"
  value = aws_nat_gateway.nat_a.tags["Name"]
}

resource "aws_ec2_tag" "nat_a_eni_airid" {
  resource_id = aws_nat_gateway.nat_a.network_interface_id

  key   = "airid"
  value = aws_nat_gateway.nat_a.tags["airid"]
}

# Tag NAT Gateway B's ENI
resource "aws_ec2_tag" "nat_b_eni_tags" {
  resource_id = aws_nat_gateway.nat_b.network_interface_id

  key   = "Name"
  value = aws_nat_gateway.nat_b.tags["Name"]
}

resource "aws_ec2_tag" "nat_b_eni_airid" {
  resource_id = aws_nat_gateway.nat_b.network_interface_id

  key   = "airid"
  value = aws_nat_gateway.nat_b.tags["airid"]
}
