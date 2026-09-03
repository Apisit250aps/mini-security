import {
  CreateWorkScheduleUseCase,
  CreateWorkShiftUseCase,
  DeleteWorkScheduleUseCase,
  DeleteWorkShiftUseCase,
  GetWorkScheduleUseCase,
  GetWorkSchedulesUseCase,
  GetWorkShiftUseCase,
  GetWorkShiftsUseCase,
  GetCompanyWorkShiftsUseCase,
  UpdateWorkScheduleUseCase,
  UpdateWorkShiftUseCase,
} from '@repo/applications';
import {
  workScheduleRepository,
  workShiftRepository,
} from '../../repositories';

export const createWorkScheduleUseCase = new CreateWorkScheduleUseCase(
  workScheduleRepository,
);
export const updateWorkScheduleUseCase = new UpdateWorkScheduleUseCase(
  workScheduleRepository,
);
export const deleteWorkScheduleUseCase = new DeleteWorkScheduleUseCase(
  workScheduleRepository,
);
export const getWorkScheduleUseCase = new GetWorkScheduleUseCase(
  workScheduleRepository,
);
export const getWorkSchedulesUseCase = new GetWorkSchedulesUseCase(
  workScheduleRepository,
);

export const createWorkShiftUseCase = new CreateWorkShiftUseCase(
  workShiftRepository,
  workScheduleRepository,
);
export const updateWorkShiftUseCase = new UpdateWorkShiftUseCase(
  workShiftRepository,
);
export const deleteWorkShiftUseCase = new DeleteWorkShiftUseCase(
  workShiftRepository,
);
export const getWorkShiftUseCase = new GetWorkShiftUseCase(workShiftRepository);
export const getWorkShiftsUseCase = new GetWorkShiftsUseCase(
  workShiftRepository,
);
export const getCompanyWorkShiftsUseCase = new GetCompanyWorkShiftsUseCase(
  workShiftRepository,
);
