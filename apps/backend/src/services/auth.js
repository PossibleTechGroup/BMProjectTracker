import bcrypt from 'bcryptjs';
import * as userModel from '../models/user.js';
import { generateToken } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

export async function register({ name, username, email, password }) {
  const hash = await bcrypt.hash(password, 10);
  const user = await userModel.create({ name, username, email, password: hash });

  // Auto-add the new user to all existing projects
  const allProjects = await prisma.project.findMany({ select: { id: true } });
  for (const p of allProjects) {
    await prisma.projectMember.create({
      data: { projectId: p.id, userId: user.id, role: 'MEMBER' },
    }).catch(() => {}); // ignore if duplicate
  }

  const token = generateToken(user);
  return { token, user: { id: user.id, name: user.name, username: user.username, role: user.role } };
}

export async function login({ username, password }) {
  const user = await userModel.findByUsername(username);
  if (!user) return null;

  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;

  const token = generateToken(user);
  return { token, user: { id: user.id, name: user.name, username: user.username, role: user.role } };
}

export async function getProfile(userId) {
  const user = await userModel.findById(userId);
  if (!user) return null;
  return {
    id: user.id, name: user.name, username: user.username, role: user.role,
    projects: user.projectMemberships.map(m => m.project),
  };
}

export async function getAllUsers() {
  return userModel.findAll();
}

export async function toggleStatus(id) {
  const user = await userModel.findById(id);
  if (!user) throw new Error('User not found');
  const newStatus = user.accountStatus === 'active' ? 'suspended' : 'active';
  return userModel.update(id, { accountStatus: newStatus });
}

export async function deleteUser(id) {
  return userModel.remove(id);
}
