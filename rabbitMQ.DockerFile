# FROM rabbitmq:3.8.1-management-alpine
FROM rabbitmq:3.7.15-management-alpine

ADD rabbitmq.conf /etc/rabbitmq/
ADD definitions.json /etc/rabbitmq/