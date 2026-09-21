import type { RelationsHelper } from './types';

export const locationRelations = (r: RelationsHelper) => ({
  organization: {
    locations: r.many.locations(),
  },
  site: {
    locations: r.many.locations(),
  },
  locations: {
    organization: r.one.organization({
      from: r.locations.organizationId,
      to: r.organization.id,
    }),
    site: r.one.site({
      from: [r.locations.siteId, r.locations.organizationId],
      to: [r.site.id, r.site.organizationId],
    }),
    scheduleSlots: r.many.scheduleSlotLocation(),
    attendanceLogs: r.many.attendanceLogs(),
  },
  scheduleSlotLocation: {
    scheduleSlot: r.one.scheduleSlots({
      from: [
        r.scheduleSlotLocation.scheduleSlotId,
        r.scheduleSlotLocation.organizationId,
      ],
      to: [r.scheduleSlots.id, r.scheduleSlots.organizationId],
    }),
    location: r.one.locations({
      from: [
        r.scheduleSlotLocation.locationId,
        r.scheduleSlotLocation.organizationId,
      ],
      to: [r.locations.id, r.locations.organizationId],
    }),
  },
});
