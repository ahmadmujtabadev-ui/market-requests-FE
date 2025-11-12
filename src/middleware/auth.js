import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { ENV } from '../config/env';

export function jwtDecode(req, _res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return next();
  try {
    req.user = verify(h.slice(7), ENV.JWT_SECRET);
  } catch { /* ignore */ }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    next();
  };
}
