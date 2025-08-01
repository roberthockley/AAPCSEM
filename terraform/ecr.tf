resource "aws_ecr_repository" "aapcs" {
  name                 = "${var.project.tla}-${var.environment.name}-${var.ecs.repository_name}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
  tags = {
    airid = "${var.environment.airid}"
  }
}