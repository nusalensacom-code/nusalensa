import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/adminAuth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// PUT: Update user (name, email, role, or reset password)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await req.json();
    const { name, email, role, password } = body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const duplicate = await prisma.user.findFirst({
        where: { email: cleanEmail, id: { not: id } },
      });
      if (duplicate) return NextResponse.json({ error: 'Email is already taken by another account' }, { status: 400 });
      updateData.email = cleanEmail;
    }
    if (role) {
      const validRoles = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'];
      if (validRoles.includes(role)) {
        // Prevent demoting the only super admin
        if (existingUser.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
          const superAdminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
          if (superAdminCount <= 1) {
            return NextResponse.json({ error: 'Cannot change the role of the only system Super Admin' }, { status: 400 });
          }
        }
        updateData.role = role;
      }
    }
    if (password && password.trim().length >= 6) {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updated, message: 'User updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}

// DELETE: Delete user (cannot delete self or the only super admin)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminAuth(req, ['SUPER_ADMIN']);
    if (auth instanceof NextResponse) return auth;

    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    // Check if trying to delete self
    if (auth.user.userId === id) {
      return NextResponse.json({ error: 'You cannot delete your own currently active account' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (existingUser.role === 'SUPER_ADMIN') {
      const superAdminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
      if (superAdminCount <= 1) {
        return NextResponse.json({ error: 'Cannot delete the only Super Admin in the system' }, { status: 400 });
      }
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: `Account "${existingUser.name}" deleted successfully` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}

