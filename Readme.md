# Web Socket Server

Implements basic functionality of working with web-sockets

## Usage

1. Copy config.yaml.template to config.yaml
2. Add server port 
3. Configure config.yaml

The service listens ws-connections. For each incomming ws-connection Web-socket service creates Rabbit MQ queue and bind it to Rabit MQ exchange (with name from config) according to routingKey mask. This routingKey mask is been building from subscribing message which should be received from client throw ws-connection.

The format of allowed incomming message fromg client:
```
   {
     "type": "<type>",
     "method": "<method>",
     "resource": "<resource>",
     "resourceID": "<esourceID>",
     "context": "<context>",
     "contextID": "<contextID>"
   }
```
The parameter 'type' can be one of the next values: 'ping', 'subscribe', 'unsubscribe'

For type 'ping' only paramater 'wsConnectionID' are required
For types 'subscribe' and 'unsubscribe' next parameters are required: 'resource', 'resourceID', 'contextType', 'contextID'

The type 'ping' provides using the ping-pong protocol for checking are ws-connections alive. 
The processinc messages with type 'subscribe' on the web-socket server side creates the  RabbitMQ queue with unique string name whish is binded to RabbitMQ exchange (with name  from config.yaml) with routingKey:

```
    <method>.<resource>.<resourceID>.<context>.<contextID>
```

If some parameter is missed it replaced with '*'

The message with type 'unsubscribe' deletes bindings with routingKey from RabbitMQ queue for current ws-connection


## Development

```bash
$ yarn
$ yarn dev
```

## Deployment

```bash
$ yarn
$ yarn build
$ yarn start
$ connect to ws://localhost:<port>/
```
