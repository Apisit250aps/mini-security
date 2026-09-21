namespace MiniSecurity;

// ─── Feature (Master Catalog) ──────────────────────────────────────────────────
model Feature is Domain.Entity.Feature;

model CreateFeature
  is OmitProperties<Feature, "id" | "createdAt" | "updatedAt">;

model UpdateFeature
  is OptionalProperties<OmitProperties<Feature, "id" | "createdAt" | "updatedAt">>;

model ToggleFeatureRequest is PickProperties<Feature, "isActive">;

// ─── OrganizationFeature ───────────────────────────────────────────────────────
model OrganizationFeature is Domain.Entity.OrganizationFeature;

model CreateOrganizationFeature
  is OmitProperties<OrganizationFeature, "id" | "createdAt" | "updatedAt">;

model OrganizationToggleFeatureRequest is PickProperties<OrganizationFeature, "featureId" | "isEnabled">;

// ─── RoleFeature ───────────────────────────────────────────────────────────────
model RoleFeature is Domain.Entity.RoleFeature;

model CreateRoleFeature
  is OmitProperties<RoleFeature, "id" | "createdAt" | "updatedAt">;

model RoleToggleFeatureRequest is PickProperties<RoleFeature, "organizationId" | "featureId" | "isEnabled">;

model FeatureAccessResponse {
  hasAccess: boolean;
}
