resource "aws_cloudfront_distribution" "third_party_app" {
  depends_on = [aws_cloudfront_origin_access_control.third_party_app]
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.third_party_app.bucket_regional_domain_name
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    compress               = "true"
    smooth_streaming       = "false"
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = "0"
    default_ttl            = "0"
    max_ttl                = "0"
  }
  enabled         = "true"
  http_version    = "http2"
  is_ipv6_enabled = "true"
  origin {
    connection_attempts      = "3"
    connection_timeout       = "10"
    domain_name              = aws_s3_bucket.third_party_app.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.third_party_app.id
    origin_id                = aws_s3_bucket.third_party_app.bucket_regional_domain_name
  }
  price_class = "PriceClass_All"
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  retain_on_delete = "false"
  staging          = "false"
  viewer_certificate {
    acm_certificate_arn            = var.acm.cf_cert_arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021" # <--- Enforce strong TLS
    cloudfront_default_certificate = false
  }
  default_root_object = "index.html"
  tags = {
    Name  = "${var.cloudfront.name1}"
    airid = "${var.environment.airid}"
  }
  comment = var.cloudfront.name1

}

resource "aws_cloudfront_origin_access_control" "third_party_app" {
  name                              = "admin"
  description                       = "Admin Policy"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}
