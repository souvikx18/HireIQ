import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`.trim(),
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch {
    return null;
  }
};
