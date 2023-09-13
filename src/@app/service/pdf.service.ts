
import {
} from "aayam-clinic-core";
import { BookingService } from "./booking.service";
import { OrgService } from "../../@shared/service/org.service";
import { PdfkitService } from "./pdfkit.service";
import { UserService } from "../../@shared/service/user.service";
import doc from "pdfkit";


export class PdfService {
  bookingService = new BookingService();
  orgService = new OrgService();
  pdfkitService = new PdfkitService();
  userService = new UserService()

  /* ************************************* Public Methods ******************************************** */

  public createOrderReceipt =  async (bookingId: string): Promise<any> => {
    try {
       const bookingDetails = await this.bookingService.getBookingDetails(bookingId);
       const orgDetails = await this.orgService.getOrgById(bookingDetails.orgId);
       const userDetails = await this.userService.getUserById(bookingDetails.user);
      
        let pdf = this.pdfkitService.createNewDoc(`RECEIPT_${bookingDetails.no}`);
        
        pdf = this.pdfkitService.addTextCenter(pdf,20,orgDetails?.name as string);
        const address = orgDetails?.address?.city || ""  + ", " + orgDetails?.address?.district || "" + ", " + orgDetails?.address?.state || ""   + ", " + orgDetails?.address?.country || ""   ;
        pdf = this.pdfkitService.addTextCenter(pdf,10,address);

        pdf = this.pdfkitService.addLine(pdf,0.5);

        //user details 
        // Define key-value pairs
        const dob = userDetails?.doB.getDate() + "-" + userDetails?.doB.getMonth() + "-" + userDetails?.doB.getFullYear();
        const userDetailsList = [
          { key: "First Name", value: userDetails?.nameF || ""},
          { key: "Last Name", value: userDetails?.nameL || "" },
          { key: "Father Name", value: userDetails?.fatherName || "" },
          { key: "Phone", value: userDetails?.cell || ""},
          { key: "Email", value: userDetails?.email2 || " " },
          { key: "DOB", value: dob || "" },
          { key: "Gender", value: userDetails?.gender || "" },
          { key: "Age", value: userDetails?.age || "" }
        ];

        bookingDetails?.observation?.healthParams?.forEach(param => {
          const row = {
                        key : param.name as string, 
                        value : param.value as string
                      };
          userDetailsList.push(row);
        });

        pdf = this.pdfkitService.addKeyValuePair(pdf,userDetailsList);
        //invoice heading
        // Add a heading after the line with centered alignment
        pdf = this.pdfkitService.addLine(pdf,0.5);
        pdf.moveDown();
        pdf = this.pdfkitService.addTextCenter(pdf,20,"INVOICE");
        pdf = this.pdfkitService.addLine(pdf,0.5);


        // Define the table content manually
        const tableHeaders = ['','Service/Package', 'Qty', 'Amount'];
        let tableRows = [] as string[][];
        const items = bookingDetails.items;
        let i = 1;
        items.forEach(element => {
          const row = [i,element.name,element.qty,element.amount];
          tableRows.push(row as string[]);
        });
        const totalDue = bookingDetails.totalDue as unknown as string;
        tableRows.push(['','','Total Amount', totalDue]);
        pdf = this.pdfkitService.createTable(pdf,tableHeaders,tableRows);
        const inWordsAmount = this.numberToWords(bookingDetails.totalPaid);

        pdf = this.pdfkitService.addTextCenter(pdf,10,`RECEIVED SUM OF RS ${bookingDetails.totalPaid} [IN WORDS : ${inWordsAmount}] ON ACCOUNT OF ${orgDetails?.name}`);



        pdf = this.pdfkitService.addLine(pdf,0.5);
        pdf.moveDown();

        pdf = this.pdfkitService.addTextRight(pdf,14,`Paid :           ${bookingDetails.totalPaid}`);

        pdf = this.pdfkitService.addLine(pdf,0.5);
        pdf.moveDown();
        const now = new Date();
        pdf = this.pdfkitService.addTextLeft(pdf,10,"Print Date Time  : " + now.toLocaleString());
        pdf.y = pdf.y - 10;
        pdf = this.pdfkitService.addTextRight(pdf,10, `for ${orgDetails?.name}`);
        pdf.moveDown();
        pdf = this.pdfkitService.addTextLeft(pdf,10,`Subject to ${orgDetails?.address?.city} Juridiction`);
        pdf.y = pdf.y - 10;
        pdf = this.pdfkitService.addTextRight(pdf,12, userDetails?.nameF + " " + userDetails?.nameL);
        pdf = this.pdfkitService.addLine(pdf, 0.5);
        pdf.moveDown();

        pdf = this.pdfkitService.addTextCenter(pdf,10,`All Payments Made by Cheque/DD to be in favour of ${orgDetails?.name}`);

        pdf = this.pdfkitService.addLine(pdf, 0.2);
        pdf.moveDown();

        // Define the list items
        const listItems = [
          'Cultural Report : After 2-3 days enquire',
          'Outside Report : No same day gaurantee',
        ];
        pdf =  this.pdfkitService.createList(pdf,listItems,"Note :")
        pdf.moveDown();
        // Finalize the PDF
        // pdf.end();

        

       
       return pdf;
    } catch (error) {
      console.log(error);
      
      return error;
    }
  };

  private numberToWords(num: number): string {
  const units = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];
  const teens = ["", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
  const tens = ["", "TEN", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
  const thousands = ["", "THOUSAND", "MILLION", "BILLION", "TRILLION"];

  function convertLessThanOneThousand(num: number): string {
    if (num === 0) {
      return "";
    } else if (num < 10) {
      return units[num];
    } else if (num < 20) {
      return teens[num - 10];
    } else if (num < 100) {
      const ten = Math.floor(num / 10);
      const remainder = num % 10;
      return tens[ten] + (remainder !== 0 ? " " + units[remainder] : "");
    } else {
      const hundred = Math.floor(num / 100);
      const remainder = num % 100;
      return units[hundred] + " HUNDRED" + (remainder !== 0 ? " AND " + convertLessThanOneThousand(remainder) : "");
    }
  }

  function convert(num: number): string {
    if (num === 0) {
      return "ZERO";
    }

    let result = "";
    let chunkIndex = 0;

    while (num > 0) {
      const chunk = num % 1000;
      if (chunk !== 0) {
        result = convertLessThanOneThousand(chunk) + " " + thousands[chunkIndex] + " " + result;
      }
      num = Math.floor(num / 1000);
      chunkIndex++;
    }

    return result.trim();
  }

  return convert(num) + " RUPEES ONLY";
}
  /* ************************************* Private Methods ******************************************** */
  
}
