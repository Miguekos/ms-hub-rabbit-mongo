# ms_hub_rabbitmq_mongo ¡gratis! API

### Dependencies
- Nodejs - Express
- mongodb
- Docker

### How it works
```sh
$ docker-compose up -d --build

```
### Demo
```sh
$ http://localhost:3346/datatest
$ http://localhost:3346
```



docker build -f rabbitMQ.DockerFile -t rabbitmqutils .
docker tag rabbitmqutils miguekos1233/rabbitmqutils:latest
docker push miguekos1233/rabbitmqutils:latest

docker build -f Dockerfile -t apputils .
docker tag apputils miguekos1233/apputils:1.0
docker push miguekos1233/apputils:1.0