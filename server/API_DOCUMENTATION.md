# ChatGPT Server API Documentation

## Overview

This is the backend API for a ChatGPT-like application built with Node.js, Express, Socket.IO, and MongoDB. The API provides user authentication, conversation management, messaging capabilities, and real-time AI chat functionality.

**Base URL:** `http://localhost:3000` (or your deployed URL)

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Real-time Communication:** Socket.IO
- **AI Service:** Google Generative AI
- **Vector Database:** Pinecone
- **Authentication:** JWT with HTTP-only cookies

## Authentication

The API uses JWT tokens for authentication. Tokens are stored as HTTP-only cookies for security.

### Headers Required for Protected Routes

```
Cookie: token=<jwt_token>
```

---

## REST API Endpoints

### User Management

#### 1. Register User

**POST** `/api/user/register`

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

- `name`: Required, non-empty string
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters

**Success Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_string"
}
```

**Error Responses:**

- `400`: Validation errors
- `500`: Server error (e.g., email already exists)

#### 2. Login User

**POST** `/api/user/login`

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "message": "User logged in successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_string"
}
```

**Error Responses:**

- `400`: Validation errors
- `401`: Invalid email or password
- `500`: Server error

#### 3. Logout User

**POST** `/api/user/logout`

**Authentication:** Required

Logout user and clear authentication cookie.

**Success Response (200):**

```json
{
  "message": "User logged out successfully"
}
```

#### 4. Get User Profile

**GET** `/api/user/profile`

**Authentication:** Required

Get current user's profile information.

**Success Response (200):**

```json
{
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Conversation Management

#### 5. Create Conversation

**POST** `/api/conversation`

**Authentication:** Required

Create a new conversation.

**Request Body:**

```json
{
  "title": "My Chat Session"
}
```

**Success Response (201):**

```json
{
  "_id": "conversation_id",
  "user": "user_id",
  "title": "My Chat Session",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

#### 6. Get All Conversations

**GET** `/api/conversation`

**Authentication:** Required

Get all conversations for the authenticated user.

**Success Response (200):**

```json
[
  {
    "_id": "conversation_id_1",
    "user": "user_id",
    "title": "First Chat",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  {
    "_id": "conversation_id_2",
    "user": "user_id",
    "title": "Second Chat",
    "createdAt": "2025-01-01T01:00:00.000Z",
    "updatedAt": "2025-01-01T01:00:00.000Z"
  }
]
```

#### 7. Get Conversation by ID

**GET** `/api/conversation/:id`

**Authentication:** Required

Get a specific conversation by its ID.

**URL Parameters:**

- `id`: Conversation ID

**Success Response (200):**

```json
{
  "_id": "conversation_id",
  "user": "user_id",
  "title": "My Chat Session",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**

- `404`: Conversation not found

#### 8. Send Message

**POST** `/api/conversation/:id/messages`

**Authentication:** Required

Send a message to a conversation (mainly for manual message creation).

**URL Parameters:**

- `id`: Conversation ID

**Request Body:**

```json
{
  "sender": "user", // "user" or "model"
  "content": "Hello, how are you?"
}
```

**Success Response (201):**

```json
{
  "_id": "message_id",
  "conversation": "conversation_id",
  "sender": "user",
  "content": "Hello, how are you?",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

#### 9. Get Messages

**GET** `/api/conversation/:id/messages`

**Authentication:** Required

Get all messages for a specific conversation.

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
    "timestamp": "2025-01-01T00:00:00.000Z"
  },
  {
    "_id": "message_id_2",
    "conversation": "conversation_id",
    "sender": "model",
    "content": "Hello! I'm doing well, thank you for asking. How can I help you today?",
    "timestamp": "2025-01-01T00:00:01.000Z"
  }
]
```

---

## WebSocket API (Socket.IO)

### Connection

**Endpoint:** `ws://localhost:3000`

**Authentication:** Required via token in handshake

```javascript
const socket = io("http://localhost:3000", {
  auth: {
    token: "your_jwt_token",
  },
});
```

### Events

#### Client to Server Events

##### 1. message

Send a message and get AI response with real-time streaming.

**Payload:**

```json
{
  "conversationId": "conversation_id",
  "prompt": "Tell me a joke"
}
```

#### Server to Client Events

##### 1. message_saved

Emitted when user message is successfully saved.

**Payload:**

