import { db } from "../db/db.js";

/**
 * Delete a product from the database
 * !!! Assume the product exists already !!!
 *
 * @param {number} id - The id of the product to delete
 */
export async function deleteProductById(id) {
  const res = new Promise((res) => {
    //  Delete the product from the database
    db.run(`DELETE FROM items WHERE id=$id;`, {
      $id: id,
    });

    // Delete any cart items that have the product reference
    db.run(`DELETE FROM cartItems WHERE itemId=$id;`, {
      $id: id,
    });

    res();
  });

  await res;
  return true;
}

/**
 * Get all products from the database
 *
 * @param {Product}
 * @param {string} Product.id - The id of the product
 * @param {string} Product.name - The name of the product
 * @param {number} Product.price - The price of the product
 * @param {string} Product.description - The description of the product
 * @returns {Promise<Array<Product>>} A promise that resolves with an array of products
 */
export async function getAllProducts() {
  // Make callback into a promise
  const res = new Promise((res) => {
    // Get all items from the database
    db.all("SELECT id, name, price, description FROM items", (_, result) => {
      // Return the result
      res(result);
    });
  });

  // Wait for the promise to resolve
  const products = await res;
  return products;
}

/**
 * Get an image for a product from the database
 *
 * @param {string} id - The id of the product of which to get the image of
 *
 * @returns {Promise<{buffer:Buffer, type:string}>} A promise that resolves with the image buffer
 */
export async function getImageBuffer(id) {
  // Make callback into a promise
  const res = new Promise((res, rej) => {
    // Get the image from the database
    db.get(
      "SELECT image AS buffer, imageType AS type FROM items WHERE id=$id",
      { $id: id },
      (error, result) => {
        // If there is an error, reject the promise
        if (result) res(result);
        else rej(null);
      }
    );
  });

  try {
    // Wait for the promise to resolve
    const result = await res;
    return {
      buffer: result.buffer,
      type: result.type,
    };
  } catch (error) {
    // If there is an error, return null
    return null;
  }
}

/**
 * Create a new product in the database
 *
 * @param {Product} product - The product to create
 * @param {string} product.name - The name of the product
 * @param {number} product.price - The price of the product
 * @param {string} product.description - The description of the product
 * @param {Buffer} product.image - The image of the product
 * @param {string} product.image.mimetype - The mimetype of the image
 *
 * @returns {Promise<number>} A promise that resolves with a boolean indicating success
 */
export async function addProduct(product) {
  // Make callback into a promise

  const res = new Promise((res, rej) => {
    // Insert the product into the database
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
        // If the product was inserted, resolve the promise with the id of the product
        res(this.lastID);
      }
    );
  });

  // Wait for the promise to resolve
  const lastID = await res;

  // Return the id of the product
  return lastID;
}

/// ----------------- Cart functions -----------------
///
///
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

/**
 * @param {number} id - The id of the product to get
 *
 * @param {Product} product - The product to create
 * @param {string} product.name - The name of the product
 * @param {number} product.price - The price of the product
 * @param {string} product.description - The description of the product
 *
 * @returns {Promise<Product | null>} A promise that resolves with a boolean indicating success
 */
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

/**
 * Edit a product in the database
 * !!! Assume the product exists already !!!
 *
 * @param {Product} product - The product to edit
 * @param {string} product.name - The name of the product
 * @param {number} product.price - The price of the product
 * @param {string} product.description - The description of the product
 *
 * @returns {Promise<Product | null>} A promise that resolves with a boolean indicating success
 */
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
