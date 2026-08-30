namespace MiniSecurity;

model User is Domain.Entity.User;

model CreateUser
  is OmitProperties<
    User,
    "id" | "isActive" | "lastLogin" | "createdAt" | "updatedAt"
  > {
  password?: string;
}

model UpdateUser
  is OptionalProperties<OmitProperties<User, "id" | "createdAt" | "updatedAt">>;
