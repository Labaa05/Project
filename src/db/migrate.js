import { db } from "./db.js";

db.run(
  `CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT,
    image BLOB,
    imageType TEXT
);`
);
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL ,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    isadmin NUMERIC DEFAULT 0
);`
);
db.run(
  `CREATE TABLE IF NOT EXISTS session (
      id INTEGER PRIMARY KEY,
      userid INTEGER,
      token TEXT, 
      FOREIGN KEY (userid) REFERENCES users(id)
    );`
);
db.run(
  `CREATE TABLE IF NOT EXISTS cartItems (
    id INTEGER PRIMARY KEY,
    userId INTEGER,
    itemId INTEGER,
    FOREIGN KEY (userId) REFERENCES user(id),
    FOREIGN KEY (itemId) REFERENCES items(id)
  );`
);

db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    userId INTEGER,
    itemId INTEGER,
    purchaseDate INTEGER,
    FOREIGN KEY (userId) REFERENCES user(id)
    FOREIGN KEY (itemId) REFERENCES items(id)
  );`);

db.run(`CREATE TABLE IF NOT EXISTS userAddress (
    id INTEGER PRIMARY KEY,
    userId INTEGER,
    address TEXT,
    FOREIGN KEY (userId) REFERENCES user(id)
  );`);
db.close();
