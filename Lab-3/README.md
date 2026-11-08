# Lab 3: REST API – Query Parameters, Validation and Debugging

## Project Overview

This project implements a REST API for managing a library's book collection using Node.js, Express.js and SQLite.

The API supports retrieving, searching, sorting, filtering, adding, updating and deleting books.

## Technologies Used

- Node.js
- Express.js
- SQLite
- JavaScript
- npm
- Postman
- Git and GitHub
- Render (Deployment)

## Project Structure

```text
Lab-3/
├── .postman/
├── postman/
├── screenshots/
├── app.js
├── books.db
├── package.json
├── package-lock.json
└── README.md
```

## Installation and Execution

### 1. Install dependencies

```bash
npm install
```

### 2. Start the application

```bash
npm start
```

The local server runs on:

`http://localhost:3000`

## API Endpoints

Base URL:

`https://pageturn-library-api.onrender.com`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/books` | Retrieve all books |
| GET | `/books?search_q=Deep` | Search books by title |
| GET | `/books?order_by=price&order=ASC` | Sort books |
| GET | `/books?limit=5&offset=0` | Paginate book results |
| GET | `/books?min_price=100&max_price=500` | Filter by price |
| GET | `/books/:id` | Retrieve a book by ID |
| POST | `/books` | Add a new book |
| PUT | `/books/:id` | Update a book |
| DELETE | `/books/:id` | Delete a book |

## Features Implemented

- RESTful API design using Express.js.
- Query parameter handling.
- Partial title search using SQL LIKE.
- Sorting with ascending and descending order.
- Pagination using limit and offset.
- Minimum and maximum price filtering.
- Request body validation.
- Appropriate HTTP status codes.
- Consistent JSON error responses.
- SQLite database integration.
- Error handling and debugging.

## Testing with Postman

The API was tested using Postman.

The test cases cover:

- Retrieving all books.
- Searching and sorting books.
- Pagination and price filtering.
- Creating books with valid and invalid data.
- Retrieving books by ID.
- Updating existing books.
- Deleting books.
- Handling missing book IDs and invalid requests.

### Screenshots

The `screenshots/` folder contains 25 Postman screenshots demonstrating successful and unsuccessful test cases.

## Deployment

The REST API is deployed using Render.

**Live API URL:**

https://pageturn-library-api.onrender.com/books

**GitHub Repository:**

https://github.com/kvnaveen20114691-web/backend-development-fundamentals

## Conclusion

Successfully developed and deployed a REST API for managing library books using Node.js, Express.js and SQLite. Implemented query parameters, searching, sorting, pagination, price filtering, validation, CRUD operations and error handling. Tested the API using Postman and deployed it on Render.