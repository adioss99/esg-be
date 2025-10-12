import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { registerSchema, updateUserSchema } from '../validators/user-validator';
import { hashPassword } from '../lib/bcrypt';

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message,
    });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const result = registerSchema(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    const { name, email, password, role } = result.data;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: await hashPassword(password),
        role,
      },
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error creating users',
      error: error.message,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = updateUserSchema(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    const { name, email, role } = result.data;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists && userExists.id !== id) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email: email.toLowerCase(),
        role,
      },
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error: string | any) {
    res.status(500).json({
      success: false,
      message: 'Error creating users',
      error: error.message,
    });
  }
};
