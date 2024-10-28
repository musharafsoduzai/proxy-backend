import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

export const client = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  namedPlaceholders: true,
  waitForConnections: true,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DATABASE,
  queueLimit: 0,
});
client.getConnection((error, connection) => {
  if (error) {
    console.error("Unable to connect to MySQL:", error);
  } else {
    console.log("Connected to MySQL database");
    connection.release();
  }
});
