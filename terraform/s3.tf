resource "aws_s3_bucket" "third_party_app" {
  bucket              = "s3-${var.project.tla}-${var.environment.name}-${var.s3.bucket_name1}"
  force_destroy       = "false"
  object_lock_enabled = "true"
  tags = {
    Name = "s3-${var.project.tla}-${var.environment.name}-admin"
    airid = "${var.environment.airid}" 
  }
}

resource "aws_s3_bucket_policy" "third_party_app" {
  bucket = aws_s3_bucket.third_party_app.id
  policy = jsonencode({
    "Id": "PolicyForCloudFrontPrivateContent",
    "Statement": [
      {
        "Action": "s3:GetObject",
        "Condition": {
          "StringEquals": {
            "AWS:SourceArn": "${aws_cloudfront_distribution.third_party_app.arn}"
          }
        },
        "Effect": "Allow",
        "Principal": {
          "Service": "cloudfront.amazonaws.com"
        },
        "Resource": "${aws_s3_bucket.third_party_app.arn}/*",
        "Sid": "AllowCloudFrontServicePrincipal"
      },
      {
        "Sid" : "AllowSSLRequestsOnly",
        "Effect" : "Deny",
        "Principal" : "*",
        "Action" : "s3:*",
        "Resource" : "${aws_s3_bucket.third_party_app.arn}/*",
        "Condition" : {
          "Bool" : {
            "aws:SecureTransport" : "false"
          }
        }
      }
    ],
    "Version": "2008-10-17"
  })
}