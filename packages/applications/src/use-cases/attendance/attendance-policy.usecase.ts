import type {
  IAssignRoleAttendancePolicyContext,
  IAssignRoleAttendancePolicyUseCase,
  ICreateAttendanceCheckpointContext,
  ICreateAttendanceCheckpointUseCase,
  ICreateAttendancePolicyContext,
  ICreateAttendancePolicyUseCase,
  IDeleteAttendanceCheckpointContext,
  IDeleteAttendanceCheckpointUseCase,
  IDeleteAttendancePolicyContext,
  IDeleteAttendancePolicyUseCase,
  IGetAttendanceCheckpointContext,
  IGetAttendanceCheckpointUseCase,
  IGetAttendanceCheckpointsContext,
  IGetAttendanceCheckpointsUseCase,
  IGetAttendancePoliciesContext,
  IGetAttendancePoliciesUseCase,
  IGetAttendancePolicyContext,
  IGetAttendancePolicyUseCase,
  IGetRoleAttendancePoliciesContext,
  IGetRoleAttendancePoliciesUseCase,
  IRemoveRoleAttendancePolicyContext,
  IRemoveRoleAttendancePolicyUseCase,
  IUpdateAttendanceCheckpointContext,
  IUpdateAttendanceCheckpointUseCase,
  IUpdateAttendancePolicyContext,
  IUpdateAttendancePolicyUseCase,
} from '@repo/domains/applications/attendance';
import type {
  AttendanceCheckpoint,
  AttendancePolicy,
  RoleAttendancePolicy,
} from '@repo/domains/entities/attendance';
import type {
  IAttendanceCheckpointRepository,
  IAttendancePolicyRepository,
  IRoleAttendancePolicyRepository,
} from '@repo/domains/repositories/attendance';
import {
  createAttendanceCheckpointSchema,
  createAttendancePolicySchema,
  createRoleAttendancePolicySchema,
  updateAttendanceCheckpointSchema,
  updateAttendancePolicySchema,
} from '@repo/domains/schema/attendance';
import { RequirePermission } from '../../decorators/permission.decorator';
import {
  DuplicateError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class CreateAttendancePolicyUseCase
  implements ICreateAttendancePolicyUseCase
{
  constructor(private readonly repository: IAttendancePolicyRepository) {}

  @RequirePermission('attendance_policy:create')
  async execute(
    context: ICreateAttendancePolicyContext,
  ): Promise<AttendancePolicy> {
    const parsed = await createAttendancePolicySchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid attendance policy data',
        parsed.error.format(),
      );
    }
    return this.repository.create(parsed.data);
  }
}

export class UpdateAttendancePolicyUseCase
  implements IUpdateAttendancePolicyUseCase
{
  constructor(private readonly repository: IAttendancePolicyRepository) {}

  @RequirePermission('attendance_policy:update')
  async execute(
    context: IUpdateAttendancePolicyContext,
  ): Promise<AttendancePolicy> {
    const existing = await this.repository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Attendance policy with id ${context.id} not found`,
      );
    }

    const parsed = await updateAttendancePolicySchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update attendance policy data',
        parsed.error.format(),
      );
    }

    return this.repository.update(context.id, parsed.data);
  }
}

export class DeleteAttendancePolicyUseCase
  implements IDeleteAttendancePolicyUseCase
{
  constructor(private readonly repository: IAttendancePolicyRepository) {}

  @RequirePermission('attendance_policy:delete')
  async execute(context: IDeleteAttendancePolicyContext): Promise<void> {
    const existing = await this.repository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Attendance policy with id ${context.id} not found`,
      );
    }
    await this.repository.delete(context.id);
  }
}

export class GetAttendancePolicyUseCase implements IGetAttendancePolicyUseCase {
  constructor(private readonly repository: IAttendancePolicyRepository) {}

  @RequirePermission('attendance_policy:read')
  async execute(
    context: IGetAttendancePolicyContext,
  ): Promise<AttendancePolicy | null> {
    const item = await this.repository.findById(context.id);
    if (!item) {
      throw new NotFoundError(
        `Attendance policy with id ${context.id} not found`,
      );
    }
    return item;
  }
}

export class GetAttendancePoliciesUseCase
  implements IGetAttendancePoliciesUseCase
{
  constructor(private readonly repository: IAttendancePolicyRepository) {}

  @RequirePermission('attendance_policy:read')
  async execute(
    context: IGetAttendancePoliciesContext,
  ): Promise<AttendancePolicy[]> {
    return this.repository.findByCompanyId(context.companyId);
  }
}

// Attendance Checkpoint Use Cases
export class CreateAttendanceCheckpointUseCase
  implements ICreateAttendanceCheckpointUseCase
{
  constructor(
    private readonly checkpointRepository: IAttendanceCheckpointRepository,
    private readonly policyRepository: IAttendancePolicyRepository,
  ) {}

  @RequirePermission('attendance_checkpoint:create')
  async execute(
    context: ICreateAttendanceCheckpointContext,
  ): Promise<AttendanceCheckpoint> {
    const parsed = await createAttendanceCheckpointSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid attendance checkpoint data',
        parsed.error.format(),
      );
    }

    const policy = await this.policyRepository.findById(parsed.data.policyId);
    if (!policy) {
      throw new NotFoundError(
        `Attendance policy with id ${parsed.data.policyId} not found`,
      );
    }

    return this.checkpointRepository.create(parsed.data);
  }
}

