import jwt from 'jsonwebtoken';

export interface userPayLoad {
  id: number;
  name: string;
  email?: string;
  role: string;
}

export const generateToken = (user: userPayLoad): string => {
  const isProduction = process.env.IS_PRODUCTION === 'true';
  return jwt.sign(user, String(process.env.JWT_ACCESS_SECRET), {
    expiresIn: isProduction ? '10m' : '1h',
  });
};

export const generateRefreshToken = (user: userPayLoad): string => {
  const isProduction = process.env.IS_PRODUCTION === 'true';
  return jwt.sign(user, String(process.env.JWT_REFRESH_SECRET), {
    expiresIn: isProduction ? '7d' : '15d',
  });
};

export const parseJWT = (token: string): userPayLoad => {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
};

export const verifyAcessToken = (token: string): string | null | jwt.JwtPayload => {
  try {
    return jwt.verify(token, String(process.env.JWT_ACCESS_SECRET));
  } catch (_) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): string | null | jwt.JwtPayload => {
  try {
    return jwt.verify(token, String(process.env.JWT_REFRESH_SECRET));
  } catch (_) {
    return null;
  }
};
