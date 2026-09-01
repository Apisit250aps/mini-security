namespace MiniSecurity;

// ─── Company ─────────────────────────────────────────────────────────────────
model Company is Domain.Entity.Company;

model CreateCompany
  is OmitProperties<Company, "id" | "createdAt" | "updatedAt">;

model UpdateCompany
  is OptionalProperties<OmitProperties<Company, "id" | "createdAt" | "updatedAt">>;

// ─── Company Member ───────────────────────────────────────────────────────────
model CompanyMember is Domain.Entity.CompanyMember;

model CreateCompanyMember
  is OmitProperties<CompanyMember, "id" | "createdAt" | "updatedAt">;

model UpdateCompanyMember
  is OptionalProperties<OmitProperties<CompanyMember, "id" | "createdAt" | "updatedAt">>;
