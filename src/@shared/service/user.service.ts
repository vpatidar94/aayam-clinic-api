import {
    AclCustVo,
    AclVo,
    CustTypeVo,
    EmpDepartmentVo,
    JwtClaimDto,
    ROLE,
    StringUtility,
    UserAccessDto,
    UserAuthVo,
    UserCustTypeDto,
    UserEmpDepartmentDto,
    UserPasswordDto,
    UserVo
} from "aayam-clinic-core";
import userModel from '../model/users.model';
import userAuthModel from '../model/user-auth.model';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as dotenv from "dotenv";
import empDepartmentModel from "../model/emp-department.model";
import custTypeModel from "../model/cust-type.model";

export class UserService {
    public userAuth = userAuthModel;
    public user = userModel;

    /* ************************************* Public Methods ******************************************** */
    public saveUser = async (user: UserVo): Promise<UserVo | null> => {
        try {
            if (user._id) {
                if (user.email) {
                    delete user.email;
                }
                return await userModel.findByIdAndUpdate(user._id, user);
            } else {
                const userExist = await this.user.exists({email: user.email});
                if (userExist) {
                    return null;
                }
                await this._saveUserAuth(user);
                return await userModel.create(user);
            }
        } catch (error) {
            throw error;
        }
    };

    public addUpdateEmp = async (dto: UserEmpDepartmentDto): Promise<UserEmpDepartmentDto | null> => {
        try {
            const emp = {} as UserEmpDepartmentDto;
            emp.emp = dto.emp;
            emp.dept = dto.dept;
            emp.emp = await this.saveUser(emp.emp) ?? {} as UserVo;
            emp.dept = await this.addUpdateDept(emp.emp._id, emp.dept);
            return emp;
        } catch (error) {
            throw error;
        }
    };

    public addUpdateCustomer = async (dto: UserCustTypeDto): Promise<UserCustTypeDto | null> => {
        try {
            const customer = {} as UserCustTypeDto;
            customer.cust = dto.cust;
            customer.custType = dto.custType;
            customer.cust = await this.saveUser(customer.cust) ?? {} as UserVo;
            customer.custType = await this.addUpdateCustomerType(customer.cust._id, customer.custType);
            return customer;
        } catch (error) {
            throw error;
        }
    };

