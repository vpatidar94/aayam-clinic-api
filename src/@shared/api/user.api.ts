import { JwtClaimDto, UserAccessDetailDto, UserAccountVo, UserEmpDto, UserVo, ROLE, AssetUploadDto, AssetPathUtility } from 'aayam-clinic-core';
import { Request, Response, Router } from 'express';
import { URL } from '../const/url';
import { Route } from '../interface/route.interface';
import authMiddleware from "../middleware/auth.middleware";
import { UserService } from '../service/user.service';
import { ResponseUtility } from '../utility/response.utility';
import { upload } from '../../@shared/service/multer.service';
import { UploadService } from '../../@shared/service/upload.service';
import { GetImageService } from '../../@shared/service/get-image.service';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

class UserApi implements Route {
    public path = URL.MJR_USER;
    public router = Router();

    private userService = new UserService();
    private uploadService = new UploadService();
    private getImageService = new GetImageService();
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

        this.router.delete(`${this.path}${URL.DELETE}`, authMiddleware, (req: Request, res: Response) => {
            (async () => {
                try {
                    const orgId = req.query?.orgId as string;
                    const userId = req.query?.userId as string;
                    await this.userService.removeOrgUser(orgId, userId);
                    ResponseUtility.sendSuccess(res, null, 'User deleted successfully');
                } catch (error) {
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

        this.router.post(`${this.path}${URL.USER_ACCOUNT_ADD_UPDATE}`, authMiddleware, (req: Request, res: Response) => {
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
                        ResponseUtility.sendFailResponse(res, null, "User Account already exists");
                        return;
                    }
                    ResponseUtility.sendSuccess(res, user);
                } catch (error) {
                    ResponseUtility.sendFailResponse(res, error);
                }
            })();
        }
        );

        this.router.get(`${this.path}${URL.USER_ACCOUNT_DETAILS}`, authMiddleware, (req: Request, res: Response) => {
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

        // THIS API IS TO UPLOAD IMAGES IN THE DIGITAL OCEAN IN THE FOLDER OBSERVATION AND UNDER THAT FOLDER VISITID AND THEN UNDER THAT ALL PHOTOS OF THAT VISIT ID IS THERE
        this.router.post(`${this.path}/upload-observation-images`, this.singleUploadImage, async (req: Request, res: Response) => {
            try {
                const body = req.body as AssetUploadDto;
                const fileName = req.body.fileName as string; // Get the unique file name
                if (!req.file?.buffer) {
                    ResponseUtility.sendFailResponse(res, "File not found");
                    return;
                }
                // const path = await this.uploadService.uploadMedia(AssetPathUtility.getPath(body.assetIdentity, body.assetId) + '.png', req.file.buffer);
                const path = await this.uploadService.uploadMedia(`OBSERVATION/${body.assetId}/${fileName}`, req.file.buffer);

                // await this.userService.updateUserImgPath(body, path);
                ResponseUtility.sendSuccess(res, path);
            } catch (error) {
                ResponseUtility.sendFailResponse(res, error);
            }
        });



        // THE BELOW API IS TO GET ALL IMAGES OF PARTICULAR VISIT ID FROM THE DIGITAL OCEAN FOLDER NAME OBSERVATION
        this.router.get(`${this.path}/list-images`, (req: Request, res: Response) => {
            (async () => {
                const folder = req.query.folder as string;
                if (!folder) {
                    return res.status(400).send('Folder query parameter is required');
                }

                try {
                    const images = await this.getImageService.listImages(folder);
                    res.status(200).json(images);
                } catch (error) {
                    console.error(error);
                    res.status(500).send('Failed to list images');
                }
            })()
        });


        // THE BELOW API IS TO DELETE THE PARTICULAR IMAGE FROM THE DIGITAL OCEAN
        this.router.delete(`${this.path}/delete-image`, (req: Request, res: Response) => {
            (async () => {
            const key = req.query.key as string;
            if (!key) {
                return res.status(400).send('Key query parameter is required');
            }

            try {
                await this.getImageService.deleteImage(key);
                res.status(200).send('Image deleted successfully');
            } catch (error) {
                console.error(error);
                res.status(500).send('Failed to delete image');
            }
        })()
    });




        this.router.get(`${this.path}${URL.SEND_OTP}`, async (req: Request, res: Response) => {
            try {
                const empCode = req.query.empCode as string;
                const sent = await this.userService.sendOtp(empCode);
                ResponseUtility.sendSuccess(res, sent);
            } catch (error) {
                ResponseUtility.sendFailResponse(res, error);
            }
        });

        this.router.get(`${this.path}${URL.RESET_PASSWORD_LINK}`, async (req: Request, res: Response) => {
            try {
                const empCode = req.query.empCode as string;
                const otp = req.query.otp as string;

                const link = await this.userService.getPasswordResetLink(empCode, otp);
                if (!link) {
                    ResponseUtility.sendFailResponse(res, 'Invalid OTP');
                }
                ResponseUtility.sendSuccess(res, link);
            } catch (error) {
                ResponseUtility.sendFailResponse(res, error);
            }
        });
    }
}
export default UserApi;
