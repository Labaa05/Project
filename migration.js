import sqlite3 from "sqlite3";
const db = new sqlite3.Database("./db.sqlite");
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
    quantity INTEGER NOT NULL,
    itemid INTEGER,
    sessionid INTEGER,
    FOREIGN KEY (itemid) REFERENCES items(id),
    FOREIGN KEY (sessionid) REFERENCES session(id)
  );`
);
// db.run(`ALTER TABLE users ADD COLUMN isadmin NUMERIC DEFAULT 0;`);
// db.run(`ALTER TABLE items ADD COLUMN image BLOB;`);
// db.run("ALTER TABLE items ADD COLUMN imageType TEXT;");
// db.run("ALTER TABLE items DROP COLUMN stock;");
db.close();
