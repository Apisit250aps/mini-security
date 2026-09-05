namespace MiniSecurity;

// ─── Company ─────────────────────────────────────────────────────────────────
model Company is Domain.Entity.Company;

model CreateCompany
  is OmitProperties<Company, "id" | "createdAt" | "updatedAt">;

model UpdateCompany
  is OptionalProperties<OmitProperties<Company, "id" | "createdAt" | "updatedAt">>;

// ─── Company Branch ─────────────────────────────────────────────────────────
model CompanyBranch is Domain.Entity.CompanyBranch;

model CreateCompanyBranch
  is OmitProperties<CompanyBranch, "id" | "createdAt" | "updatedAt">;

model UpdateCompanyBranch
  is OptionalProperties<OmitProperties<CompanyBranch, "id" | "createdAt" | "updatedAt">>;

// ─── Company Member ───────────────────────────────────────────────────────────
model CompanyMember is Domain.Entity.CompanyMember;

model CreateCompanyMember {
  ...OmitProperties<CompanyMember, "id" | "createdAt" | "updatedAt" | "companyBranchId">;
  @format("uuid")
  companyBranchId?: string | null;
}



model UpdateCompanyMember
  is OptionalProperties<OmitProperties<CompanyMember, "id" | "createdAt" | "updatedAt">>;


model SwitchActiveCompanyResponse {
  activeCompanyId: string;
  company: Company;
}
