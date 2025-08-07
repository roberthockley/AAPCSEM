resource "aws_lb" "aapcs" {
  name               = "${var.project.tla}-${var.environment.name}-${var.load_balancer.load_balancer_name}"
  internal           = false
  load_balancer_type = "application"
  idle_timeout = 3600
  subnets            = [aws_subnet.aapcs_public_a.id, aws_subnet.aapcs_public_b.id]
  security_groups    = [aws_security_group.load_balancer.id]
  tags = {
    airid = "${var.environment.airid}"
  }
}

resource "aws_lb_target_group" "aapcs_tg" {
  name        = "${var.project.tla}-${var.environment.name}-${var.load_balancer.target_group1_name}"
  port        = var.ecs.port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.aapcs.id
  target_type = "ip"

  health_check {
    path                = "/health-check"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
  tags = {
    airid = "${var.environment.airid}"
  }
}

resource "aws_lb_listener" "aapcs_listener" {
  load_balancer_arn = aws_lb.aapcs.arn
  port              = var.load_balancer.listener_port
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-Res-2021-06" # Enforce strong TLS policy
  certificate_arn   = var.acm.alb_cert_arn                    # Your ACM certificate ARN
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.aapcs_tg.arn
  }
  tags = {
    airid = "${var.environment.airid}"
  }
}
