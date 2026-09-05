namespace MiniSecurity;

model User is Domain.Entity.User;

model CreateUser is OmitProperties<
  User,
  "id" | "lastLogin" | "createdAt" | "updatedAt" | "emailVerified"
> {
  @minLength(8)
  @maxLength(255)
  password?: string | null;
}

model UpdateUser
  is OptionalProperties<OmitProperties<User, "id" | "createdAt" | "updatedAt">>;
