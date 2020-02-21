# Permissions for user_data reading parameterstore
data "aws_iam_policy_document" "assume_role_policy_ec2" {
  statement {
    actions = [
      "ssm:DescribeParameters",
      "ssm:GetParameter*",
      "ssm:List*"
    ]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_policy" "madoc_abilities" {
  name        = "${terraform.workspace}-${var.prefix}-madoc-abilities"
  description = "Policy for madoc EC2 user-data (read parametStore)"
  policy      = data.aws_iam_policy_document.assume_role_policy_ec2.json
}

resource "aws_iam_role" "madoc_bootstrap" {
  name               = "${terraform.workspace}-${var.prefix}-madoc"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy_ec2.json

  tags = local.common_tags
}

resource "aws_iam_instance_profile" "madoc" {
  name = "${terraform.workspace}-${var.prefix}-madoc"
  role = aws_iam_role.madoc_bootstrap.name
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

  security_groups = [
    aws_security_group.web.id

  ]
  subnet_id = aws_subnet.public.id

  user_data = templatefile("./files/bootstrap_ec2.tmpl", { prefix = var.prefix, workspace = terraform.workspace })

  iam_instance_profile = aws_iam_instance_profile.madoc.name

  # docker-compose file
  provisioner "file" {
    source      = "../../../../docker-compose.madoc.yml"
    destination = "/etc/docker/compose/madoc/docker-compose.yml"
  }

  # systemd unit for docker-compose
  provisioner "file" {
    source      = "./files/systemd.conf"
    destination = "/etc/systemd/system/docker-compose-madoc"
  }

  tags = local.common_tags
}

# EBS Instance
resource "aws_ebs_volume" "mysql_data" {
  availability_zone = var.availability_zone
  size              = var.ebs_size
  type              = "standard"

  tags = local.common_tags
}

resource "aws_volume_attachment" "mysql_ebs_att" {
  device_name = "/opt/mysql_data"
  volume_id   = aws_ebs_volume.mysql_data.id
  instance_id = aws_instance.madoc.id
}