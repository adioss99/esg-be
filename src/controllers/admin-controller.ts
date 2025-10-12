import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { changeRoleSchema } from '../validators/user-validator';

const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
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

const changeRole = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const val = changeRoleSchema(req.body);
    if (!val.success) {
      return res.status(400).json({
        success: false,
        message: val.error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    const userExists = await prisma.user.findUnique({ where: { id } });
    if (!userExists) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: { ...val.data },
      select: { id: true, name: true, email: true, role: true },
    });
    res.status(200).json({ success: true, data: user });
  } catch (error: string | any) {
    res.status(500).json({ success: false, message: 'Error changing role', error: error.message });
  }
};

export default { getUsers, changeRole };
