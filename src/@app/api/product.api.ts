import { ProductVo, ROLE } from "aayam-clinic-core";
import { Request, Response, Router } from "express";
import { URL } from "../../@shared/const/url";
import { Route } from "../../@shared/interface/route.interface";
import authMiddleware from "../../@shared/middleware/auth.middleware";
import { ResponseUtility } from "../../@shared/utility/response.utility";
import { ProductService } from "../../@app/service/product.service";

class ProductApi implements Route {
  public path = URL.MJR_PRODUCT;
  public router = Router();

  private productService = new ProductService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // /api/core/v1/product/add-update
    this.router.post(
      `${this.path}${URL.ADD_UPDATE}`,
      authMiddleware,
      (req: Request, res: Response) => {
        (async () => {
          try {
            if (
              res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN &&
              res.locals?.claim?.userAccess?.role !== ROLE.ADMIN
            ) {
              ResponseUtility.sendFailResponse(res, null, "Not permitted");
              return;
            }
            const product = await this.productService.addUpdateProduct(
              req.body as ProductVo
            );
            if (!product) {
              ResponseUtility.sendFailResponse(
                res,
                null,
                "Product Name not available"
              );
              return;
            }
            ResponseUtility.sendSuccess(res, product);
          } catch (error) {
            ResponseUtility.sendFailResponse(res, error);
          }
        })();
      }
    );

    // /api/core/v1/product/list
    this.router.get(
      `${this.path}${URL.LIST}`,
      authMiddleware,
      (req: Request, res: Response) => {
        (async () => {
          try {
            if (
              res.locals?.claim?.userAccess?.role !== ROLE.SUPER_ADMIN &&
              res.locals?.claim?.userAccess?.role !== ROLE.ADMIN
            ) {
              ResponseUtility.sendFailResponse(res, null, "Not permitted");
              return;
            }
            const list: Array<ProductVo> | null =
              await this.productService.getProductsByOrgId(
                req.query.orgId as string
              );
            ResponseUtility.sendSuccess(res, list);
          } catch (error) {
            ResponseUtility.sendFailResponse(res, error);
          }
        })();
      }
    );
  }
}
export default ProductApi;
