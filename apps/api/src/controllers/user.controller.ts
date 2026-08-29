import { z } from 'zod';
import { createUserSchema, updateUserSchema } from '@repo/domains/schema/user';
import type {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUserByEmailUseCase,
  GetUserUseCase,
  GetUsersUseCase,
  UpdateUserUseCase,
} from '@repo/applications';
import Controller from './base.controller';

const idParamSchema = z.object({
  id: z.string().uuid(),
});

export class UserController extends Controller {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
  ) {
    super();
  }

  public getUsers = async (c: Parameters<typeof this.success>[0]) => {
    const users = await this.getUsersUseCase.execute();
    return this.success(c, 'Users retrieved successfully', users);
  };

  public getUser = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const user = await this.getUserUseCase.execute({ id });
    return this.success(c, 'User retrieved successfully', user);
  });

  public createUser = this.validator({ body: createUserSchema }, async (c) => {
    const body = c.get('body');
    const user = await this.createUserUseCase.execute({ data: body });
    return this.created(c, 'User created successfully', user);
  });

  public updateUser = this.validator(
    { params: idParamSchema, body: updateUserSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = await this.updateUserUseCase.execute({ id, data: body });
      return this.success(c, 'User updated successfully', user);
    },
  );

  public deleteUser = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    await this.deleteUserUseCase.execute({ id });
    return this.success(c, 'User deleted successfully');
  });
}
