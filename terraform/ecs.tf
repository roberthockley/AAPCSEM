resource "aws_ecs_cluster" "ai_aapcs_cluster" {
  name = "${var.project.tla}-${var.environment.name}-${var.ecs.cluster_name}"
  setting {
    name  = "containerInsights"
    value = "disabled"
  }
}

resource "aws_ecs_task_definition" "ai_aapcs_task" {
  family                   = "${var.project.tla}-${var.environment.name}-${var.ecs.task_family_name}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ai_aapcs_execution_role.arn
  task_role_arn            = aws_iam_role.ai_aapcs_task_role.arn
  runtime_platform {
    operating_system_family = "LINUX"
  }
  tags = {
    airid = "${var.environment.airid}"
  }
  container_definitions = jsonencode([
    {
      name  = "${var.project.tla}-${var.environment.name}-${var.ecs.cluster_name}"
      image = "${var.environment.account_id}.dkr.ecr.${var.environment.region}.amazonaws.com/${aws_ecr_repository.aapcs.name}:latest"
      links = []
      portMappings = [{
        "name" : "websocket-container-3000-tcp",
        "containerPort" : 3000,
        "hostPort" : 3000,
        "protocol" : "tcp"
        }
      ]
      entryPoint            = []
      environmentFiles      = []
      command               = []
      environmentFiles      = []
      secrets               = []
      dnsServers            = []
      dnsSearchDomains      = []
      extraHosts            = []
      dockerSecurityOptions = []
      dockerLabels          = {}
      ulimits               = []
      systemControls        = []
      credentialSpecs       = []
      environment = [
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "${aws_cloudwatch_log_group.aapcs_logs.name}"
          awslogs-region        = "${var.environment.region}"
          awslogs-stream-prefix = "ecs"
        }
        secretOptions = []
      }
    }
  ])
}
 
 resource "aws_ecs_service" "ai_aapcs_ecs_service" {
   name            = "${var.project.tla}-${var.environment.name}-${var.ecs.cluster_name}"
   cluster         = aws_ecs_cluster.ai_aapcs_cluster.id
   task_definition = aws_ecs_task_definition.ai_aapcs_task.arn
   desired_count   = "1"
   launch_type     = "FARGATE"
 
   network_configuration {
     subnets          = [aws_subnet.aapcs_a.id, aws_subnet.aapcs_b.id]
     security_groups  = [aws_security_group.aapcs.id]
     assign_public_ip = false # Change to false for private subnets with NAT
   }
 
   load_balancer {
     target_group_arn = aws_lb_target_group.aapcs_tg.arn
     container_name   = "${var.project.tla}-${var.environment.name}-${var.ecs.cluster_name}"
     container_port   = 3000
   }
 tags = {
   airid = "${var.environment.airid}"
 }
   # Dependency enforcement
   depends_on = [aws_lb_listener.aapcs_listener]
 }