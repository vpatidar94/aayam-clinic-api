
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
// ***************************************          CORE          *********************************
// ************************************************************************************************
// major operations  api/...
/**
 * END_POINT URL
 */
export const URL = {
  ADD_UPDATE,
  LIST,
  DELETE,

  MJR_TX: BASE_CORE + "/tx",
  MJR_VEHICLE: BASE_CORE + "/vehicle",
  MJR_USER: BASE_CORE + "/user",
  MJR_AUTH: BASE_CORE + "/auth",
  MJR_ORG: BASE_CORE + "/org",
  MJR_BOOKING: BASE_CORE + "/booking",
  MJR_SERVICE_ITEM: BASE_CORE + "/service-item",
  MJR_PRODUCT: BASE_CORE + "/product",
  MJR_INVESTIGATION: BASE_CORE + "/investigation",
  MJR_PHARMACY: BASE_CORE + "/pharmacy",

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
  STAFF_SUBROLE_LIST: "/staff-subrole-list",
  DEPT_DOC_LIST: "/dept-doc-list",
  CUST_LIST: "/cust-list",
  STAFF_ADD_UPDATE: "/staff-add-update",
  ACCESS_LIST: "/access-list",

  LIST_BY_ORG: "/list-by-org",
  LAST_ORDER_NO: "/last-order-no",

  DEPARTMENT_ADD_UPDATE: "/department-add-update",
  DEPARTMENT_LIST: "/department-list",
  DEPARTMENT_DELETE: "/department-delete",
  DEPARTMENT_ACTIVE_INACTIVE: "/department-active-inactive",

  USER_TYPE_ADD_UPDATE: "/user-type-add-update",
  USER_TYPE_LIST: "/user-type-list",
  USER_TYPE_DELETE: "/user-type-delete",
  USER_TYPE_ACTIVE_INACTIVE: "/user-type-active-inactive",

  USER_ACCOUNT_ADD_UPDATE: "/user-account-add-update",
  USER_ACCOUNT_DETAILS: "/user-account-details",

  SERVICE_TYPE_ADD_UPDATE: "/service-type-add-update",
  SERVICE_TYPE_LIST: "/service-type-list",
  SERVICE_TYPE_DELETE: "/service-type-delete",
  SERVICE_TYPE_ACTIVE_INACTIVE: "/service-type-active-inactive",

  TRANSACTION_ADD_UPDATE: "/transaction-add-update",
  RECEIPT_CREATE: "/receipt-create",
  CONVERT_PATIENT: "/convert-patient",
  
  ORDER_ADD_UPDATE: "/order-add-update",
  ORDER_LIST: "/order-list",
  ORDER_LIST_BY_ORG: "/order-list-by-org",

  INVESTIGATION_PARAM_LIST: "/param-list",
  INVESTIGATION_PATIENT_LIST: "/patient-list",

  USER_ASSET_UPLOAD: "/upload-user-asset",
  ORG_ASSET_UPLOAD: "/upload-org-asset",
  SEND_OTP: "/send-otp",
  RESET_PASSWORD_LINK: "/reset-password-link",

  INVESTIGATION_LIST: "/investigation-list",

  // newly added to search whole table
  SEARCH_BOOKINGS: "/search-booking"

};
