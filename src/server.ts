import App from './app';
import IndexApi from './@app/api/index.api';
import UserApi from './@shared/api/user.api';
import RouteCounterApi from "./@shared/api/route-counter.api";
// import IndexRoute from './routes/index.route';
// import UsersRoute from './routes/users.route';
// import AuthRoute from './routes/auth.route';
// import validateEnv from './utils/validateEnv';

// validateEnv();

const app = new App([
    new IndexApi(),
    new UserApi(),
    new RouteCounterApi()
    // new UsersRoute(),
    // new AuthRoute(),
]);

app.listen();
