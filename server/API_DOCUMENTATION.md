# ChatGPT Server API Documentation

## Overview

This is a comprehensive API documentation for the ChatGPT server application. The server is built with Node.js, Express.js, MongoDB, Socket.IO, and integrates with Google Gemini AI and Pinecone vector database for intelligent chat functionality.

## Base URL

- **Development**: `http://localhost:3000`
- **API Base**: `/api`

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT with HTTP-only cookies
- **AI Service**: Google Gemini AI (@google/genai)
- **Vector Database**: Pinecone
- **Real-time Communication**: Socket.IO
- **Password Hashing**: bcryptjs

## Environment Variables

```env
PORT=3000
JWT_SECRET=your-jwt-secret
MONGODB_URI=mongodb://localhost:27017/chatgpt
GEMINI_API_KEY=your-gemini-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=chat-gpt
NODE_ENV=development
```

## Authentication

The API uses JWT tokens for authentication, which can be provided in two ways:

1. **HTTP-only Cookie**: `token` (preferred method)
2. **Authorization Header**: `Bearer <token>`

Protected routes require authentication middleware that validates the JWT token.

---

## REST API Endpoints

### Health Check

#### GET `/api`

Check if the server is running.

**Response:**

```json
"Server is running"
```

---

### User Management

#### POST `/api/users/register`

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**

- `email`: Must be a valid email format
- `password`: Minimum 6 characters
- `name`: Required, cannot be empty

**Success Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

**Error Responses:**

- **400**: Validation errors
- **500**: User registration failed (e.g., email already exists)

#### POST `/api/users/login`

Authenticate a user and receive access token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**

- `email`: Must be a valid email format
- `password`: Required, cannot be empty

**Success Response (200):**

```json
{
  "message": "User logged in successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

**Error Responses:**

- **400**: Validation errors
- **401**: Invalid email or password
- **500**: User login failed

#### POST `/api/users/logout`

Logout the current user (clears authentication cookie).

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "message": "User logged out successfully"
}
```

**Error Responses:**

- **401**: Unauthorized (invalid/missing token)

#### GET `/api/users/profile`

