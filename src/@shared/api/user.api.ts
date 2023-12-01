import { JwtClaimDto, UserAccessDetailDto, UserAccountVo, UserEmpDto, UserVo, ROLE, AssetUploadDto, AssetPathUtility } from 'aayam-clinic-core';
import { Request, Response, Router } from 'express';
import { AuthUtility } from '../../@shared/utility/auth.utility';
import { URL } from '../const/url';
import { Route } from '../interface/route.interface';
import authMiddleware from "../middleware/auth.middleware";
import { UserService } from '../service/user.service';
import { ResponseUtility } from '../utility/response.utility';
import { upload } from '../../@shared/service/multer.service';
import { UploadService } from '../../@shared/service/upload.service';

class UserApi implements Route {
    public path = URL.MJR_USER;
    public router = Router();

    private userService = new UserService();
    private uploadService = new UploadService();
    private singleUploadImage = upload.single('file');

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {

        // /api/core/v1/user/app-update
        // Not used
        // this.router.post(`${this.path}${URL.ADD_UPDATE}`, authMiddleware, async (req: Request, res: Response) => {
        //     try {
        //         const user = await this.userService.saveUser(req.body as UserVo);
        //         if (!user) {
        //             ResponseUtility.sendFailResponse(res, null, 'User already exists');
        //             return;
        //         }
        //         ResponseUtility.sendSuccess(res, user);
        //     } catch (error) {
        //         ResponseUtility.sendFailResponse(res, error);
        //     }
        // });

        // Can be update by Admin and superadmin of that org
        this.router.post(`${this.path}${URL.STAFF_ADD_UPDATE}`, authMiddleware, (req: Request, res: Response) => {
            (async () => {
                try {
                    const body = req.body as UserEmpDto;
                    const claim = res.locals?.claim as JwtClaimDto;
                    // if (!AuthUtility.hasOrgAccess(claim, body?.acl?.orgId)) {
                    //     ResponseUtility.sendFailResponse(res, null, 'Unauthorized');
                    //     return;
                    // }
                    const user = await this.userService.saveStaff(body);
                    if (!user) {
                        ResponseUtility.sendFailResponse(res, null, 'User already exists');
                        return;
                    }
                    ResponseUtility.sendSuccess(res, user);
                } catch (error) {
                    ResponseUtility.sendFailResponse(res, error);
                }
            })();
        });

        this.router.get(`${this.path}${URL.STAFF_LIST}`, authMiddleware, (req: Request, res: Response) => {
            (async () => {
                try {
                    const claim = res.locals?.claim as JwtClaimDto;
                    // if (!AuthUtility.hasOrgAccess(claim, req.query?.orgId as string)) {
                    //     ResponseUtility.sendFailResponse(res, null, 'Unauthorized');
                    //     return;
                    // }
                    const userList: Array<UserVo> | null = await this.userService.getOrgUserList(req.query?.orgId as string);
                    ResponseUtility.sendSuccess(res, userList);
                } catch (error) {
                    console.log('xxx xx x error ', error);
                    ResponseUtility.sendFailResponse(res, error);
                }
            })();
        });

        this.router.get(`${this.path}${URL.STAFF_SUBROLE_LIST}`, authMiddleware, (req: Request, res: Response) => {
            (async () => {
                try {
                    const claim = res.locals?.claim as JwtClaimDto;
                    // if (!AuthUtility.hasOrgEmpAccess(claim, req.query?.orgId as string)) {
                    //     ResponseUtility.sendFailResponse(res, null, 'Unauthorized');
                    //     return;
                    // }
                    const subRole = req.query.subRole as string;
                    const userList: Array<UserVo> | null = await this.userService.getOrgUserListBySubRole(req.query?.orgId as string, subRole);
                    ResponseUtility.sendSuccess(res, userList);
                } catch (error) {
                    ResponseUtility.sendFailResponse(res, error);
                }
            })();
        });

        // /api/core/v1/user/dept-doc-list
        this.router.get(`${this.path}${URL.DEPT_DOC_LIST}`, authMiddleware, (req: Request, res: Response) => {
            (async () => {
                try {
                    const claim = res.locals?.claim as JwtClaimDto;
                    // if (!AuthUtility.hasOrgEmpAccess(claim, req.query?.orgId as string)) {
                    //     ResponseUtility.sendFailResponse(res, null, 'Unauthorized');
                    //     return;
                    // }
                    const departmentId = req.query.departmentId as string;
                    const userList: Array<UserVo> | null = await this.userService.getOrgDeptDocList(req.query?.orgId as string, departmentId);
                    ResponseUtility.sendSuccess(res, userList);
                } catch (error) {
                    ResponseUtility.sendFailResponse(res, error);
                }
            })();
        });

        this.router.get(`${this.path}${URL.ACCESS_LIST}`, authMiddleware, (req: Request, res: Response) => {
            (async () => {
                try {
                    const claim = res.locals?.claim as JwtClaimDto;
                    const accessList: UserAccessDetailDto | null = await this.userService.getUserAllAccessList(claim);
                    ResponseUtility.sendSuccess(res, accessList);
                } catch (error) {
                    ResponseUtility.sendFailResponse(res, error);
                }
            })();
        });

        this.router.post(`${this.path}${URL.USER_ACCOUNT_ADD_UPDATE}`,authMiddleware,(req: Request, res: Response) => {
            (async () => {
              try {
                const body = req.body as UserAccountVo;
                const claim = res.locals?.claim as JwtClaimDto;
                // if (claim?.userAccess?.role !== ROLE.SUPER_ADMIN && claim?.userAccess?.role !== ROLE.ADMIN) {
                //   ResponseUtility.sendFailResponse(res, null, "Not permitted");
                //   return;
                // }
                const user = await this.userService.saveUserAccount(body);
                if (!user) {
                  ResponseUtility.sendFailResponse(res,null,"User Account already exists");
                  return;
                }
                ResponseUtility.sendSuccess(res, user);
              } catch (error) {
                ResponseUtility.sendFailResponse(res, error);
              }
            })();
          }
        );

        this.router.get(`${this.path}${URL.USER_ACCOUNT_DETAILS}`,authMiddleware,(req: Request, res: Response) => {
            (async () => {
              try {
                const claim = res.locals?.claim as JwtClaimDto;
                // if (claim?.userAccess?.role !== ROLE.SUPER_ADMIN && claim?.userAccess?.role !== ROLE.ADMIN) {
                //   ResponseUtility.sendFailResponse(res, null, "Not permitted");
                //   return;
                // }
                const accessList: UserAccountVo | null = await this.userService.getUserAccountDetail(req.query?.userId as string);
                ResponseUtility.sendSuccess(res, accessList);
              } catch (error) {
                ResponseUtility.sendFailResponse(res, error);
              }
            })();
          }
        );

        this.router.post(`${this.path}${URL.USER_ASSET_UPLOAD}`, this.singleUploadImage, async (req: Request, res: Response) => {
            try {
                const body = req.body as AssetUploadDto;
                if (!req.file?.buffer) {
                    ResponseUtility.sendFailResponse(res, "File not found");
                    return;
                }
                const path = await this.uploadService.uploadMedia(AssetPathUtility.getPath(body.assetIdentity, body.assetId) + '.png', req.file.buffer);
                await this.userService.updateUserImgPath(body, path);
                ResponseUtility.sendSuccess(res, path);
            } catch (error) {
                ResponseUtility.sendFailResponse(res, error);
            }
        });
    }
}
export default UserApi;
