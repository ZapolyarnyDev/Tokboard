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
}
