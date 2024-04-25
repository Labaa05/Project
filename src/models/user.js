import { db } from "../db/db.js";
import { v4 as uuidv4 } from "uuid";

export async function register(user) {
  if (user.password !== user.confirmpassword) {
    return false;
  }

  const res = new Promise((res, rej) => {
    db.run(
      "INSERT INTO users(username, email, password) VALUES ($username, $email, $password)",
      {
        $username: user.username,
        $email: user.email,
        $password: user.password,
      },
      (result, error) => {
        if (error) {
          rej(error);
        } else {
          res(result);
        }
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

export async function login(user) {
  const res = new Promise((res, rej) => {
    db.get(
      "SELECT username,id FROM users WHERE username=$username AND password=$password;",
      {
        $username: user.username,
        $password: user.password,
      },
      (error, result) => {
        if (result !== undefined) {
          res(result);
        } else {
          rej();
        }
      }
    );
  });

  try {
    const user = await res;
    return user;
  } catch {
    return null;
  }
}

export async function createSession(id) {
  const res = new Promise((res, rej) => {
    const token = uuidv4();
    db.run(
      `INSERT INTO session(token,userid) VALUES ($token, $userid);`,
      {
        $token: token,
        $userid: id,
      },
      () => {
        res(token);
      }
    );
  });

  const token = await res;

  return token;
}

export async function matchSessionTokenToUser(token) {
  if (!token) return null;

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
        if (result) res(result);
        else rej(null);
      }
    );
  });

  try {
    const user = await res;
    return user;
  } catch (error) {
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
    } else {
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
