import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { type UpdateUser, type PublicUser } from '@workspace/api';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await this.userRepository.findPublicById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, data: UpdateUser): Promise<PublicUser> {
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(userId, data);
    const publicUser = await this.userRepository.findPublicById(userId);
    return publicUser!;
  }

  async getUsers(userIds: string[]): Promise<PublicUser[]> {
    return this.userRepository.findManyPublic(userIds);
  }

  async getUserById(userId: string, _requesterId: string): Promise<PublicUser> {
    const user = await this.userRepository.findPublicById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
