# IAM
data "aws_iam_policy_document" "assume_role_policy_ec2" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "madoc" {
  name               = "${var.prefix}-${terraform.workspace}-madoc"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy_ec2.json
}

data "aws_iam_policy_document" "madoc_abilities" {
  statement {
    actions = [
      "ssm:DescribeParameters",
      "ssm:GetParameter*",
      "ssm:List*"
    ]

    resources = [
      "arn:aws:ssm:${var.region}:${local.account_id}:parameter/madoc/${var.prefix}/${terraform.workspace}*",
    ]
  }
}

resource "aws_iam_policy" "madoc_abilities" {
  name        = "${var.prefix}-${terraform.workspace}-madoc-abilities"
  description = "Policy for madoc EC2 user-data (read parameterStore)"
  policy      = data.aws_iam_policy_document.madoc_abilities.json
}

resource "aws_iam_role_policy_attachment" "basic_abilities" {
  role       = aws_iam_role.madoc.name
  policy_arn = aws_iam_policy.madoc_abilities.arn
}

resource "aws_iam_instance_profile" "madoc" {
  name = "${var.prefix}-${terraform.workspace}-madoc-instance"
  role = aws_iam_role.madoc.name
}

# keypair
data "template_file" "public_key" {
  template = file("./files/key.pub")
}

resource "aws_key_pair" "auth" {
  key_name   = "${var.prefix}-${terraform.workspace}"
  public_key = data.template_file.public_key.rendered
}

# EC2 Instance
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-bionic-18.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

resource "aws_instance" "madoc" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  vpc_security_group_ids = [
    aws_security_group.web.id,
    aws_security_group.ssh.id
  ]
  subnet_id = aws_subnet.public.id
  key_name  = aws_key_pair.auth.key_name

  root_block_device {
    volume_size = var.root_size
    volume_type = "gp2"
  }

  user_data = file("./files/bootstrap_ec2.sh")

  iam_instance_profile = aws_iam_instance_profile.madoc.name

  tags = merge(
    local.common_tags,
    map("Name", "${var.prefix}-${terraform.workspace}-madoc")
  )
}

resource "aws_eip" "madoc" {
  instance = aws_instance.madoc.id
  vpc      = true

  tags = merge(
    local.common_tags,
    map("Name", "${var.prefix}-${terraform.workspace}-madoc")
  )
}

# EBS Instances
resource "aws_ebs_volume" "madoc_data" {
  availability_zone = var.availability_zone
  size              = var.ebs_size
  type              = "gp2"

  tags = merge(
    local.common_tags,
    map("Name", "${var.prefix}-${terraform.workspace}-madoc-data")
  )
}

resource "aws_ebs_volume" "madoc_backup" {
  availability_zone = var.availability_zone
  size              = var.ebs_backup_size
  type              = "standard"

  tags = merge(
    local.common_tags,
    map("Snapshot", "true"),
    map("Name", "${var.prefix}-${terraform.workspace}-madoc-backup")
  )
}

resource "aws_volume_attachment" "madoc_data_att" {
  device_name  = "/dev/sdf"
  volume_id    = aws_ebs_volume.madoc_data.id
  instance_id  = aws_instance.madoc.id
  force_detach = true
}

resource "aws_volume_attachment" "madoc_backup_att" {
  device_name  = "/dev/sdg"
  volume_id    = aws_ebs_volume.madoc_backup.id
  instance_id  = aws_instance.madoc.id
  force_detach = true
}

# see https://github.com/terraform-providers/terraform-provider-aws/issues/1991
# resource "null_resource" "unmount_data_drive" {
#   triggers = {
#     public_ip = aws_eip.madoc.public_ip
#   }

#   depends_on = [aws_volume_attachment.madoc_data_att, aws_instance.madoc]

#   provisioner "remote-exec" {
#     when       = destroy
#     on_failure = continue
#     connection {
#       type        = "ssh"
#       agent       = false
#       host        = self.triggers.public_ip
#       user        = "ubuntu"
#       private_key = file(var.key_pair_private_key_path)
#     }
#     inline = [
#       "sudo systemctl stop madoc.service",
#       "sudo umount /opt/data",
#       "sudo sed -i '/opt\\/data/d' /etc/fstab"
#     ]
#   }
# }

# resource "null_resource" "unmount_backup_drive" {
#   triggers = {
#     public_ip = aws_eip.madoc.public_ip
#   }

#   depends_on = [aws_volume_attachment.madoc_backup_att, aws_instance.madoc]

#   provisioner "remote-exec" {
#     when       = destroy
#     on_failure = continue
#     connection {
#       type        = "ssh"
#       agent       = false
#       host        = self.triggers.public_ip
#       user        = "ubuntu"
#       private_key = file(var.key_pair_private_key_path)
#     }
#     inline = [
#       "sudo systemctl disable madoc-backup.timer",
#       "sudo systemctl disable madoc-db-backup-hourly.timer",
#       "sudo systemctl disable madoc-db-backup-daily.timer",
#       "sudo systemctl disable madoc-db-backup-weekly.timer",
#       "sudo systemctl disable madoc-db-backup-monthly.timer",
#       "sudo umount /mnt/backup",
#       "sudo sed -i '/mnt\\/backup/d' /etc/fstab"
#     ]
#   }
# }