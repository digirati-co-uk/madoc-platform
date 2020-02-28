# IAM
data "aws_iam_policy_document" "assume_role_policy_dlm" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type        = "Service"
      identifiers = ["dlm.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "dlm_lifecycle_role" {
  name               = "${var.prefix}-${terraform.workspace}-dlm-lifecycle-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy_dlm.json
}

data "aws_iam_policy_document" "dlm_backup_abilities" {
  statement {
    actions = [
      "ec2:CreateSnapshot",
      "ec2:DeleteSnapshot",
      "ec2:DescribeVolumes",
      "ec2:DescribeSnapshots",
    ]
    resources = ["*"]
  }

  statement {
    actions = [
      "ec2:CreateTags"
    ]

    resources = ["arn:aws:ec2:*::snapshot/*"]
  }
}

resource "aws_iam_role_policy" "dlm_lifecycle" {
  name   = "${var.prefix}-${terraform.workspace}-dlm-lifecycle-policy"
  role   = aws_iam_role.dlm_lifecycle_role.id
  policy = data.aws_iam_policy_document.dlm_backup_abilities.json
}

# DLM Policy
resource "aws_dlm_lifecycle_policy" "ebs_backup_policy" {
  description        = "Backing up Madoc EBS volume ${var.prefix}-${terraform.workspace}"
  execution_role_arn = aws_iam_role.dlm_lifecycle_role.arn
  state              = "ENABLED"

  policy_details {
    resource_types = ["VOLUME"]

    schedule {
      name = "Madoc backup EBS schedule"

      create_rule {
        interval      = var.ebs_backup_interval
        interval_unit = "HOURS"
        times         = [var.ebs_backup_times]
      }

      retain_rule {
        count = var.ebs_backup_retain_count
      }

      tags_to_add = {
        snapshotCreator = "DLM"
      }

      copy_tags = true
    }

    target_tags = {
      Snapshot = "true"
    }
  }

  tags = local.common_tags
}