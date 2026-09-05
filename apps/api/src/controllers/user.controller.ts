import {
  userSchema,
  createUserSchema,
  updateUserSchema,
} from '@repo/domains/schema/user';
import type {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUserByEmailUseCase,
  GetUserUseCase,
  GetUsersUseCase,
  UpdateUserUseCase,
} from '@repo/applications';
import Controller from './base.controller';

const idParamSchema = userSchema.pick({ id: true });

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
    const user = c.get('user');
    const users = await this.getUsersUseCase.execute({
      ...this.securityContext(c),
      userId: user?.id,
    });
    return this.success(c, 'Users retrieved successfully', users);
  };

  public getUser = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const user = c.get('user');
    const userResult = await this.getUserUseCase.execute({
      ...this.securityContext(c),
      id,
      userId: user?.id,
    });
    return this.success(c, 'User retrieved successfully', userResult);
  });

  public createUser = this.validator({ body: createUserSchema }, async (c) => {
    const body = c.get('body');
    const user = c.get('user');
    const userResult = await this.createUserUseCase.execute({
      ...this.securityContext(c),
      data: body,
      userId: user?.id,
    });
    return this.created(c, 'User created successfully', userResult);
  });

  public updateUser = this.validator(
    { params: idParamSchema, body: updateUserSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = c.get('user');
      const userResult = await this.updateUserUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
        userId: user?.id,
      });
      return this.success(c, 'User updated successfully', userResult);
    },
  );

  public deleteUser = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const user = c.get('user');
    await this.deleteUserUseCase.execute({
      ...this.securityContext(c),
      id,
      userId: user?.id,
    });
    return this.success(c, 'User deleted successfully');
  });
}
