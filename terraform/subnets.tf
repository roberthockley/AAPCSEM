resource "aws_subnet" "aapcs_a" {
  vpc_id                                         = aws_vpc.aapcs.id
  assign_ipv6_address_on_creation                = "false"
  enable_dns64                                   = "false"
  enable_resource_name_dns_a_record_on_launch    = "false"
  enable_resource_name_dns_aaaa_record_on_launch = "false"
  ipv6_native                                    = "false"
  map_public_ip_on_launch                        = "false"
  private_dns_hostname_type_on_launch            = "ip-name"
  cidr_block                                     = "10.0.1.0/24"
  availability_zone                              = "ap-southeast-1a"
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-${var.subnets.name}-a"
    airid = "${var.environment.airid}"
  }
}

resource "aws_subnet" "aapcs_b" {
  vpc_id                                         = aws_vpc.aapcs.id
  assign_ipv6_address_on_creation                = "false"
  enable_dns64                                   = "false"
  enable_resource_name_dns_a_record_on_launch    = "false"
  enable_resource_name_dns_aaaa_record_on_launch = "false"
  ipv6_native                                    = "false"
  map_public_ip_on_launch                        = "false"
  private_dns_hostname_type_on_launch            = "ip-name"
  cidr_block                                     = "10.0.0.0/24"
  availability_zone                              = "ap-southeast-1b"
  tags = {
    Name  = "${var.project.tla}-${var.environment.name}-${var.subnets.name}-b"
    airid = "${var.environment.airid}"
  }
}

resource "aws_subnet" "aapcs_public_a" {
  vpc_id                  = aws_vpc.aapcs.id
  cidr_block              = "10.0.10.0/24"
  availability_zone       = "ap-southeast-1a"
  map_public_ip_on_launch = true
  tags = {
    Name = "${var.project.tla}-${var.environment.name}-public-a"
    airid = "${var.environment.airid}"
  }
}

resource "aws_subnet" "aapcs_public_b" {
  vpc_id                  = aws_vpc.aapcs.id
  cidr_block              = "10.0.20.0/24"
  availability_zone       = "ap-southeast-1b"
  map_public_ip_on_launch = true
  tags = {
    Name = "${var.project.tla}-${var.environment.name}-public-b"
    airid = "${var.environment.airid}"
  }
}