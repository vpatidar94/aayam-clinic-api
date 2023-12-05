import { Router, NextFunction, Request, Response } from 'express';
import { Route } from '../../@shared/interface/route.interface';
import userModel from '../../@shared/model/users.model';
import { UserEmpDto, UserVo } from 'aayam-clinic-core';
import { UserService } from '../../@shared/service/user.service';

class IndexApi implements Route {
  public path = '/';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, async (req: Request, res: Response, next: NextFunction) => {
      const user: UserVo | null = await userModel.findById('65697f2f6c098a251899e87f');
      if (user) {
        const dto = new UserEmpDto(user, user.emp['CLINIC']);
        await new UserService().saveStaff(dto);
      }
      try {
        res.status(200).json({
          "xx": user
        });
      } catch (error) {
        next(error);
      }
    });
  }
}

export default IndexApi;
