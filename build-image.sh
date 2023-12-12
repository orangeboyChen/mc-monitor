docker buildx build -t registry.cn-shenzhen.aliyuncs.com/orangeboy/nowcent-mc-monitor:latest --platform=linux/amd64 . --push
docker rmi -f registry.cn-shenzhen.aliyuncs.com/orangeboy/nowcent-mc-monitor:latest
