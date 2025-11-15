import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if authorization header exists
    if (!authHeader) {
      return res.status(401).json({ 
        error: "Authentication required. Please log in." 
      });
    }

    // Check if header has Bearer scheme
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        error: "Invalid authorization format" 
      });
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix
    
    if (!token) {
      return res.status(401).json({ 
        error: "Authentication required. Please log in." 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        error: "Your session has expired. Please log in again." 
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        error: "Invalid authentication token" 
      });
    }
    
    return res.status(401).json({ 
      error: "Authentication failed" 
    });
  }
};

export default authenticate;

