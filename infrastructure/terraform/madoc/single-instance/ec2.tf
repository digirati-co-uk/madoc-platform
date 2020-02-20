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

resource "aws_ebs_volume" "mysql_data" {
  availability_zone = var.availability_zone
  size              = var.ebs_size
  type              = "standard"

  tags = local.common_tags
}

resource "aws_instance" "madoc" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  security_groups = [
    aws_security_group.web.id

  ]
  subnet_id = aws_subnet.public.id

  user_data = file("./files/bootstrap_ec2.sh")

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

resource "aws_volume_attachment" "mysql_ebs_att" {
  device_name = "/opt/mysql_data"
  volume_id   = aws_ebs_volume.mysql_data.id
  instance_id = aws_instance.madoc.id
}