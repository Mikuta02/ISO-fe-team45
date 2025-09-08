# Rabbit Care Publisher (Python)

Minimalni publisher za demonstraciju 3.18. Salje JSON poruke preko RabbitMQ **direct** exchange-a `rabbitCareExchange` sa routing key-em `rabbit.care.location`.

## Pokretanje

0) Pokrenuti RabbitMQ (localhost:5672)
1) U korenu Spring backenda (gde je `publisher-python/`), pokreni:

```bash
cd publisher-python
python3 -m venv .venv
. .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
