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
    console.error('JWT Error:', error);
    return res
      .status(401)
      .json({ success: false, message: 'Token is not valid' });
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
