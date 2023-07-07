"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const index_api_1 = __importDefault(require("./@app/api/index.api"));
const user_api_1 = __importDefault(require("./@shared/api/user.api"));
const auth_api_1 = __importDefault(require("./@shared/api/auth.api"));
const org_api_1 = __importDefault(require("./@shared/api/org.api"));
// import IndexRoute from './routes/index.route';
// import UsersRoute from './routes/users.route';
// import AuthRoute from './routes/auth.route';
// import validateEnv from './utils/validateEnv';
// validateEnv();
const app = new app_1.default([
    new index_api_1.default(),
    new user_api_1.default(),
    new auth_api_1.default(),
    new org_api_1.default()
    // new UsersRoute(),
    // new AuthRoute(),
]);
app.listen();
