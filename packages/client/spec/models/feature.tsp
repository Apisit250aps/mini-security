namespace MiniSecurity;

// ─── Feature (Master Catalog) ──────────────────────────────────────────────────
model Feature is Domain.Entity.Feature;

model CreateFeature
  is OmitProperties<Feature, "id" | "createdAt" | "updatedAt">;

model UpdateFeature
  is OptionalProperties<OmitProperties<Feature, "id" | "createdAt" | "updatedAt">>;

model ToggleFeatureRequest is PickProperties<Feature, "isActive">;

// ─── CompanyFeature ────────────────────────────────────────────────────────────
model CompanyFeature is Domain.Entity.CompanyFeature;

model CreateCompanyFeature
  is OmitProperties<CompanyFeature, "id" | "createdAt" | "updatedAt">;

model CompanyToggleFeatureRequest is PickProperties<CompanyFeature, "featureId" | "isEnabled">;

// ─── RoleFeature ───────────────────────────────────────────────────────────────
model RoleFeature is Domain.Entity.RoleFeature;

model CreateRoleFeature
  is OmitProperties<RoleFeature, "id" | "createdAt" | "updatedAt">;

model RoleToggleFeatureRequest is PickProperties<RoleFeature, "companyId" | "featureId" | "isEnabled">;

model FeatureAccessResponse {
  hasAccess: boolean;
}
