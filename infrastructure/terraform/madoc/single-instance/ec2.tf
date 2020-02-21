# IAM
resource "aws_iam_role" "madoc" {
  name = "${terraform.workspace}-${var.prefix}-madoc"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
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
  name        = "${terraform.workspace}-${var.prefix}-madoc-abilities"
  description = "Policy for madoc EC2 user-data (read parameterStore)"
  policy      = data.aws_iam_policy_document.madoc_abilities.json
}

resource "aws_iam_role_policy_attachment" "basic_abilities" {
  role       = aws_iam_role.madoc.name
  policy_arn = aws_iam_policy.madoc_abilities.arn
}

resource "aws_iam_instance_profile" "madoc" {
  name = "${terraform.workspace}-${var.prefix}-madoc-instance"
  role = aws_iam_role.madoc.name
}

# keypair
data "template_file" "public_key" {
  template = file("./files/key.pub")
}

resource "aws_key_pair" "auth" {
  key_name   = "${terraform.workspace}-${var.prefix}"
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

  security_groups = [
    aws_security_group.web.id,
    aws_security_group.ssh.id

  ]
  subnet_id = aws_subnet.public.id
  key_name  = aws_key_pair.auth.key_name

  user_data = templatefile("./files/bootstrap_ec2.tmpl", { prefix = var.prefix, workspace = terraform.workspace })

  iam_instance_profile = aws_iam_instance_profile.madoc.name

  # docker-compose file
  provisioner "file" {
    source      = "../../../../docker-compose.madoc.yml"
    destination = "/tmp/docker-compose.yml"
  }

  # systemd unit for docker-compose
  provisioner "file" {
    source      = "./files/systemd.conf"
    destination = "/tmp/docker-compose-madoc"
  }

  connection {
    private_key = file(var.key_pair_private_key_path)
    user        = "ubuntu"
    host        = self.public_ip
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
  #device_name = "/opt/mysql_data"
  device_name = "/dev/data"
  volume_id   = aws_ebs_volume.mysql_data.id
  instance_id = aws_instance.madoc.id
}