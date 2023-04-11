import gr from "../services/global-resolver";
import CompanyUser from "../services/user/entities/company_user";

export function hasCompanyAdminLevel(role: string): boolean {
  return role === "admin" || isCompanyOwnerRole(role);
}

export function hasCompanyMemberLevel(role: string): boolean {
  return role === "member" || hasCompanyAdminLevel(role);
}

export function hasCompanyGuestLevel(role: string): boolean {
  return role === "guest" || hasCompanyMemberLevel(role);
}

export function isCompanyOwnerRole(role: string): boolean {
  return role === "owner";
}

export function isCompanyAdminRole(role: string): boolean {
  return role === "admin";
}

export function isCompanyMemberRole(role: string): boolean {
  return role === "member";
}

export function isCompanyGuestRole(role: string): boolean {
  return role === "guest";
}

export async function checkUserBelongsToCompany(
  userId: string,
  companyId: string,
): Promise<CompanyUser> {
  const companyUser = await gr.services.companies.getCompanyUser({ id: companyId }, { id: userId });

  if (!companyUser) {
    const company = await gr.services.companies.getCompany({ id: companyId });
    if (!company) {
      throw gr.fastify.httpErrors.notFound(`Company ${companyId} not found`);
    }
    throw gr.fastify.httpErrors.forbidden("User does not belong to this company");
  }

  return companyUser;
}