Get the current user's profile information.

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
{
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- **401**: Unauthorized (invalid/missing token)

---

### Conversation Management

> **Note**: All conversation endpoints require authentication.

#### POST `/api/conversations`

Create a new conversation.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "title": "My New Conversation"
}
```

**Validation Rules:**

- `title`: Required, cannot be empty, max 100 characters

**Success Response (201):**

```json
{
  "_id": "conversation_id",
  "user": "user_id",
  "title": "My New Conversation",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses:**

- **400**: Validation errors
- **401**: Unauthorized
- **500**: Internal server error

#### GET `/api/conversations`

Get all conversations for the authenticated user.

**Headers:**

```
Authorization: Bearer <token>
```

**Success Response (200):**

```json
[
  {
    "_id": "conversation_id_1",
    "user": "user_id",
    "title": "First Conversation",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  {
    "_id": "conversation_id_2",
    "user": "user_id",
    "title": "Second Conversation",
    "createdAt": "2023-01-02T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  }
]
```

**Error Responses:**

- **401**: Unauthorized
- **500**: Internal server error

#### GET `/api/conversations/:id`

Get a specific conversation by ID.

**Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id`: Conversation ID

**Success Response (200):**

```json
{
  "_id": "conversation_id",
  "user": "user_id",
  "title": "My Conversation",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses:**

- **401**: Unauthorized
- **404**: Conversation not found
- **500**: Internal server error

#### GET `/api/conversations/:id/messages`

Get all messages in a specific conversation.

**Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id`: Conversation ID

**Success Response (200):**

```json
[
  {
    "_id": "message_id_1",
    "conversation": "conversation_id",
    "sender": "user",
    "content": "Hello, how are you?",
    "timestamp": "2023-01-01T00:00:00.000Z"
  },
  {
    "_id": "message_id_2",
    "conversation": "conversation_id",
    "sender": "model",
    "content": "I'm doing well, thank you! How can I help you today?",
    "timestamp": "2023-01-01T00:01:00.000Z"
  }
]
```

**Error Responses:**

- **401**: Unauthorized
- **500**: Internal server error

#### POST `/api/conversations/:id/messages`

Send a message to a specific conversation.

**Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `id`: Conversation ID

**Request Body:**

```json
{
  "sender": "user",
  "content": "Hello, how are you?"
}
```

**Validation Rules:**

- `sender`: Required, must be either "user" or "model"
- `content`: Required, cannot be empty

**Success Response (201):**

```json
{
  "_id": "message_id",
  "conversation": "conversation_id",
  "sender": "user",
  "content": "Hello, how are you?",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses:**

- **400**: Validation errors
- **401**: Unauthorized
- **500**: Internal server error

---

## WebSocket API (Socket.IO)

The server uses Socket.IO for real-time chat functionality with AI streaming responses.

### Connection

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: "your-jwt-token",
  },
});
```

### Authentication

WebSocket connections require JWT authentication via:

- `auth.token` in handshake
- `token` query parameter

### Events

#### Client to Server

##### `message`

Send a message to get AI response.

**Payload:**

```json
{
  "conversationId": "conversation_id",
  "prompt": "What is the weather like today?"
}
```

**Requirements:**

- `conversationId`: Required, must be a valid conversation ID owned by the user
- `prompt`: Required, cannot be empty

#### Server to Client

##### `message_saved`

Emitted when user message is successfully saved.

**Payload:**

```json
{
  "_id": "message_id",
  "conversation": "conversation_id",
  "sender": "user",
  "content": "What is the weather like today?",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

##### `stream_start`

Emitted when AI response streaming begins.

**Payload:**

```json
{
  "conversationId": "conversation_id"
}
```

##### `stream_chunk`

Emitted for each chunk of AI response during streaming.

**Payload:**

```json
{
  "chunk": "This is a part of the AI response...",
  "conversationId": "conversation_id",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

##### `stream_end`

Emitted when AI response streaming is complete.

**Payload:**

```json
{
  "conversationId": "conversation_id"
}
```

##### `response`

Emitted with the complete AI response after streaming ends.

**Payload:**

```json
{
  "text": "Complete AI response text...",
  "message": {
    "_id": "message_id",
    "conversation": "conversation_id",
    "sender": "model",
    "content": "Complete AI response text...",
    "timestamp": "2023-01-01T00:00:00.000Z"
  },
  "conversationId": "conversation_id"
}
```

##### `error`

Emitted when an error occurs.

**Payload:**

```json
"Error message describing what went wrong"
```

**Common Error Types:**

- Authentication errors
- Missing required fields
- Conversation ownership verification failures
- AI service errors (rate limits, service unavailable)
- Database errors

### Connection Events

##### `connect`

Emitted when client successfully connects.

##### `disconnect`

Emitted when client disconnects.

---

## Data Models

### User Model

```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "email": "String (required, unique, valid email)",
  "password": "String (required, hashed)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Conversation Model

```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User, required)",
  "title": "String (required, 1-100 chars)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Message Model

```json
{
  "_id": "ObjectId",
  "conversation": "ObjectId (ref: Conversation, required)",
  "sender": "String (enum: ['user', 'model'], required)",
  "content": "String (required)",
  "timestamp": "Date (default: now)"
}
```

---

## AI Integration

### Google Gemini AI

- **Model**: gemini-2.5-flash
- **Streaming**: Supported for real-time responses
- **Embeddings**: gemini-embedding-001 (768 dimensions)
- **System Instructions**: Dynamic based on long-term memory

### Pinecone Vector Database

- **Purpose**: Long-term memory storage and retrieval
- **Embeddings**: 768-dimensional vectors
- **Metadata**: Stores userId, conversationId, and text content
- **Queries**: Semantic similarity search with user-specific filtering

### Memory System

1. **Short-term Memory**: Recent conversation history from MongoDB
2. **Long-term Memory**: Semantic search results from Pinecone
3. **Automatic Embedding**: All messages are automatically embedded and stored

---

## Error Handling

### HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required/failed)
- **404**: Not Found
- **500**: Internal Server Error

### Error Response Format

```json
{
  "message": "Error description",
  "error": "Detailed error message (if applicable)",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### WebSocket Error Handling

- Authentication errors during handshake
- Runtime errors emitted via `error` event
- Automatic reconnection supported by Socket.IO client

---

## Security Features

### Authentication

- JWT tokens with 7-day expiration
- HTTP-only cookies for web clients
- Token verification middleware

### Password Security

- bcryptjs hashing with salt rounds (10)
- Password comparison method in User model

### CORS Configuration

```javascript
{
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}
```

### Environment-based Security

- Secure cookies in production
- SameSite protection
- Required environment variables validation

---

## Rate Limiting & Performance

### AI Service

- Handles rate limiting with appropriate error messages
- Streaming responses for better user experience
- Parallel processing of embeddings and message saving

### Database

- MongoDB connection with error handling
- Optimized queries for conversation history
- Indexed fields for better performance

---

## Development Setup

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and fill in the values.

3. **Start Development Server:**

   ```bash
   npm run dev
   ```

4. **Start Production Server:**
   ```bash
   npm start
   ```

---

## Testing Endpoints

### Using cURL

#### Register User

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

#### Login User

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}' \
  -c cookies.txt
```

#### Create Conversation

```bash
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Conversation"}'
```

### Using Socket.IO Client

```javascript
const socket = io("http://localhost:3000", {
  auth: { token: "your-jwt-token" },
});

socket.on("connect", () => {
  console.log("Connected to server");

  socket.emit("message", {
    conversationId: "conversation_id",
    prompt: "Hello, how are you?",
  });
});

socket.on("stream_chunk", (data) => {
  console.log("AI Response Chunk:", data.chunk);
});

socket.on("response", (data) => {
  console.log("Complete AI Response:", data.text);
});
```

---

## Deployment Notes

### Production Environment Variables

- Set `NODE_ENV=production`
- Use secure JWT_SECRET
- Configure production MongoDB URI
- Set up proper CORS origins
- Use HTTPS for secure cookies

### Dependencies

- Node.js 18+ recommended
- MongoDB 4.4+
- Active Google Gemini API key
- Active Pinecone account and API key

This documentation covers all the REST API endpoints, WebSocket events, data models, and integration details for the ChatGPT server application.
