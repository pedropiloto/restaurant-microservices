
import pika
import sys
import os
import threading
import json


def start():
    print("'Here")
    url = '%2f'
    params = pika.URLParameters(url)
    params.socket_timeout = 5

    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    env = os.environ.get('ENV') or 'development'
    print("ENV", env)

    channel.exchange_declare(
        exchange='restaurant.' + env, exchange_type='direct')

    result = channel.queue_declare(
        'delivery.management.piloto.' + env, exclusive=False)
    queue_name = result.method.queue

    print(queue_name)

    channel.queue_bind(
        exchange='restaurant.' + env, queue=queue_name, routing_key='order.ready')
    print(' [*] Waiting for logs. To exit press CTRL+C')

    def callback(ch, method, properties, body):
        print(" [x] %r:%r" % (method.routing_key, body))
        jsonBody = json.loads(body)
        jsonBody['event'] = 'order_delivered'
        channel.basic_publish(
            exchange='restaurant.' + env, routing_key='order.delivered', body=json.dumps(jsonBody))
        print(" [x] Sent %r:%r" % ('order.delivered', json.dumps(jsonBody)))

    channel.basic_consume(
        queue=queue_name, on_message_callback=callback, auto_ack=True)

    channel.start_consuming()
