import { db } from "../db/db.js";
import { v4 as uuidv4 } from "uuid";

/**
 * @param {Object} user
 * @param {string} user.usernam
 * @param {string} user.email
 * @param {string} user.password
 * @param {string} user.confirmpassword
 *
 * @returns {boolean}
 */
export async function register(user) {
  // Function is responsible for registering a user into the database
  // It will return true if the user was successfully registered and false if the user was not registered

  if (user.password !== user.confirmpassword) {
    // First check if the password is the same in both fields
    return false;
  }
  // Promise wrapper to make the function async
  const res = new Promise((res, rej) => {
    // Insert the user into the database
    db.run(
      "INSERT INTO users(username, email, password) VALUES ($username, $email, $password)",
      {
        $username: user.username,
        $email: user.email,
        $password: user.password,
      },
      (result, error) => {
        if (error) {
          // If there is an error, reject the promise (user was not created)
          rej(error);
        } else {
          // If there is no error, resolve the promise (user was created)
          res(result);
        }
      }
    );
  });
  // Wait for the promise to resolve
  try {
    // If the promise resolves (a user was successfuly), return true
    await res;
    return true;
  } catch (error) {
    // If the promise rejects (a user was not created - error - liklely constraint conflict), return false
    return false;
  }
}

/**
 * @param {Object} user
 * @param {string} user.username
 * @param {string} user.password
 */
export async function login(user) {
  // Function is responsible for logging in a user
  // It will return the user object if the user was successfully logged in and null if the user was not logged in

  // Promise wrapper to make the function async
  const res = new Promise((res, rej) => {
    // When retrieving data we use db.get
    db.get(
      "SELECT username,id FROM users WHERE username=$username AND password=$password;",
      {
        $username: user.username,
        $password: user.password,
      },
      (error, result) => {
        if (result !== undefined) {
          // If the result is not undefined, resolve the promise (user was found)
          res(result);
        } else {
          // If the result is undefined, reject the promise (user was not found)
          rej();
        }
      }
    );
  });
  // Wait for the promise to resolve
  try {
    // If the promise resolves (a user was found), return the user object
    const user = await res;
    return user;
  } catch {
    // If the promise rejects (a user was not found), return null
    return null;
  }
}

/**
 * @param {string} id The id of the user of whom to create a session for
 */
export async function createSession(id) {
  // Function is responsible for creating a session for a user

  // Promise wrapper to make the function async
  const res = new Promise((res, rej) => {
    const token = uuidv4();
    db.run(
      `INSERT INTO session(token,userid) VALUES ($token, $userid);`,
      {
        $token: token,
        $userid: id,
      },
      () => {
        // Resolve the promise with the uuid of the session
        res(token);
      }
    );
  });
  // Wait for the promise to resolve
  // Notry catch block is needed as the promise is expected to always resolve
  const token = await res;
  // Return the uuid of the session
  return token;
}

/**
 * @param {string | undefined} token The token of the session to match to a user
 *
 * @returns {{id:string, username:string, email:string, isAdmin:number} | null}
 */
export async function matchSessionTokenToUser(token) {
  // Check if the session token is undefined - means user was not logged in (had no cookie)
  if (!token) return null;

  // Make the function async
  const res = new Promise((res, rej) => {
    db.get(
      `SELECT users.id, users.username, users.email, users.isadmin
      FROM users
      JOIN session ON session.userid = users.id
      WHERE session.token = $token;
      `,
      {
        $token: token,
      },
      (_, result) => {
        // If the result is not undefined - a user was found
        // Resolve the promise with the user object
        if (result) res(result);
        // If the result is undefined - a user was not found
        // Reject the promise with null
        else rej(null);
      }
    );
  });

  // Wait for the promise to resolve
  try {
    const user = await res;
    return user;
  } catch (error) {
    // If the promise rejects (a user was not found), return null
    return null;
  }
}

export async function getUserAdddress(userId) {
  const res = new Promise((res) => {
    db.get(
      `SELECT address FROM userAddress WHERE userId = $userId;`,
      {
        $userId: userId,
      },
      (_, result) => {
        res(result);
      }
    );
  });

  return await res;
}

export async function updateUserAddress(userId, newAddress) {
  const currentAdress = await getUserAdddress(userId);
  const res = new Promise((res, rej) => {
    // Check to see  if user already has an adress
    // If he does, do an update
    if (currentAdress) {
      db.run(
        `UPDATE userAddress SET address = $address WHERE userId = $userId;`,
        {
          $address: newAddress,
          $userId: userId,
        },
        function () {
          if (this.changes > 0) res();
          else rej();
        }
      );
    }
    // If not, do an insert
    else {
      db.run(
        `INSERT INTO userAddress (userId, address) VALUES ($userId, $address);`,
        {
          $address: newAddress,
          $userId: userId,
        },
        function () {
          if (this.changes > 0) res();
          else rej();
        }
      );
    }
  });

  try {
    await res;
    return true;
  } catch (error) {
    return null;
  }
}
