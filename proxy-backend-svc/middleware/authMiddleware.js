
import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send({ message: "Access token required", success: false });
  }

  jwt.verify(token, process.env.JWT_AUTH_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).send({ message: "Invalid or expired token", success: false });
    }

    req.user = user; 
    next();
  });
};

export default authenticateToken;
