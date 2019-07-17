
import pika
import sys


url = 'amqp://root:p0p0p0p0@134.209.28.165:5672/%2f'
params = pika.URLParameters(url)
params.socket_timeout = 5

connection = pika.BlockingConnection(params)
channel = connection.channel()

channel.exchange_declare(
    exchange='restaurant.development', exchange_type='direct')

channel.basic_publish(
    exchange='restaurant.development', routing_key='order.ready', body="order ready")
print(" [x] Sent %r:%r" % ('order.ready', "order_ready"))
connection.close()
