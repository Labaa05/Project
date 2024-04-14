import { db }from './db.js';

db.run(
  `CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    stock INTEGER NOT NULL,
    description TEXT
);`
);
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);`
);
db.run(
  `CREATE TABLE IF NOT EXISTS session (
      id INTEGER PRIMARY KEY,
      userid INTEGER,
      uuid TEXT, 
      FOREIGN KEY (userid) REFERENCES users(id)
    );`
);
db.run(
  `CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY,
    completed NUMERIC DEFAULT 0,
    userId INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id)
  );`
);
db.run(
  `CREATE TABLE IF NOT EXISTS cartItems (
    id INTEGER PRIMARY KEY,
    cartId INTEGER,
    itemId INTEGER,
    quantity INTEGER,
    FOREIGN KEY (cartId) REFERENCES cart(id),
    FOREIGN KEY (itemId) REFERENCES items(id)
  );`
)
// db.run(`ALTER TABLE users ADD COLUMN isadmin NUMERIC DEFAULT 0;`);
// db.run(`ALTER TABLE items ADD COLUMN image BLOB;`);
// db.run("ALTER TABLE items ADD COLUMN imageType TEXT;");
// db.run("ALTER TABLE items DROP COLUMN stock;");
// db.run(`ALTER TABLE session RENAME COLUMN uuid TO token;`);
db.close();