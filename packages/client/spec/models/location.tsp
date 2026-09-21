namespace MiniSecurity;

// ─── Location ─────────────────────────────────────────────────────────────────
model Location is Domain.Entity.Location;

model CreateLocation
  is OmitProperties<Location, "id" | "createdAt" | "updatedAt">;

model UpdateLocation
  is OptionalProperties<OmitProperties<Location, "id" | "organizationId" | "siteId" | "createdAt" | "updatedAt">>;

model ScheduleSlotLocation is Domain.Entity.ScheduleSlotLocation;

model CreateScheduleSlotLocation
  is OmitProperties<ScheduleSlotLocation, "id" | "createdAt" | "updatedAt">;

model UpdateScheduleSlotLocation
  is OptionalProperties<OmitProperties<ScheduleSlotLocation, "id" | "organizationId" | "scheduleSlotId" | "locationId" | "createdAt" | "updatedAt">>;

model SetPrimaryLocationRequest {
  locationId: string;
  siteId: string;
}
