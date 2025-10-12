import jwt from 'jsonwebtoken';

interface userPayLoad {
  id: number;
  name: string;
  email?: string;
  role: string;
}

export const generateToken = (user: userPayLoad): string => {
  const secret: string | undefined = String(process.env.JWT_ACCESS_SECRET);
  return jwt.sign(user, secret, {
    expiresIn: process.env.APP_ENV === 'production' ? '5m' : '1h',
  });
};

export const generateRefreshToken = (user: userPayLoad): string => {
  return jwt.sign(user, String(process.env.JWT_REFRESH_SECRET), {
    expiresIn: process.env.APP_ENV === 'production' ? '1d' : '7d',
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
