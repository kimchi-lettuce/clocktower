import { RegisteredConvexFunction, RegisteredFunctions } from "@confect/server";
import databaseSchema from "../../schema";
import games from "../../../game/games.impl";

export default RegisteredFunctions.buildForGroup<typeof import("../../../game/games.spec")["default"]>(databaseSchema, games, RegisteredConvexFunction.make);
