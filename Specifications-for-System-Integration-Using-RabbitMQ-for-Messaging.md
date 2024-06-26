### Specifications for System Integration Using RabbitMQ for Messaging

### 1. General Definitions

#### Tool
- Communication between services using semi-structured JSON messages.
- Need for persistence and fault tolerance in interactions between systems, including a basic retry mechanism.

#### Configurations
- Unique connections and channels per process.
- Use of manual acknowledgment at the end of each message processing.

### 2. Messaging Mechanisms

#### Message Types

1. **Event Message**: Published after a relevant action has been successfully completed. Example: Registering a new retailer.
   - **Routing Key**: `evt.<event type>.<domain>.<source>`
   - **JSON Format**:
     ```json
     {
       "evtID": "uuid",
       "data": {
         "key": "value"
       },
       "pageData": {
         "pageIndex": 4,
         "limitOfElementsOnThePage": 20,
         "totalElementsInActualPage": 18,
         "totalPages": 5,
         "totalElementsInAllPages": 98
       },
       "content": [
         {
           "key": "value"
         }
       ]
     }
     ```

2. **Command Message**: Published to request an action from another system. Example: Requesting stock update.
   - **Routing Key**: `cmd.<command type>.<domain>.<source>`
   - **JSON Format**:
     ```json
     {
       "cmdID": "uuid",
       "data": {
         "key": "value"
       }
     }
     ```

3. **RPC Message**: Used for requesting information or actions with an expected result. Example: Stock inquiry.
   - **Routing Key**: `rpc.<command type>.<domain>.<source>`
   - **JSON Format (Request)**:
     ```json
     {
       "rpcID": "uuid",
       "filterParams": {
         "cnpj": "70.157.137/0001-02"
       },
       "pageParams": {
         "pageIndex": 2,
         "limitOfElementsOnThePage": 20
       },
       "data": {
         "key": "value"
       }
     }
     ```
   - **JSON Format (Response)**:
     ```json
     {
       "rpcID": "uuid",
       "data": {
         "key": "value"
       },
       "pageData": {
         "pageIndex": 4,
         "limitOfElementsOnThePage": 20,
         "totalElementsInActualPage": 18,
         "totalPages": 5,
         "totalElementsInAllPages": 98
       },
       "content": [
         {
           "key": "value"
         }
       ]
     }
     ```

### 3. Integration Flows

#### Example: Purchase Suggestion Configuration
1. **Seller** emits an event after configuring the purchase suggestion:
   - **Routing Key**: `evt.updated.configuracaosugestaocompra.seller`
   - **Exchange**: `default-topics`
   - **Queue**: `supply/evt.updated.configuracaosugestaocompra.*`
   - **JSON Message**:
     ```json
     {
       "evtID": "uuid",
       "data": {
         "key": "value"
       }
     }
     ```

2. **Supply** receives the event and processes the suggestion:
   - **Exchange**: `default-topics`
   - **Queue**: `supply/evt.updated.configuracaosugestaocompra.*`
   - **Confirmation**: `Ack/Nack`

#### Example: Stock Inquiry via RPC
1. **Seller** sends a stock inquiry request:
   - **Routing Key**: `rpc.list.stock.seller`
   - **Exchange**: `default-topics`
   - **Reply Queue**: Anonymous queue created by the Seller
   - **JSON Message (Request)**:
     ```json
     {
       "rpcID": "uuid",
       "filterParams": {
         "cnpj": "70.157.137/0001-02"
       },
       "pageParams": {
         "pageIndex": 2,
         "limitOfElementsOnThePage": 20
       },
       "data": {
         "key": "value"
       }
     }
     ```

2. **Supply** processes the request and responds:
   - **Exchange**: `default-topics`
   - **Reply Queue**: Specified in the `Reply To` field
   - **JSON Message (Response)**:
     ```json
     {
       "rpcID": "uuid",
       "data": {
         "key": "value"
       },
       "pageData": {
         "pageIndex": 4,
         "limitOfElementsOnThePage": 20,
         "totalElementsInActualPage": 18,
         "totalPages": 5,
         "totalElementsInAllPages": 98
       },
       "content": [
         {
           "key": "value"
         }
       ]
     }
     ```

### 4. Acknowledgment & Retry Mechanism
- **Ack**: Confirms the successful processing of a message, removing it from the queue.
- **Nack**: Rejects the message, returning it to the queue for retry.
