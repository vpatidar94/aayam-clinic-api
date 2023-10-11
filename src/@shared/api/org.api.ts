import { OrgVo, DepartmentVo, ROLE, DEPT_STATUS, UserTypeVo, USER_TYPE_STATUS, UserTypeDetailDto } from 'aayam-clinic-core';
import { Request, Response, Router } from 'express';
import { URL } from '../const/url';
import { Route } from '../interface/route.interface';
import { ResponseUtility } from '../utility/response.utility';
import { OrgService } from '../../@shared/service/org.service';
import authMiddleware from '../../@shared/middleware/auth.middleware';
import { MetaOrgService } from '../../@shared/service/meta-org.service';

class OrgApi implements Route {
  public path = URL.MJR_ORG;
  public router = Router();

  private orgService = new OrgService();
  private metaOrgService = new MetaOrgService();


  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    // /api/core/v1/org/add-update
    this.router.post(`${this.path}${URL.ADD_UPDATE}`, authMiddleware, (req: Request, res: Response) => {
      (
        async () => {
          try {
            if (res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) {
              ResponseUtility.sendFailResponse(res, null, 'You are not authorized to create Org');
              return;
            }
            const org = await this.orgService.addUpdateOrg(req.body as OrgVo);
            if (!org) {
              ResponseUtility.sendFailResponse(res, null, 'Org Name not available');
              return;
            }
            ResponseUtility.sendSuccess(res, org);
          } catch (error) {
            ResponseUtility.sendFailResponse(res, error);
          }
        }
      )();
    });

