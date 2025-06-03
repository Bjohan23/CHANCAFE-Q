const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // 'Bearer TOKEN_HERE'

  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expirado' });
    } else {
      return res.status(403).json({ message: 'Token inválido' });
    }
  }
};

module.exports = authMiddleware;