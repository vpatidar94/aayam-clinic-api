
const ENV_URL = ''; // producation fn

const BASE = ENV_URL + '/api';// + '/api/edu/v1';
const BASE_CORE = ENV_URL + '/core/v1';

// Common operations
const PARTLY_UPDATE = '/partly-update';
const ADD_UPDATE = '/add-update';
const ADD_UPDATE_ALL = '/add-update-all';
const DELETE = '/delete';
const LIST = '/list';
const DETAIL = '/detail';

// ************************************************************************************************
// ***************************************          CORE          **********************************
// ************************************************************************************************
// major operations  api/...
/**
 * END_POINT URL
 */
export const URL = {
  ADD_UPDATE,
  LIST,

  MJR_TX: BASE_CORE + "/tx",
  MJR_VEHICLE: BASE_CORE + "/vehicle",
  MJR_USER: BASE_CORE + "/user",
  MJR_AUTH: BASE_CORE + "/auth",
  MJR_ORG: BASE_CORE + "/org",
  MJR_SERVICE_ITEM: BASE_CORE + "/service-item",

  VEHICLE_LIST: LIST,
  // ORDER: MJR_TX + '/order',
  // TX_HISTORY: MJR_TX + '/history',
  ORDER_ALL: "/order-all",
  ORDER_BY_NAME: "/order-by-name",

  LOGIN: "/login",
  CHANGE_PASSWORD: "/update-password",

  EMP_ADD_UPDATE: "/emp-add-update",
  CUST_ADD_UPDATE: "/cust-add-update",
  STAFF_LIST: "/staff-list",
  CUST_LIST: "/cust-list",
  STAFF_ADD_UPDATE: "/staff-add-update",
  ACCESS_LIST: "/access-list",
};
