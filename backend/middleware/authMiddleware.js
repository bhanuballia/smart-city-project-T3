import jwt from "jsonwebtoken";

export const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Role-based check
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Access denied: insufficient role" });
      }

      next();
    } catch (err) {
      console.error("Auth error:", err.message);
      res.status(401).json({ message: "Token is not valid" });
    }
  };
};
