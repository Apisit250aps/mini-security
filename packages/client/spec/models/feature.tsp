namespace MiniSecurity;

// ─── Feature (Master Catalog) ──────────────────────────────────────────────────
model Feature is Domain.Entity.Feature;

model CreateFeature
  is OmitProperties<Feature, "id" | "createdAt" | "updatedAt">;

model UpdateFeature
  is OptionalProperties<OmitProperties<Feature, "id" | "createdAt" | "updatedAt">>;

model ToggleFeatureRequest {
  isActive: boolean;
}

// ─── CompanyFeature ────────────────────────────────────────────────────────────
model CompanyFeature is Domain.Entity.CompanyFeature;

model CreateCompanyFeature
  is OmitProperties<CompanyFeature, "id" | "createdAt" | "updatedAt">;

model CompanyToggleFeatureRequest {
  featureId: string;
  isEnabled: boolean;
}

// ─── RoleFeature ───────────────────────────────────────────────────────────────
model RoleFeature is Domain.Entity.RoleFeature;

model CreateRoleFeature
  is OmitProperties<RoleFeature, "id" | "createdAt" | "updatedAt">;

model RoleToggleFeatureRequest {
  companyId: string;
  featureId: string;
  isEnabled: boolean;
}

model FeatureAccessResponse {
  hasAccess: boolean;
}
