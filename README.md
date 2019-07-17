# Restaurant Microservices
This was an academical project, with the objective to build a Restaurant Software using a microservices architecture.

The projetct has 6 microservices that comunicate with each other using a message broker (rabbitmq was the one chosen)

# Microservices
1. Order Write Management - Built with Node.js. Following the CQRS pattern, this project has the responsability receive the customer orders and to publish them to the broker so the work on other microservices can start.
2. Order Management - Built with Node.js. It has the responsability to manage the customer orders.
3. Customer Management - Built with Node.js. This project has the responsability to manage the customers.
4. Cuisine - Built with Node.js. This project has the responsability to manage the cuisine processes.
5. Stock Managament - Built with Node.js. This project has the responsability to manage the ingredients stock.
6. Delivery Manager - Built with python. This project has the responsability to manage the deliveries.

# Setup
1. Create a rabbitMq Instance and replace the ``AMQP_URL`` on all projects docker-compose files with the new amqp url
2. run ``docker-compose build && docker-compose run`` for each project
