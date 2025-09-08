#!/usr/bin/env python3
import json
import os
import sys
import pika
from typing import Dict, Any

# Config preko env var-ova ili default vrednosti:
RABBIT_HOST     = os.environ.get("RABBIT_HOST", "localhost")
RABBIT_PORT     = int(os.environ.get("RABBIT_PORT", "5672"))
RABBIT_USER     = os.environ.get("RABBIT_USER", "guest")
RABBIT_PASS     = os.environ.get("RABBIT_PASS", "guest")
EXCHANGE_NAME   = os.environ.get("EXCHANGE_NAME", "rabbitCareExchange")
ROUTING_KEY     = os.environ.get("ROUTING_KEY", "rabbit.care.location")

def publish(msg: Dict[str, Any]) -> None:
    credentials = pika.PlainCredentials(RABBIT_USER, RABBIT_PASS)
    params = pika.ConnectionParameters(
        host=RABBIT_HOST,
        port=RABBIT_PORT,
        credentials=credentials,
        heartbeat=30
    )
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    # Direct exchange – ne deklarisemo queue, samo exchange po imenu
    channel.exchange_declare(exchange=EXCHANGE_NAME, exchange_type="direct", durable=True)

    payload = json.dumps(msg).encode("utf-8")
    props = pika.BasicProperties(
        content_type="application/json",
        delivery_mode=2  # persistent
    )
    channel.basic_publish(
        exchange=EXCHANGE_NAME,
        routing_key=ROUTING_KEY,
        body=payload,
        properties=props
    )
    print(f"[OK] Sent: {msg}")
    connection.close()

def demo_batch():
    msgs = [
        {"id":"vet-1","name":"Vet Clinic Novi Beograd","latitude":44.815,"longitude":20.407},
        {"id":"shelter-1","name":"Bunny Shelter Dorćol","latitude":44.826,"longitude":20.463},
        {"id":"vet-2","name":"Vet Clinic Zemun","latitude":44.846,"longitude":20.410},
    ]
    for m in msgs:
        publish(m)

if __name__ == "__main__":
    # CLI: ako prosledis JSON kao argument, salje to; inace salje demo batch
    if len(sys.argv) > 1:
        try:
            data = json.loads(sys.argv[1])
            publish(data)
        except Exception as e:
            print(f"Invalid JSON argument: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        demo_batch()
