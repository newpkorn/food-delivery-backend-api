import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (
    (req.user && req.user.role === 'admin') ||
    (req.user && req.user.role === 'staff')
  ) {
    next();
  } else {
    return res
      .status(403)
      .json({ success: false, message: 'Forbidden: Admins only' });
  }
};

export { authMiddleware, adminMiddleware };
