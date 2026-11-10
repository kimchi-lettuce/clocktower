import { RegisteredConvexFunction, RegisteredFunctions } from "@confect/server";
import databaseSchema from "../schema";
import myFunctions from "../../myFunctions.impl";

export default RegisteredFunctions.buildForGroup<typeof import("../../myFunctions.spec")["default"]>(databaseSchema, myFunctions, RegisteredConvexFunction.make);
