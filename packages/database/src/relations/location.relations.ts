import type { RelationsHelper } from './types';

export const locationRelations = (r: RelationsHelper) => ({
  company: {
    locations: r.many.locations(),
  },
  companyBranch: {
    locations: r.many.locations(),
  },
  locations: {
    company: r.one.company({
      from: r.locations.companyId,
      to: r.company.id,
    }),
    branch: r.one.companyBranch({
      from: [r.locations.companyBranchId, r.locations.companyId],
      to: [r.companyBranch.id, r.companyBranch.companyId],
    }),
    scheduleSlots: r.many.scheduleSlotLocation(),
    attendanceLogs: r.many.attendanceLogs(),
  },
  scheduleSlotLocation: {
    scheduleSlot: r.one.scheduleSlots({
      from: [
        r.scheduleSlotLocation.scheduleSlotId,
        r.scheduleSlotLocation.companyId,
      ],
      to: [r.scheduleSlots.id, r.scheduleSlots.companyId],
    }),
    location: r.one.locations({
      from: [
        r.scheduleSlotLocation.locationId,
        r.scheduleSlotLocation.companyId,
      ],
      to: [r.locations.id, r.locations.companyId],
    }),
  },
});