export class UpdateAttendanceCheckpointUseCase
  implements IUpdateAttendanceCheckpointUseCase
{
  constructor(
    private readonly checkpointRepository: IAttendanceCheckpointRepository,
  ) {}

  @RequirePermission('attendance_checkpoint:update')
  async execute(
    context: IUpdateAttendanceCheckpointContext,
  ): Promise<AttendanceCheckpoint> {
    const existing = await this.checkpointRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Attendance checkpoint with id ${context.id} not found`,
      );
    }

    const parsed = await updateAttendanceCheckpointSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update attendance checkpoint data',
        parsed.error.format(),
      );
    }

    return this.checkpointRepository.update(context.id, parsed.data);
  }
}

export class DeleteAttendanceCheckpointUseCase
  implements IDeleteAttendanceCheckpointUseCase
{
  constructor(
    private readonly checkpointRepository: IAttendanceCheckpointRepository,
  ) {}

  @RequirePermission('attendance_checkpoint:delete')
  async execute(context: IDeleteAttendanceCheckpointContext): Promise<void> {
    const existing = await this.checkpointRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(
        `Attendance checkpoint with id ${context.id} not found`,
      );
    }
    await this.checkpointRepository.delete(context.id);
  }
}

export class GetAttendanceCheckpointUseCase
  implements IGetAttendanceCheckpointUseCase
{
  constructor(
    private readonly checkpointRepository: IAttendanceCheckpointRepository,
  ) {}

  @RequirePermission('attendance_checkpoint:read')
  async execute(
    context: IGetAttendanceCheckpointContext,
  ): Promise<AttendanceCheckpoint | null> {
    const item = await this.checkpointRepository.findById(context.id);
    if (!item) {
      throw new NotFoundError(
        `Attendance checkpoint with id ${context.id} not found`,
      );
    }
    return item;
  }
}

export class GetAttendanceCheckpointsUseCase
  implements IGetAttendanceCheckpointsUseCase
{
  constructor(
    private readonly checkpointRepository: IAttendanceCheckpointRepository,
  ) {}

  @RequirePermission('attendance_checkpoint:read')
  async execute(
    context: IGetAttendanceCheckpointsContext,
  ): Promise<AttendanceCheckpoint[]> {
    return this.checkpointRepository.findByPolicyId(context.policyId);
  }
}

// Role Attendance Policy Use Cases
export class AssignRoleAttendancePolicyUseCase
  implements IAssignRoleAttendancePolicyUseCase
{
  constructor(
    private readonly rolePolicyRepository: IRoleAttendancePolicyRepository,
    private readonly policyRepository: IAttendancePolicyRepository,
  ) {}

  @RequirePermission('attendance_policy:update')
  async execute(
    context: IAssignRoleAttendancePolicyContext,
  ): Promise<RoleAttendancePolicy> {
    const parsed = await createRoleAttendancePolicySchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid role attendance policy data',
        parsed.error.format(),
      );
    }

    const policy = await this.policyRepository.findById(parsed.data.policyId);
    if (!policy) {
      throw new NotFoundError(
        `Attendance policy with id ${parsed.data.policyId} not found`,
      );
    }

    const existing = await this.rolePolicyRepository.findByRoleAndPolicy(
      parsed.data.roleId,
      parsed.data.policyId,
    );
    if (existing) {
      throw new DuplicateError(
        'Role already assigned to this attendance policy',
      );
    }

    return this.rolePolicyRepository.create(parsed.data);
  }
}

export class RemoveRoleAttendancePolicyUseCase
  implements IRemoveRoleAttendancePolicyUseCase
{
  constructor(
    private readonly rolePolicyRepository: IRoleAttendancePolicyRepository,
  ) {}

  @RequirePermission('attendance_policy:update')
  async execute(context: IRemoveRoleAttendancePolicyContext): Promise<void> {
    const existing = await this.rolePolicyRepository.findByRoleAndPolicy(
      context.roleId,
      context.policyId,
    );
    if (!existing) {
      throw new NotFoundError('Role attendance policy assignment not found');
    }
    await this.rolePolicyRepository.deleteByRoleAndPolicy(
      context.roleId,
      context.policyId,
    );
  }
}

export class GetRoleAttendancePoliciesUseCase
  implements IGetRoleAttendancePoliciesUseCase
{
  constructor(
    private readonly rolePolicyRepository: IRoleAttendancePolicyRepository,
  ) {}

  @RequirePermission('attendance_policy:read')
  async execute(
    context: IGetRoleAttendancePoliciesContext,
  ): Promise<RoleAttendancePolicy[]> {
    return this.rolePolicyRepository.findByRoleId(context.roleId);
  }
}
