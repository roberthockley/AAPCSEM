resource "aws_kinesis_stream" "contact_lens_kinesis" {
  name             = "${var.project.tla}-${var.environment.name}-${var.vpc.name}-connect-contact-lens"
  stream_mode_details {
    stream_mode = "ON_DEMAND"
  }
  encryption_type = "KMS"
  kms_key_id = "alias/aws/kinesis"
  tags = {
    airid = "${var.environment.airid}"
  }
}

resource "null_resource" "contact_lens_kinesis" {
  provisioner "local-exec" {
    command = <<EOT
    aws connect associate-instance-storage-config --region ${var.environment.region} --instance-id ${var.connect.instance_id} --resource-type REAL_TIME_CONTACT_ANALYSIS_VOICE_SEGMENTS --storage-config StorageType=KINESIS_STREAM,KinesisStreamConfig={StreamArn=${aws_kinesis_stream.contact_lens_kinesis.arn}}
    EOT
  }

  depends_on = [aws_vpc.aapcs]
}