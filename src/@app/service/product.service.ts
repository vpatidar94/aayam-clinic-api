import { OrgCodeNoDto, PRODUCT_STATUS, ProductVo } from "aayam-clinic-core";
import { MetaOrgService } from "../../@shared/service/meta-org.service";
import { OrgService } from "../../@shared/service/org.service";
import { PREFIX } from "../../@shared/const/prefix-suffix";
import productModel from "../../@app/model/product.model";

export class ProductService {
  public product = productModel;

  /* ************************************* Public Methods ******************************************** */
  public addUpdateProduct = async (
    product: ProductVo
  ): Promise<ProductVo | null> => {
    try {
      product.name = product.name?.toUpperCase();
      if (product._id) {
        return await productModel.findByIdAndUpdate(product._id, product);
      } else {
        const productExist = await this.product.exists({ name: product.name, orgId: product.orgId, brId: product.brId });
        if (productExist) {
          return null;
        }
        const nextProductNo = await this._getNextProductNo(product);
        const orgDetails = await new OrgService().getOrgById(product.orgId);
        const servcieTypeCode = await this._getNewProductCode(nextProductNo.productNo, orgDetails?.codeSuffix as string);
        product.code = servcieTypeCode;
        await new MetaOrgService().updateCodeNo(product.orgId, nextProductNo);
        product.del = false;
        product.status = PRODUCT_STATUS.ACTIVE;
        return await productModel.create(product);
      }
    } catch (error) {
      throw error;
    }
  };

  public getProductsByOrgId = async (orgId: string): Promise<Array<ProductVo> | null> => {
    return await this.product.find({ orgId }) as Array<ProductVo>;
  };



  /* ************************************* Private Methods ******************************************** */
  private _getNextProductNo = async (product: ProductVo): Promise<OrgCodeNoDto> => {
    const nextProductNo = {} as OrgCodeNoDto;
    const lastProductOrder = await new MetaOrgService().getLastCodeNo(product.orgId);
    nextProductNo.productNo = lastProductOrder.productNo + 1;
    return nextProductNo;
  }

  private _getNewProductCode = async (nextProductNo: number, codeSuffix: string) => {
    const productNo = String(nextProductNo).padStart(5, '0');
    const productPrefix = PREFIX.PRODUCT;
    return productPrefix.concat(codeSuffix).concat(productNo);
  }
}
