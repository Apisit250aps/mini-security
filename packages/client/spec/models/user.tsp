namespace MiniSecurity;

model User is Domain.Entity.User;

model CreateUser is OmitProperties<
  User,
  "id" | "lastLogin" | "createdAt" | "updatedAt" | "emailVerified"
> {
  password?: string;
}

model UpdateUser
  is OptionalProperties<OmitProperties<User, "id" | "createdAt" | "updatedAt">>;
