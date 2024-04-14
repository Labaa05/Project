import { db } from "../db/db.js";

export async function deleteProductById(id) {
  const res = new Promise((res, rej) => {
    db.run(
      "DELETE FROM items WHERE id=$id;",
      {
        $id: id,
      },
      function () {
        console.log(this);
        if (this.changes > 0) res();
        else rej();
      }
    );
  });
  try {
    await res;
    return true;
  } catch (error) {
    return false;
  }
}

// New functions
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

// export async function addItemToCart(userId, itemId) {
//   const res = new Promise((resolve, reject) => {
//     db.run(
//       `INSERT INTO cart (quantity, itemid, sessionid) VALUES (1, $itemId, $userId)`,
//       {
//         $itemId: itemId,
//         $userId: userId,
//       },
//       (error) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve();
//         }
//       }
//     );
//   });
//   await res;
// }

async function createActiveCart(userId) {
  const res = new Promise((res) => {
    db.run(
      `INSERT INTO cart (userId) VALUES ($userId)`,
      {
        $userId: userId,
      },
      function (err, result) {
         res(this.lastID);
      }
    );
  });

  return await res;
}

async function getActiveCartId(userId) {
  // Make callback into a promise
  const res = new Promise((res, rej) => {
    // Get the active cart id from the database
    db.get(
      `SELECT id FROM cart WHERE userId = $userId AND completed = 0`,
      {
        $userId: userId,
      },
      (_, result) => {
        if (result) res(result);
        else rej(null);
      }
    );
  });

  try {
    // Wait for the promise to resolve
    const cart = await res;
    return cart.id
  } catch (error) {
    // If there is an error, the user has no active carts
    const id = await createActiveCart(userId);
    return id;
  }
}

export async function addProductToCart(userId, itemId, quantity) {
  const cartId = await getActiveCartId(userId);
  console.log("Cart id is:", cartId);
  const res = new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO cartItems (cartId, itemId, quantity) VALUES ($cartId, $itemId, $quantity)`,
      {
        $cartId: cartId,
        $itemId: itemId,
        $quantity: quantity,
      },
      function () {
        resolve(this.lastID);
      }
    );
  });
  const id = await res;
  console.log("Created cartItem is : ", id);
}
