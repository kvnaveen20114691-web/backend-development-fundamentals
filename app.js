
const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "books.db");

let db;

async function initializeDBAndServer() {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    const result = await db.get("SELECT COUNT(*) AS count FROM book");

    if (result.count === 0) {
      await db.run(`
        INSERT INTO book (title, author, price, pages)
        VALUES
          ('Wings of Fire', 'A. P. J. Abdul Kalam', 250, 180),
          ('The Alchemist', 'Paulo Coelho', 300, 208),
          ('Atomic Habits', 'James Clear', 450, 320),
          ('Rich Dad Poor Dad', 'Robert Kiyosaki', 350, 336),
          ('Ikigai', 'Hector Garcia', 280, 194),
          ('Deep Work', 'Cal Newport', 400, 304),
          ('Think Like a Monk', 'Jay Shetty', 375, 352),
          ('The Psychology of Money', 'Morgan Housel', 325, 256),
          ('Zero to One', 'Peter Thiel', 420, 224),
          ('The Power of Habit', 'Charles Duhigg', 390, 371);
      `);
    }

    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
      console.log("SQLite database connected successfully");
    });
  } catch (error) {
    console.error("Initialization error:", error.message);
    process.exit(1);
  }
}


/* GET all books with search, sorting, pagination and price filtering */

app.get("/books/", async (request, response) => {
  try {
    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price,
      max_price
    } = request.query;

    // 1. Validate sorting column
    const allowedColumns = ["id", "title", "author", "price", "pages"];

    if (!allowedColumns.includes(order_by)) {
      return response.status(400).json({
        message: "Invalid order_by column"
      });
    }

    // 2. Validate sorting order
    const sortOrder = order.toUpperCase();

    if (!["ASC", "DESC"].includes(sortOrder)) {
      return response.status(400).json({
        message: "Order must be ASC or DESC"
      });
    }

    // 3. Validate limit and offset
    const pageLimit = Number(limit);
    const pageOffset = Number(offset);

    if (
      !Number.isInteger(pageLimit) ||
      pageLimit < 1 ||
      !Number.isInteger(pageOffset) ||
      pageOffset < 0
    ) {
      return response.status(400).json({
        message: "Invalid limit or offset"
      });
    }

    // 4. Validate price range
    let minPrice;
    let maxPrice;

    if (min_price !== undefined) {
      minPrice = Number(min_price);

      if (!Number.isFinite(minPrice) || minPrice < 0) {
        return response.status(400).json({
          message: "Invalid minimum price"
        });
      }
    }

    if (max_price !== undefined) {
      maxPrice = Number(max_price);

      if (!Number.isFinite(maxPrice) || maxPrice < 0) {
        return response.status(400).json({
          message: "Invalid maximum price"
        });
      }
    }

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      return response.status(400).json({
        message: "Minimum price cannot exceed maximum price"
      });
    }

    // 5. Build SQL query
    let sql = "SELECT * FROM book WHERE 1=1";
    const values = [];

    // Search books by partial title
    if (search_q.trim() !== "") {
      sql += " AND title LIKE ?";
      values.push(`%${search_q.trim()}%`);
    }

    // Minimum price filter
    if (minPrice !== undefined) {
      sql += " AND price >= ?";
      values.push(minPrice);
    }

    // Maximum price filter
    if (maxPrice !== undefined) {
      sql += " AND price <= ?";
      values.push(maxPrice);
    }

    // Sorting
    sql += ` ORDER BY ${order_by} ${sortOrder}`;

    // Pagination
    sql += " LIMIT ? OFFSET ?";
    values.push(pageLimit, pageOffset);

    // Execute query
    const books = await db.all(sql, values);

    response.status(200).json({
      message: "Books retrieved successfully",
      count: books.length,
      data: books
    });

  } catch (error) {
    console.error("GET books error:", error.message);

    response.status(500).json({
      message: "Failed to retrieve books"
    });
  }
});


/* GET a single book by ID */
app.get("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    const book = await db.get(
      "SELECT * FROM book WHERE id = ?",
      [bookId]
    );

    if (!book) {
      return response.status(404).json({  message: "Book not found"  });
    }

    response.status(200).json(book);
  } catch (error) {
    response.status(500).json({  message: "Failed to retrieve book"  });
  }
});

/* POST a new book */
app.post("/books/", async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    if (
      typeof title !== "string" || !title.trim() ||
      typeof author !== "string" || !author.trim() ||
      typeof price !== "number" || !Number.isInteger(price) || price < 0 ||
      !Number.isInteger(pages) || pages <= 0
    ) {
      return response.status(400).json({
        message: "Provide a title, author, non-negative integer price, and positive integer pages"
      });
    }

    const result = await db.run(
      `INSERT INTO book (title, author, price, pages)
       VALUES (?, ?, ?, ?)`,
      [title.trim(), author.trim(), price, pages]
    );

    return response.status(201).json({
      message: "Book added successfully",
      bookId: result.lastID
    });
  } catch (error) {
    console.error("POST books error:", error.message);
    return response.status(500).json({
      message: "Failed to add book"
    });
  }
});

/* PUT: update a book by ID */
app.put("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    if (
      typeof title !== "string" || !title.trim() ||
      typeof author !== "string" || !author.trim() ||
      !Number.isInteger(price) || price < 0 ||
      !Number.isInteger(pages) || pages <= 0
    ) {
      return response.status(400).json({
        error: "Provide a title, author, non-negative integer price, and positive integer pages"
      });
    }

    const result = await db.run(
      `UPDATE book
       SET title = ?, author = ?, price = ?, pages = ?
       WHERE id = ?`,
      [title.trim(), author.trim(), price, pages, bookId]
    );

    if (result.changes === 0) {
      return response.status(404).json({ message: "Book not found" });
    }

    response.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    return response.status(500).json({ message: "Failed to update book" });
  }
});

/* DELETE a book by ID */
app.delete("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    const result = await db.run(
      "DELETE FROM book WHERE id = ?",
      [bookId]
    );

    if (result.changes === 0) {
      return response.status(404).json({ message: "Book not found" });
    }

    response.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    return response.status(500).json({ message: "Failed to delete book" });
  }
});


initializeDBAndServer();
