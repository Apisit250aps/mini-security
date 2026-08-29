import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

import "./models/common.tsp";
import "./models/entities.tsp";

// Module Models
import "./models/user.tsp";
import "./models/company.tsp";
import "./models/permission.tsp";

// Module Services
import "./services/user.tsp";
import "./services/company.tsp";
import "./services/permission.tsp";

@service(#{ title: "MiniSecurity API Service" })
namespace MiniSecurity;
