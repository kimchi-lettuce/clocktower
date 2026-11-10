import { RegisteredConvexFunction, RegisteredFunctions } from "@confect/server";
import databaseSchema from "../../schema";
import tickets from "../../../devboard/tickets.impl";

export default RegisteredFunctions.buildForGroup<typeof import("../../../devboard/tickets.spec")["default"]>(databaseSchema, tickets, RegisteredConvexFunction.make);
