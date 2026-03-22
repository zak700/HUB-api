import jwt from "jsonwebtoken";

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "20s", 
  });
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1m",
  });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return null; // Retorna null se o token for inválido ou expirado
  }
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
}

function getToken(req) {
  // Try to get token from Authorization header (Bearer token)
  const authHeader = req.headers?.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7); // Remove "Bearer " prefix
  } else if (req.cookies?.refreshToken) {
    // Fallback to refreshToken cookie
    token = req.cookies.refreshToken;
  } else if (req.cookies?.accessToken) {
    // Fallback to accessToken cookie if it exists
    token = req.cookies.accessToken;
  }

  if (!token) return null;

  // Verify and return the decoded token
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    // If refresh token fails, try access token secret
    try {
      return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      return null; // Invalid or expired token
    }
  }
}

export default {
  generateToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  getToken
};
