import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
  console.log("Authorization Header:", req.headers.authorization);
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log("Token not found");
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    console.error("JWT Error:", error);
    return res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

export default authMiddleware;
