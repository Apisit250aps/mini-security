import {
  AssignMemberWorkScheduleUseCase,
  DeleteMemberWorkScheduleUseCase,
  GetCurrentMemberWorkScheduleUseCase,
  GetMemberWorkScheduleUseCase,
  GetMemberWorkSchedulesUseCase,
  UpdateMemberWorkScheduleUseCase,
} from '@repo/applications';
import {
  companyMemberRepository,
  memberWorkScheduleRepository,
  workShiftRepository,
} from '../../repositories';

export const assignMemberWorkScheduleUseCase =
  new AssignMemberWorkScheduleUseCase(
    memberWorkScheduleRepository,
    companyMemberRepository,
    workShiftRepository,
  );
export const updateMemberWorkScheduleUseCase =
  new UpdateMemberWorkScheduleUseCase(
    memberWorkScheduleRepository,
    workShiftRepository,
  );
export const deleteMemberWorkScheduleUseCase =
  new DeleteMemberWorkScheduleUseCase(memberWorkScheduleRepository);
export const getMemberWorkScheduleUseCase = new GetMemberWorkScheduleUseCase(
  memberWorkScheduleRepository,
);
export const getMemberWorkSchedulesUseCase = new GetMemberWorkSchedulesUseCase(
  memberWorkScheduleRepository,
);
export const getCurrentMemberWorkScheduleUseCase =
  new GetCurrentMemberWorkScheduleUseCase(memberWorkScheduleRepository);
