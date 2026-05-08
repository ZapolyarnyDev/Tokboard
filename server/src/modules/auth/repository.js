import { prisma } from '../../config/database.js'

export class AuthRepository {
  findUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    })
  }

  findUserById(id) {
    return prisma.user.findUnique({
      where: { id },
    })
  }

  createUser(data) {
    return prisma.user.create({
      data,
    })
  }

  createRefreshToken(data) {
    return prisma.refreshToken.create({
      data,
    })
  }

  findRefreshTokenByHash(tokenHash) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
    })
  }

  revokeRefreshToken(id) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    })
  }

  async rotateRefreshToken(tokenHash, userId) {
    return prisma.$transaction(async (tx) => {
      const record = await tx.refreshToken.findUnique({
        where: { tokenHash },
      })

      if (!record || record.revokedAt) {
        return { success: false, error: 'Refresh token revoked' }
      }

      if (record.expiresAt.getTime() <= Date.now()) {
        await tx.refreshToken.update({
          where: { id: record.id },
          data: { revokedAt: new Date() },
        })
        return { success: false, error: 'Refresh token expired' }
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        await tx.refreshToken.update({
          where: { id: record.id },
          data: { revokedAt: new Date() },
        })
        return { success: false, error: 'Invalid refresh token' }
      }

      await tx.refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date() },
      })

      return { success: true, user }
    })
  }
}
