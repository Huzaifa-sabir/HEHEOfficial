const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Please define JWT_SECRET in your .env.local');
}

// Compare plain vs hash
async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// Verify a JWT and return payload or null
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};


async function authMiddleware(req) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) throw new Error('No token provided');
  const decoded = verifyToken(token);
  if (!decoded) throw new Error('Invalid token');
  return decoded;
}


async function verifyAuth(request) {
  
  const token = request.headers.get('Authorization').split(' ')[1].trim()
  
  if (!token) {
    throw new Error('No token provided');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

module.exports = {
  verifyPassword,
  verifyToken,
  authMiddleware,
  generateToken,
  verifyAuth,
};
