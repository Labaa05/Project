import { db } from "../db/db.js";

export async function deleteProductById(id) {
  const res = new Promise((res) => {
    db.run(`DELETE FROM items WHERE id=$id;`, {
      $id: id,
    });

    db.run(`DELETE FROM cartItems WHERE itemId=$id;`, {
      $id: id,
    });

    res();
  });

  await res;
  return true;
}

export async function getAllProducts() {
  const res = new Promise((res) => {
    db.all("SELECT id, name, price, description FROM items", (_, result) => {
      res(result);
    });
  });

  const products = await res;
  return products;
}

export async function getImageBuffer(id) {
  const res = new Promise((res, rej) => {
    db.get(
      "SELECT image AS buffer, imageType AS type FROM items WHERE id=$id",
      { $id: id },
      (error, result) => {
        if (result) res(result);
        else rej(null);
      }
    );
  });

  try {
    const result = await res;
    return {
      buffer: result.buffer,
      type: result.type,
    };
  } catch (error) {
    return null;
  }
}

export async function addProduct(product) {
  const res = new Promise((res, rej) => {
    db.run(
      "INSERT INTO items(name, price, description, image, imageType) VALUES ($name, $price, $description, $image, $imageType)",
      {
        $name: product.name,
        $price: product.price,
        $description: product.description,
        $image: product.image.buffer,
        $imageType: product.image.mimetype,
      },
      function () {
        res(this.lastID);
      }
    );
  });

  const lastID = await res;

  return lastID;
}

export async function addProductToCart(userId, itemId) {
  const res = new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO cartItems (userId, itemId ) VALUES ($userId, $itemId);`,
      {
        $userId: userId,
        $itemId: itemId,
      },
      function () {
        resolve(this.lastID);
      }
    );
  });
  await res;
}

export async function getCartItems(userId) {
  const res = new Promise((res, rej) => {
    db.all(
      `SELECT * FROM cartItems WHERE userId = $userId;`,
      {
        $userId: userId,
      },
      (error, result) => {
        if (!error && result) res(result);
        else rej(null);
      }
    );
  });

  try {
    const cartItems = await res;
    return cartItems;
  } catch (error) {
    return null;
  }
}

export async function getProductById(id) {
  const res = new Promise((res, rej) => {
    db.get(
      "SELECT id,name,price,description FROM items WHERE id=$id;",
      {
        $id: id,
      },
      (error, result) => {
        if (!error && result) res(result);
        else rej(null);
      }
    );
  });
  try {
    const product = await res;
    return product;
  } catch (error) {
    return null;
  }
}

export async function editProduct(product) {
  const res = new Promise((res, rej) => {
    db.run(
      "UPDATE items SET name=$name, price=$price, description=$description WHERE id=$id;",
      {
        $id: product.id,
        $name: product.name,
        $price: product.price,
        $description: product.description,
      },
      function () {
        if (this.changes > 0) res();
        else rej();
      }
    );
  });

  try {
    const changes = await res;
    return changes;
  } catch (error) {
    return null;
  }
}

export async function removeItemFromCart(userid, cartItemId) {
  const res = new Promise((res, rej) => {
    db.run(
      "DELETE FROM cartItems WHERE userId=$userId AND id=$id;",
      {
        $userId: userid,
        $id: cartItemId,
      },
      function (error) {
        console.log(error);
        if (this.changes > 0) res();
        else rej();
      }
    );
  });

  try {
    await res;
    return true;
  } catch (error) {
    return null;
  }
}

export async function addItemToOrders(userId, itemId) {
  console.log("Adding item to orders: Userid, itemid ", userId, itemId);
  const res = new Promise((res, rej) => {
    db.run(
      `INSERT INTO orders (userId, itemId, purchaseDate) 
    VALUES ($userId, $itemId, $purchaseDate)
  `,
      {
        $userId: userId,
        $itemId: itemId,
        $purchaseDate: new Date().getDate(),
      },
      function () {
        console.log(this.changes);
        if (this.changes > 0) res();
        else rej();
      }
    );
  });

  try {
    await res;
    return true;
  } catch (error) {
    return null;
  }
}

export async function getCardItemById(userId, cartItemId) {
  const res = new Promise((res, rej) => {
    db.get(
      `SELECT * FROM cartItems WHERE userId=$userId AND id=$id;`,
      {
        $userId: userId,
        $id: cartItemId,
      },
      function (error, result) {
        if (result) res(result);
        else rej();
      }
    );
  });

  try {
    const item = await res;
    return item;
  } catch (error) {
    return null;
  }
}

export async function buyCartItem(userId, cartItemId) {
  const cardItem = await getCardItemById(userId, cartItemId);
  if (!cardItem) return null;

  const res = new Promise((res, rej) => {
    db.run(
      "DELETE FROM cartItems WHERE userId=$userId AND id=$id",
      {
        $id: cartItemId,
        $userId: userId,
      },
      function () {
        if (this.changes > 0) res();
        else rej();
      }
    );
  });
  try {
    const result = await res;
    const op = await addItemToOrders(userId, cardItem.itemId);
    if (op) return true;
    else return null;
  } catch (error) {
    return null;
  }
}

export async function getPurchaseHistory(userId) {
  const res = new Promise((res, rej) => {
    db.all(
      `SELECT * FROM orders WHERE userId=$userId;`,
      {
        $userId: userId,
      },
      (error, result) => {
        if (result) res(result);
        else rej();
      }
    );
  });

  return await res;
}
