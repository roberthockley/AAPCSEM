##### Create Nat Gateway

resource "aws_eip" "nat_a" {
  domain               = "vpc"
  network_border_group = "ap-southeast-1"
  #network_interface    = aws_network_interface.nat_a_ihs_preprdezpub_eni.id
  public_ipv4_pool = "amazon"
}

resource "aws_eip" "nat_b" {
  domain               = "vpc"
  network_border_group = "ap-southeast-1"
  #network_interface    = aws_network_interface.nat_b_ihs_preprdezpub_eni.id
  public_ipv4_pool = "amazon"
}

resource "aws_nat_gateway" "nat_a" {
  allocation_id     = aws_eip.nat_a.allocation_id
  connectivity_type = "public"
  #private_ip        = var.nat.a_ip
  subnet_id         = aws_subnet.aapcs_public_a.id
  tags = {
    Name = "${var.project.tla}-${var.environment.name}-${var.subnets.name}-a"
    airid = "${var.environment.airid}" 
  }
}

resource "aws_nat_gateway" "nat_b" {
  allocation_id     = aws_eip.nat_b.allocation_id
  connectivity_type = "public"
  #private_ip        = var.nat.b_ip
  subnet_id         = aws_subnet.aapcs_public_b.id
  tags = {
    Name = "${var.project.tla}-${var.environment.name}-${var.subnets.name}-b"
    airid = "${var.environment.airid}" 
  }
}