```json
{
  "_id": "message_id",
  "conversation": "conversation_id",
  "sender": "user",
  "content": "Tell me a joke",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

##### 2. stream_start

Emitted when AI starts generating response.

**Payload:**

```json
{
  "conversationId": "conversation_id"
}
```

##### 3. stream_chunk

Emitted for each chunk of AI response during streaming.

**Payload:**

```json
{
  "chunk": "Why don't scientists trust atoms?",
  "conversationId": "conversation_id",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

##### 4. stream_end

Emitted when AI finishes streaming response.

**Payload:**

```json
{
  "conversationId": "conversation_id"
}
```

##### 5. response

Emitted with complete AI response and saved message.

**Payload:**

```json
{
  "text": "Why don't scientists trust atoms? Because they make up everything!",
  "message": {
    "_id": "message_id",
    "conversation": "conversation_id",
    "sender": "model",
    "content": "Why don't scientists trust atoms? Because they make up everything!",
    "timestamp": "2025-01-01T00:00:01.000Z"
  },
  "conversationId": "conversation_id"
}
```

##### 6. error

Emitted when an error occurs.

**Payload:**

```json
"Error message string"
```

**Common Error Messages:**

- "Missing conversationId"
- "Missing prompt/content"
- "Access denied: [reason]"
- "Failed to save message"
- "AI service rate limit exceeded. Please try again later."
- "AI service is currently unavailable. Please try again later."

---

## Data Models

### User

```json
{
  "_id": "ObjectId",
  "name": "string (required)",
  "email": "string (required, unique, valid email)",
  "password": "string (required, hashed)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Conversation

```json
{
  "_id": "ObjectId",
  "user": "ObjectId (ref: User, required)",
  "title": "string (required, 1-100 characters)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Message

```json
{
  "_id": "ObjectId",
  "conversation": "ObjectId (ref: Conversation, required)",
  "sender": "string (enum: ['user', 'model'], required)",
  "content": "string (required)",
  "timestamp": "Date (default: Date.now)"
}
```

---

## Error Handling

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials)
- `403`: Forbidden (access denied)
- `404`: Not Found
- `500`: Internal Server Error

### Error Response Format

```json
{
  "message": "Error description",
  "error": "Detailed error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

---

## Environment Variables

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/chatgpt
JWT_SECRET=your_jwt_secret
GOOGLE_AI_API_KEY=your_google_ai_api_key
PINECONE_API_KEY=your_pinecone_api_key
```

---

## Features Implemented

### ✅ Current Features

- User registration and authentication
- JWT-based session management with HTTP-only cookies
- Conversation creation and management
- Real-time messaging with Socket.IO
- AI response generation with streaming
- Message history storage
- Vector embeddings for long-term memory
- Conversation ownership verification
- Input validation and error handling

### 🚀 Frontend Integration Examples

#### Authentication Flow

```javascript
// Register
const response = await fetch("/api/user/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // Important for cookies
  body: JSON.stringify({
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
  }),
});

// Login
const loginResponse = await fetch("/api/user/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  body: JSON.stringify({
    email: "john@example.com",
    password: "password123",
  }),
});
```

#### Socket Connection and Chat

```javascript
import io from "socket.io-client";

// Connect with JWT token
const socket = io("http://localhost:3000", {
  auth: {
    token: localStorage.getItem("token"), // or get from response
  },
});

// Handle connection events
socket.on("connect", () => {
  console.log("Connected to server");
});

// Send message
const sendMessage = (conversationId, prompt) => {
  socket.emit("message", {
    conversationId,
    prompt,
  });
};

// Handle streaming responses
socket.on("stream_start", (data) => {
  console.log("AI started responding for conversation:", data.conversationId);
});

socket.on("stream_chunk", (data) => {
  // Append chunk to UI
  appendToChat(data.chunk);
});

socket.on("stream_end", (data) => {
  console.log("AI finished responding");
});

socket.on("response", (data) => {
  console.log("Complete response:", data.text);
  // Save message ID, update UI, etc.
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});
```

---

## Rate Limiting & Best Practices

### Recommendations for Frontend

1. **Connection Management**: Maintain single socket connection per user session
2. **Error Handling**: Implement reconnection logic for socket disconnections
3. **Loading States**: Show loading indicators during stream_start and stream_end
4. **Message Queuing**: Queue messages if socket is disconnected
5. **Token Management**: Store JWT securely and handle token expiration
6. **Real-time UI**: Update chat interface progressively with stream_chunk events

### Security Considerations

1. Tokens are HTTP-only cookies (XSS protection)
2. Conversation ownership verification
3. Input validation on all endpoints
4. Rate limiting recommended for production
5. CORS configuration for allowed origins
