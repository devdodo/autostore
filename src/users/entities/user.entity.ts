import { Role } from '../../common/roles.enum';

export class User {
  id!: string;
  email!: string;
  passwordHash!: string;
  fullName!: string;
  roles!: Role[];
  createdAt!: Date;
  updatedAt!: Date;
}

export type PublicUser = Omit<User, 'passwordHash'>;


