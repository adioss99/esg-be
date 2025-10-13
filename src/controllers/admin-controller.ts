import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { registerSchema, updateUserSchema } from '../validators/user-validator';
import { hashPassword } from '../lib/bcrypt';
import { validateResponse } from '../utils/response';

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
    const val = registerSchema(req.body);
    if (!val.success) {
      return validateResponse(res, val);
    }

    const { name, email, password, role } = val.data;

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
    const val = updateUserSchema(req.body);
    if (!val.success) {
      return validateResponse(res, val);
    }

    const { name, email, role } = val.data;

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
