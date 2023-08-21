import App from './app';
import IndexApi from './@app/api/index.api';
import UserApi from './@shared/api/user.api';
import AuthApi from './@shared/api/auth.api';
import OrgApi from './@shared/api/org.api';
import ServiceItemApi from './@app/api/service-item.api';
import BokingApi from './@app/api/booking.api';
import ProductApi from './@app/api/product.api';
// import IndexRoute from './routes/index.route';
// import UsersRoute from './routes/users.route';
// import AuthRoute from './routes/auth.route';
// import validateEnv from './utils/validateEnv';

// validateEnv();

const app = new App([
    new IndexApi(),
    new UserApi(),
    new AuthApi(),
    new OrgApi(),
    new ServiceItemApi(),
    new BokingApi(),
    new ProductApi()
    // new UsersRoute(),
    // new AuthRoute(),
]);

app.listen();