    // /api/core/v1/org/list
    this.router.get(`${this.path}${URL.LIST}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          if (res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) {
            ResponseUtility.sendFailResponse(res, null, 'Not permitted');
            return;
          }
          const orgList: Array<OrgVo> = await this.orgService.getAll();
          ResponseUtility.sendSuccess(res, orgList);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    });

    // /api/core/v1/org//last-order-no
    this.router.get(`${this.path}${URL.LAST_ORDER_NO}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          const orgOrderNoDto = await this.metaOrgService.getLastOrderNo(req.query.orgId as string);
          ResponseUtility.sendSuccess(res, orgOrderNoDto);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    });

    // /api/core/v1/org/department-add-update
    this.router.post(`${this.path}${URL.DEPARTMENT_ADD_UPDATE}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          console.log(res.locals?.claim?.userAccess?.role);

          if ((res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) && (res.locals?.claim?.userAccess?.role !== ROLE.ADMIN)) {
            ResponseUtility.sendFailResponse(res, null, 'Not permitted');
            return;
          }
          const department = await this.orgService.addUpdateDepartment(req.body as DepartmentVo);
          if (!department) {
            ResponseUtility.sendFailResponse(res, null, "Department Name not available");
            return;
          }
          ResponseUtility.sendSuccess(res, department);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    }
    );

    // /api/core/v1/org/department-list
    this.router.get(`${this.path}${URL.DEPARTMENT_LIST}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          if ((res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) && (res.locals?.claim?.userAccess?.role !== ROLE.ADMIN)) {
            ResponseUtility.sendFailResponse(res, null, 'Not permitted');
            return;
          }
          const userList: Array<DepartmentVo> | null = await this.orgService.getOrgDepartmentList(req.query?.orgId as string, req.query?.type as string ?? null);
          ResponseUtility.sendSuccess(res, userList);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    });

    // /api/core/v1/org/department-delete
    this.router.get(`${this.path}${URL.DEPARTMENT_DELETE}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          if ((res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) && (res.locals?.claim?.userAccess?.role !== ROLE.ADMIN)) {
            ResponseUtility.sendFailResponse(res, null, 'Not permitted');
            return;
          }
          const department = await this.orgService.getDepartmentById(req.query?.departmentId as string);
          if (!department || department.del) {
            ResponseUtility.sendFailResponse(res, null, "Department not available");
            return;
          }
          department.del = true;
          const update = await this.orgService.addUpdateDepartment(department);
          ResponseUtility.sendSuccess(res, update);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    }
    );

    // /api/core/v1/org/department-active-inactive
    this.router.get(`${this.path}${URL.DEPARTMENT_ACTIVE_INACTIVE}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          if ((res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) && (res.locals?.claim?.userAccess?.role !== ROLE.ADMIN)) {
            ResponseUtility.sendFailResponse(res, null, 'Not permitted');
            return;
          }
          const department = await this.orgService.getDepartmentById(req.query?.departmentId as string);
          if (!department || department.del) {
            ResponseUtility.sendFailResponse(res, null, "Department not available");
            return;
          }
          department.status = department.status == DEPT_STATUS.ACTIVE ? DEPT_STATUS.INACTIVE : DEPT_STATUS.ACTIVE;
          const update = await this.orgService.addUpdateDepartment(department);
          ResponseUtility.sendSuccess(res, update);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    }
    );

    // /api/core/v1/org/user-type-add-update
    this.router.post(`${this.path}${URL.USER_TYPE_ADD_UPDATE}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          if ((res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) && (res.locals?.claim?.userAccess?.role !== ROLE.ADMIN)) {
            ResponseUtility.sendFailResponse(res, null, 'Not permitted');
            return;
          }
          const userType = await this.orgService.addUpdateUserType(req.body as UserTypeVo);
          if (!userType) {
            ResponseUtility.sendFailResponse(res, null, "UserType Name not available");
            return;
          }
          ResponseUtility.sendSuccess(res, userType);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    }
    );

    // /api/core/v1/org/user-type-list
    this.router.get(`${this.path}${URL.USER_TYPE_LIST}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          if ((res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) && (res.locals?.claim?.userAccess?.role !== ROLE.ADMIN)) {
            ResponseUtility.sendFailResponse(res, null, 'Not permitted');
            return;
          }
          const userList: Array<UserTypeDetailDto> | null = await this.orgService.getOrgUserTypeList(req.query?.orgId as string);
          ResponseUtility.sendSuccess(res, userList);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    });

    // /api/core/v1/org/user-type-delete
    this.router.get(`${this.path}${URL.USER_TYPE_DELETE}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          if ((res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) && (res.locals?.claim?.userAccess?.role !== ROLE.ADMIN)) {
            ResponseUtility.sendFailResponse(res, null, 'Not permitted');
            return;
          }
          const userType = await this.orgService.getUserTypeById(req.query?.userTypeId as string);
          if (!userType || userType.del) {
            ResponseUtility.sendFailResponse(res, null, "UserType not available");
            return;
          }
          userType.del = true;
          const update = await this.orgService.addUpdateUserType(userType);
          ResponseUtility.sendSuccess(res, update);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    }
    );

    // /api/core/v1/org/user-type-active-inactive
    this.router.get(`${this.path}${URL.USER_TYPE_ACTIVE_INACTIVE}`, authMiddleware, (req: Request, res: Response) => {
      (async () => {
        try {
          if ((res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN) && (res.locals?.claim?.userAccess?.role !== ROLE.ADMIN)) {
            ResponseUtility.sendFailResponse(res, null, 'Not permitted');
            return;
          }
          const userType = await this.orgService.getUserTypeById(req.query?.userTypeId as string);
          if (!userType || userType.del) {
            ResponseUtility.sendFailResponse(res, null, "UserType not available");
            return;
          }
          userType.status = userType.status == USER_TYPE_STATUS.ACTIVE ? USER_TYPE_STATUS.INACTIVE : USER_TYPE_STATUS.ACTIVE;
          const update = await this.orgService.addUpdateUserType(userType);
          ResponseUtility.sendSuccess(res, update);
        } catch (error) {
          ResponseUtility.sendFailResponse(res, error);
        }
      })();
    }
    );

  }
}
export default OrgApi;