    public authenticate = async (email: string, password: string): Promise<UserAccessDto | null> => {
        try {
            if (email && password) {
                const auth: UserAuthVo | null = await this.userAuth.findOne({email});
                if (auth?._id) {
                    const isPasswordMatching: boolean = await bcrypt.compare(password, auth.password);
                    if (isPasswordMatching) {
                        const userAccessDto = {} as UserAccessDto;
                        if (auth?.passwordTemp) {
                            userAccessDto.changePassword = true;
                            userAccessDto.token = this._getTempToken(auth._id, email);
                        } else {
                            const user: UserVo | null = await this.user.findOne({email});
                            userAccessDto.token = this._getAccessToken(user);
                            userAccessDto.changePassword = false;
                        }
                        return userAccessDto;
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } catch (error) {
            throw error;
        }
    };

    public changeUserAuth = async (dto: UserPasswordDto, claim: any): Promise<boolean> => {
        try {
            const auth: UserAuthVo | null = await this.userAuth.findOne({email: dto.email});
            if (auth?._id?.valueOf()) {
                const isPasswordMatching: boolean = await bcrypt.compare(dto.oldPassword, auth.password);
                if (isPasswordMatching && claim._id === auth._id.valueOf()) {
                    const newPassword = await bcrypt.hash(dto.password.trim(), 3);
                    await this.userAuth.findByIdAndUpdate(auth._id, {password: newPassword, passwordTemp: false})
                    return true;
                } else {
                    return false;
                }
            }
            return false;
        } catch (e) {
            throw e;
        }
    };

    public getEmployeeList = async (): Promise<UserEmpDepartmentDto[]> => {
        try {
            const list = await this.user.aggregate([
                {
                    $match: {
                        emp: {
                            $elemMatch: {
                                role: ROLE.POS_EMP,
                                active: true
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "empdepartments",
                        localField: "_id",
                        foreignField: "userId",
                        as: "dept",
                    },
                },
                {
                    $unwind: {
                        path: '$dept',
                        "preserveNullAndEmptyArrays": true
                    }
                },
            ]).exec();
            const ret = [] as UserEmpDepartmentDto[];
            if (list?.length > 0) {
                list.forEach((it) => {
                    const row = it;
                    const dto = {} as UserEmpDepartmentDto;
                    dto.dept = row.dept ?? {} as EmpDepartmentVo;
                    delete row.dept;
                    dto.emp = row;
                    ret.push(dto);
                });
            }
            return ret;
        } catch (e) {
            throw e;
        }
    }

    public getCustomerList = async (): Promise<UserCustTypeDto[]> => {
        try {
            const list = await this.user.aggregate([
                {
                    $match: {
                        cust: {
                            $elemMatch: {
                                role: ROLE.POS_CUST,
                                active: true
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "cust_types",
                        localField: "_id",
                        foreignField: "userId",
                        as: "custType",
                    },
                },
                {
                    $unwind: {
                        path: '$custType',
                        "preserveNullAndEmptyArrays": true
                    }
                },
            ]).exec();
            const ret = [] as UserCustTypeDto[];
            if (list?.length > 0) {
                list.forEach((it) => {
                    const row = it;
                    const dto = {} as UserCustTypeDto;
                    dto.custType = row.custType ?? {} as CustTypeVo;
                    delete row.custType;
                    dto.cust = row;
                    ret.push(dto);
                });
            }
            return ret;
        } catch (e) {
            throw e;
        }
    }

    /* ************************************* Private Methods ******************************************** */
    private _saveUserAuth = async (user: UserVo): Promise<void> => {
        const userAuth = {} as UserAuthVo;
        const password = await bcrypt.hash(user.cell.trim(), 3);
        userAuth.email = user.email ?? '';
        userAuth.password = password;
        userAuth.passwordTemp = true;
        await userAuthModel.create(userAuth);
    }

    private _getTempToken(_id: string, email: string): string {
        dotenv.config();
        const secret = process.env.JWT_SECRET_PASSWORD as string;
        return jwt.sign({email, _id}, secret, {expiresIn: '1h'});
    }

    private _getAccessToken(user: UserVo | null): string {
        if (!user) {
            return '';
        }
        dotenv.config();
        const secret = process.env.JWT_SECRET as string;
        return jwt.sign(this._getJwtClaim(user), secret, {expiresIn: '5h'});
    }

    private _getJwtClaim(user: UserVo): JwtClaimDto {
        const dto = {} as JwtClaimDto;
        dto.iss = 'auth0';
        dto.aud = 'aayam-clinic-api';
        dto.crols = [];
        if (user.emp?.length > 0) {
            user.emp.forEach((u: AclVo) => {
                if (u.active) {
                    dto.crols.push(u.role ?? '');
                }
            });
        }
        if (user.cust?.length > 0) {
            user.cust.forEach((c: AclCustVo) => {
                if (c.active) {
                    dto.crols.push(c.role ?? '');
                }
            });
        }
        dto.name = StringUtility.concat(...[user.nameF ?? '', user.nameL ?? ''])
        dto.cuid = user._id;
        dto.email = user.email ?? '';
        dto.email_verified = true;
        dto.phone_number = user.cell;
        return dto;
    }

    private addUpdateDept = async (userId: string, dept: EmpDepartmentVo): Promise<any> => {
        if (dept._id) {
            return await empDepartmentModel.findByIdAndUpdate(dept._id, dept);
        } else {
            dept.userId = userId;
            return await empDepartmentModel.create(dept);
        }
    }

    private addUpdateCustomerType = async (userId: string, custType: CustTypeVo): Promise<any> => {
        if (custType._id) {
            return await custTypeModel.findByIdAndUpdate(custType._id, custType);
        } else {
            custType.userId = userId;
            return await custTypeModel.create(custType);
        }
    }
}