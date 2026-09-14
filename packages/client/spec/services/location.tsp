import "@typespec/http";
import "@typespec/rest";
import "../models/location.tsp";
import "../models/common.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace MiniSecurity;

@route("/locations")
interface LocationService {
  @get
  @summary("Get locations by company")
  listLocationsByCompany(
    @query companyId: string,
  ): ApiOkResponse<Location[]> | ApiUnauthorizedResponse;

  @get
  @route("/branch/{branchId}")
  @summary("Get active locations by branch")
  listLocationsByBranch(
    @path branchId: string,
  ): ApiOkResponse<Location[]> | ApiUnauthorizedResponse;

  @get
  @route("/{id}")
  @summary("Get location by ID")
  getLocation(
    @path id: string,
  ): ApiOkResponse<Location> | ApiNotFoundResponse | ApiUnauthorizedResponse;

  @post
  @summary("Create a new location")
  createLocation(
    @body body: CreateLocation,
  ): ApiCreatedResponse<Location> | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @put
  @route("/{id}")
  @summary("Update a location")
  updateLocation(
    @path id: string,
    @body body: UpdateLocation,
  ): ApiOkResponse<Location> | ApiNotFoundResponse | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @delete
  @route("/{id}")
  @summary("Delete a location")
  deleteLocation(
    @path id: string,
    @query companyId: string,
  ): ApiOkBasicResponse | ApiNotFoundResponse | ApiUnauthorizedResponse;

  @post
  @route("/set-primary")
  @summary("Set branch primary location")
  setPrimaryLocation(
    @body body: SetPrimaryLocationRequest,
  ): ApiOkResponse<Location> | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @post
  @route("/slots")
  @summary("Assign location to schedule slot")
  assignSlotLocation(
    @body body: CreateScheduleSlotLocation,
  ): ApiCreatedResponse<ScheduleSlotLocation> | ApiBadRequestResponse | ApiUnauthorizedResponse;

  @get
  @route("/slots/{slotId}")
  @summary("Get active locations for schedule slot")
  getSlotLocations(
    @path slotId: string,
  ): ApiOkResponse<Location[]> | ApiUnauthorizedResponse;
}
