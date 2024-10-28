import { client } from "../config/db.js";
import { insert, update } from "../config/dynamicQuery.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const promise = client.promise();
const BaseUrl = process.env.BASE_URL;


const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return { hashedPassword, salt };
};

export default {
  authenticateToken: async (req, res) => {
    const { headers } = req;
    const access_token = headers?.authorization;
    if (!access_token) {
      return res.status(401).json({
        message: "Bearer Token is Required.",
      });
    }
    try {
      const token = headers?.authorization.split(" ")[1];
      jwt.verify(token, process.env.JWT_AUTH_SECRET_KEY, (err, user) => {
        if (err) {
          return res
            .status(401)
            .send({ message: err?.message, success: false });
        } else {
          req.user = user;
          return res.status(200).json({ success: true });
        }
      });
    } catch (error) {
      console.log(`Error in authenticateToken : ${error}`);
      res.status(500).send({ message: error?.message, success: false });
    }
  },
  register: async (req, res) => {
    const { email, password, name, phoneNumber, roleId = 1 } = req.body;

  if (!email || !password || !name) {
    return res.status(400).send({ message: "All fields are required", success: false });
  }

  try {
    await promise.query("START TRANSACTION");
    const [existingUser] = await promise.query(
      "SELECT * FROM `user` WHERE `email` = ?",
      [email]
    );

    if (existingUser.length > 0) {
      await promise.query("ROLLBACK");
      return res.status(409).send({ message: "Email already registered", success: false });
    }

    const { hashedPassword, salt } = await hashPassword(password);

    const user = {
      email,
      name,
      password: hashedPassword,
      salt,
      phoneNumber,
      roleId,
      isActive: 1,
    };

    const keys = Object.keys(user).join(", ");
    const placeholders = Object.keys(user).map(() => "?").join(", ");
    const values = Object.values(user);

    const insertQuery = `INSERT INTO user (${keys}) VALUES (${placeholders})`;
    const [result] = await promise.query(insertQuery, values);

    if (result.affectedRows === 0) {
      await promise.query("ROLLBACK");
      return res.status(500).send({ message: "Registration failed", success: false });
    }

    // Commit transaction
    await promise.query("COMMIT");
    return res.status(201).send({ message: "User registered successfully", success: true });
  } catch (error) {
    await promise.query("ROLLBACK");
    console.error(`Error during registration: ${error}`);
    return res.status(500).send({ message: error.message, success: false });
  }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ message: "Email and password are required", success: false });
    }
  
    try {
      const [userRow] = await promise.query("SELECT * FROM `user` WHERE `email` = ?", [email]);
  
      if (userRow.length === 0) {
        return res.status(404).send({ message: "User not found", success: false });
      }
  
      const user = userRow[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).send({ message: "Invalid email or password", success: false });
      }
  
      const access_token = jwt.sign(
        { email: user.email, id: user.id },
        process.env.JWT_AUTH_SECRET_KEY,
      );
  
      return res.status(200).send({
        message: "Login successful",
        success: true,
        access_token,
      });
    } catch (error) {
      console.error(`Error during login: ${error}`);
      return res.status(500).send({ message: error.message, success: false });
    }
  },
};

