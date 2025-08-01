resource "aws_dynamodb_table" "aaresults" {
  name         = var.dynamo.table_name1
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = var.dynamo.hash_key1
  range_key    = var.dynamo.sort_key1
  attribute {
    name = var.dynamo.hash_key1
    type = "S"
  }
attribute {
    name = var.dynamo.sort_key1
    type = "S"
  }
  tags = {
    Name        = "${var.dynamo.table_name1}"
    Environment = "${var.environment.name}"
    airid = "${var.environment.airid}"
  }
}
