import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { comparePassword } from '../lib/bcrypt';
import { generateRefreshToken, generateToken } from '../lib/jwt';
import { loginValidationSchema } from '../validators/user-validator';

export const login = async (req: Request, res: Response) => {
  try {
    const val = loginValidationSchema(req.body);
    if (!val.success) {
      return res.status(400).json({
        success: false,
        message: val.error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    const { email, password } = val.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, password: true, role: true },
    });
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ success: false, message: 'User not found' });

    const jwtPayload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const accessToken: string = generateToken(jwtPayload);
    const refreshToken: string = generateRefreshToken(jwtPayload);

    const data = await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
      select: { id: true, name: true, email: true, role: true },
    });

    const envi = process.env.APP_ENV === 'production';
    console.log(envi);
    res
      .status(200)
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: envi,
        sameSite: envi ? 'none' : 'lax',
        maxAge: (envi ? 7 : 15) * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        data,
        accessToken,
        refreshToken,
      });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const cookies = req.user;
    const user = await prisma.user.findFirst({
      where: { id: cookies.id },
    });

    if (!user) return res.status(400).json({ success: false, message: 'Refresh token not found' });

    const accessToken = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    res.status(200).json({ success: true, data: { id: user.id, name: user.name, role: user.role }, accessToken });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error refreshing token',
      error: error.message,
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: '' },
    });

    res.status(200).clearCookie('refreshToken').json({ success: true, message: 'Logged out successfully' });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message,
    });
  }
};
