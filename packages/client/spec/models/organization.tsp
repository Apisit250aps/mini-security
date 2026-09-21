namespace MiniSecurity;

// ─── Organization ─────────────────────────────────────────────────────────────
model Organization is Domain.Entity.Organization;

model CreateOrganization
  is OmitProperties<Organization, "id" | "createdAt" | "updatedAt">;

model UpdateOrganization
  is OptionalProperties<OmitProperties<Organization, "id" | "createdAt" | "updatedAt">>;

// ─── Site ─────────────────────────────────────────────────────────────────────
model Site is Domain.Entity.Site;

model CreateSite
  is OmitProperties<Site, "id" | "createdAt" | "updatedAt">;

model UpdateSite
  is OptionalProperties<OmitProperties<Site, "id" | "createdAt" | "updatedAt">>;

// ─── Organization Member ──────────────────────────────────────────────────────
model OrganizationMember is Domain.Entity.OrganizationMember;

model CreateOrganizationMember {
  ...OmitProperties<OrganizationMember, "id" | "createdAt" | "updatedAt" | "siteId">;
  @format("uuid")
  siteId?: string | null;
}

model UpdateOrganizationMember
  is OptionalProperties<OmitProperties<OrganizationMember, "id" | "createdAt" | "updatedAt">>;

model SwitchActiveOrganizationResponse {
  activeOrganizationId: string;
  organization: Organization;
}
