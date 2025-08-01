resource "aws_iam_role" "ai_aapcs_execution_role" {
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
  description = "Allows ECS to call AWS services to get started such as ECR and Secrets."
  name        = "RoleForECSExecution"
  tags = {
    airid = "${var.environment.airid}"
  }
}

resource "aws_iam_policy" "ai_aapcs_execution_role_cloudwatch" {
  name        = "PolicyForCloudwatch"
  path        = "/"
  description = "Policy to allow Lambda to write to Cloudwatch on each invokation"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = [
          "${aws_cloudwatch_log_group.aapcs_logs.arn}",
          "${aws_cloudwatch_log_group.aapcs_logs.arn}:*"
        ]
      }
    ]
  })
  tags = {
    airid = "${var.environment.airid}" 
  }
}

resource "aws_iam_role_policy_attachment" "ai_aapcs_execution_role_ecs" {
  depends_on = []
  role       = aws_iam_role.ai_aapcs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "ai_aapcs_execution_role_cloudwatch" {
  depends_on = [aws_iam_policy.ai_aapcs_execution_role_cloudwatch]
  role       = aws_iam_role.ai_aapcs_execution_role.name
  policy_arn = aws_iam_policy.ai_aapcs_execution_role_cloudwatch.arn
}

resource "aws_iam_role" "ai_aapcs_task_role" {
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
  description = "Allows ECS Services to call AWS services on your behalf."
  name        = "RoleForECSApplications"
  tags = {
    airid = "${var.environment.airid}" 
  }
}

resource "aws_iam_role_policy_attachment" "ai_aapcs_task_role_cloudwatch" {
  depends_on = [aws_iam_policy.ai_aapcs_execution_role_cloudwatch]
  role       = aws_iam_role.ai_aapcs_task_role.name
  policy_arn = aws_iam_policy.ai_aapcs_execution_role_cloudwatch.arn
}

resource "aws_iam_policy" "ai_aapcs_task_role_dynamodb" {
  name        = "PolicyForDynamoDB"
  path        = "/"
  description = "Policy to allow aapcs to write to DynamoDB"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem"
        ]
        Resource = [
          "${aws_dynamodb_table.aaresults.arn}"
        ]
      }
    ]
  })
  tags = {
    airid = "${var.environment.airid}" 
  }
}

resource "aws_iam_role_policy_attachment" "ai_aapcs_task_role_dynamodb" {
  depends_on = [aws_iam_policy.ai_aapcs_task_role_dynamodb]
  role       = aws_iam_role.ai_aapcs_task_role.name
  policy_arn = aws_iam_policy.ai_aapcs_task_role_dynamodb.arn
}

resource "aws_iam_policy" "ai_aapcs_task_role_bedrock" {
  name        = "PolicyForBedrock"
  path        = "/"
  description = "Policy to allow aapcs to access Bedrock"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
          "bedrock:Retrieve",
          "bedrock:RetrieveAndGenerate",
          "bedrock:GetInferenceProfile"
        ]
        Resource = [
          "*"
        ]
      }
    ]
  })
  tags = {
    airid = "${var.environment.airid}" 
  }
}

resource "aws_iam_role_policy_attachment" "ai_aapcs_task_role_bedrock" {
  depends_on = [aws_iam_policy.ai_aapcs_task_role_bedrock]
  role       = aws_iam_role.ai_aapcs_task_role.name
  policy_arn = aws_iam_policy.ai_aapcs_task_role_bedrock.arn
}

resource "aws_iam_policy" "ai_aapcs_task_role_connect" {
  name        = "PolicyForConnect"
  path        = "/"
  description = "Policy to allow aapcs to access Connect"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "connect:ListRealtimeContactAnalysisSegments",
          "connect:UpdateContactAttributes"
        ]
        Resource = [
          "*"
        ]
      }
    ]
  })
  tags = {
    airid = "${var.environment.airid}" 
  }
}
