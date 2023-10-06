
import { TxVo } from "aayam-clinic-core";
import { BookingService } from "./booking.service";
import { OrgService } from "../../@shared/service/org.service";
import { PdfkitService } from "./pdfkit.service";
import { UserService } from "../../@shared/service/user.service";
import { Response } from "express";
import { PharmacyService } from "./pharmacy.service";


export class PdfService {
  bookingService = new BookingService();
  pharmacyService = new PharmacyService();
  orgService = new OrgService();
  pdfkitService = new PdfkitService();
  userService = new UserService()

  /* ************************************* Public Methods ******************************************** */

  public createOrderReceipt = async (bookingId: string, res: Response): Promise<any> => {
    try {
      const bookingDetails = await this.bookingService.getBookingDetails(bookingId);
      const orgDetails = await this.orgService.getOrgById(bookingDetails.orgId);
      const userDetails = await this.userService.getUserById(bookingDetails.user);

      let pdf = this.pdfkitService.createNewDoc(`RECEIPT_${bookingDetails.no}`);
      pdf.pipe(res);

      pdf = this.pdfkitService.addTextCenter(pdf, 20, orgDetails?.name as string);
      const address = orgDetails?.address?.city || "" + ", " + orgDetails?.address?.district || "" + ", " + orgDetails?.address?.state || "" + ", " + orgDetails?.address?.country || "";
      pdf = this.pdfkitService.addTextCenter(pdf, 10, address);

      pdf = this.pdfkitService.addLine(pdf, 0.5);

      //user details 
      // Define key-value pairs
      const dob = userDetails?.doB.getDate() + "-" + userDetails?.doB.getMonth() + "-" + userDetails?.doB.getFullYear();
      const userDetailsList = [
        { key: "First Name", value: userDetails?.nameF || "" },
        { key: "Last Name", value: userDetails?.nameL || "" },
        { key: "Father Name", value: userDetails?.fatherName || "" },
        { key: "Phone", value: userDetails?.cell || "" },
        { key: "Email", value: userDetails?.email2 || " " },
        { key: "DOB", value: dob || "" },
        { key: "Gender", value: userDetails?.gender || "" },
        { key: "Age", value: userDetails?.age || "" }
      ];

      bookingDetails?.observation?.healthParams?.forEach(param => {
        const row = {
          key: param.name as string,
          value: param.value as string
        };
        userDetailsList.push(row);
      });

      pdf = this.pdfkitService.addKeyValuePair(pdf, userDetailsList);
      //invoice heading
      // Add a heading after the line with centered alignment
      pdf = this.pdfkitService.addLine(pdf, 0.5);
      pdf.moveDown();
      pdf = this.pdfkitService.addTextCenter(pdf, 20, "INVOICE");
      pdf = this.pdfkitService.addLine(pdf, 0.5);


      // Define the table content manually
      const tableHeaders = ['', 'Service/Package', 'Qty', 'Amount'];
      let tableRows = [] as string[][];
      const items = bookingDetails.items;
      let i = 1;
      items.forEach(element => {
        const row = [i, element.name, element.qty, element.amount];
        tableRows.push(row as string[]);
      });
      const totalDue = bookingDetails.totalDue as unknown as string;
      tableRows.push(['', '', 'Total Amount', totalDue]);
      pdf = this.pdfkitService.createTable(pdf, tableHeaders, tableRows);
      const inWordsAmount = this.numberToWords(bookingDetails.totalPaid);

      pdf = this.pdfkitService.addTextCenter(pdf, 10, `RECEIVED SUM OF RS ${bookingDetails.totalPaid} [IN WORDS : ${inWordsAmount}] ON ACCOUNT OF ${orgDetails?.name}`);



      pdf = this.pdfkitService.addLine(pdf, 0.5);
      pdf.moveDown();

      pdf = this.pdfkitService.addTextRight(pdf, 14, `Paid :           ${bookingDetails.totalPaid}`);

      pdf = this.pdfkitService.addLine(pdf, 0.5);
      pdf.moveDown();
      const now = new Date();
      pdf = this.pdfkitService.addTextLeft(pdf, 10, "Print Date Time  : " + now.toLocaleString());
      pdf.y = pdf.y - 10;
      pdf = this.pdfkitService.addTextRight(pdf, 10, `for ${orgDetails?.name}`);
      pdf.moveDown();
      pdf = this.pdfkitService.addTextLeft(pdf, 10, `Subject to ${orgDetails?.address?.city} Juridiction`);
      pdf.y = pdf.y - 10;
      pdf = this.pdfkitService.addTextRight(pdf, 12, userDetails?.nameF + " " + userDetails?.nameL);
      pdf = this.pdfkitService.addLine(pdf, 0.5);
      pdf.moveDown();

      pdf = this.pdfkitService.addTextCenter(pdf, 10, `All Payments Made by Cheque/DD to be in favour of ${orgDetails?.name}`);

      pdf = this.pdfkitService.addLine(pdf, 0.2);
      pdf.moveDown();

      // Define the list items
      const listItems = [
        'Cultural Report : After 2-3 days enquire',
        'Outside Report : No same day gaurantee',
      ];
      pdf = this.pdfkitService.createList(pdf, listItems, "Note :")
      pdf.moveDown();
      pdf.end();

    } catch (error) {
      console.log(error);

      return error;
    }
  };

  public createOrderReceiptV2 = async (bookingId: string,transactionId: string, res: Response): Promise<any> => {
    try {
      const bookingDetails = await this.bookingService.getBookingDetails(bookingId);
      const orgDetails = await this.orgService.getOrgById(bookingDetails.orgId);
      const userDetails = await this.userService.getUserById(bookingDetails.user);

      let pdf = this.pdfkitService.createNewDoc(`RECEIPT_${bookingDetails.no}`);
      pdf.page.height = 600;
      pdf.pipe(res);
      pdf.x = 100;
      pdf.y = pdf.y - 50;
      const gstIn = orgDetails?.reg || "";
      const website = orgDetails?.domain || "";
      pdf.fontSize(10).text(gstIn, { align: "left" });

      const websiteWidth = pdf.widthOfString(website);
      const websiteX = pdf.page.width - websiteWidth - 100;
      pdf.y = pdf.y - 10;
      pdf.fontSize(10).text(website, websiteX, pdf.y);
      pdf.moveDown();

      // Load and embed an image
      // const imagePath = 'https://pdfkit.org/docs/img/15.png'; // Specify the path to your image
      const imageX = 100; // X-coordinate for the image
      const imageY = 50; // Y-coordinate for the image
      // const imageWidth = 80; // Width of the image (adjust as needed)
      // const imageHeight = 80; // Height of the image (adjust as needed)

      // // Load and embed the image to the left of the heading
      // pdf.image(imagePath, imageX + 50, imageY, { width: imageWidth, height: imageHeight });



      // Define the heading
      const heading = orgDetails?.appName || "";

      // Calculate the X position for the heading
      const headingX = imageX  // Adjust the X position as needed

      // Calculate the Y position for the heading to align with the top of the image
      const headingY = imageY;

      // Add the heading to the PDF in front of the image
      pdf.fontSize(28).text(heading, headingX, headingY, { align: "center" });

      // Set the font size and styles for the address and contact details
      pdf.fontSize(10); // Set the font size for address and contact details
      pdf.font('Helvetica'); // Use a regular font for address and contact details

      // Define the address, location, contact details, and email
      const address = orgDetails?.address?.address || "";
      const location = orgDetails?.address?.city || "" + ", " + orgDetails?.address?.district || "" + ", " + orgDetails?.address?.state || "" + ", " + orgDetails?.address?.country || "";
      const contact = orgDetails?.ph || "";
      const email = orgDetails?.email || "";

      // Calculate the X position for the address, location, contact details, and email
      const contentX = headingX;

      // Calculate the Y position for the address to align with the bottom of the image
      const addressY = imageY + 30;

      // Calculate the Y positions for the location, contact details, and email
      const locationY = addressY + pdf.heightOfString(address) + 1;
      const contactEmailY = locationY + pdf.heightOfString(location) + 1;

      // Add the address, location, contact details, and email in front of the image
      pdf.fillColor("#666666").text(address, contentX, addressY, { align: "center" });
      pdf.text(location, contentX, locationY, { align: "center" });
      pdf.text(`${contact} , ${email}`, contentX, contactEmailY, { align: "center" });

      // Add a horizontal line below the email address
      const lineWidth = pdf.page.width - contentX * 2; // Calculate the line width
      const lineY = contactEmailY + pdf.heightOfString(`${contact} , ${email}`) + 20; // Adjust the Y position as needed
      pdf.moveTo(contentX, lineY).lineTo(contentX + lineWidth, lineY).stroke();

      // Add the heading to the PDF in front of the image
      pdf.moveDown();
      pdf.moveDown();
      pdf.moveDown();
      pdf.fillColor("#000").fontSize(16).text("Receipt", { align: "center" });
      pdf.moveDown();





      // Define the section content
      const receiptNo = 'Receipt No: ' + bookingDetails.no;
      const patientID = 'Patient ID: ' + bookingDetails.patientNo;
      const visitID = 'Visit ID: ' + bookingDetails.no;
      const patientName = 'Patient Name: ' + userDetails?.nameF || "" + userDetails?.nameL || "";
      const genderAge = 'Gender/Age: ' + userDetails?.gender || "" + "/" + userDetails?.age || "";
      const fatherName = 'Father Name: ' + userDetails?.fatherName || "";
      const currentDate = new Date(); // You can pass any date you want here
      const formattedDate = this.formatDate(currentDate, "MMMDY");
      const receiptDate = 'Receipt Date: ' + formattedDate;
      const paymentMode = 'Payment Mode: ';
      const paymentStatus = 'Payment status: ' + bookingDetails?.txStatus && bookingDetails.txStatus !== undefined ? bookingDetails.txStatus : "";

      // Calculate the column widths and X positions
      const colWidth = 200; // Adjust the width of each column as needed
      const col1X = pdf.x; // X position for the first column
      const col2X = col1X + colWidth + 20; // X position for the second column
      const col3X = col2X + colWidth + 20; // X position for the third column

      // Calculate the Y positions for each row
      const row1Y = pdf.y;
      const row2Y = row1Y + 20;
      const row3Y = row2Y + 20;
      const row4Y = row3Y + 20;
      const row5Y = row4Y + 20;
      const row6Y = row5Y + 20;
      const row7Y = row6Y + 20;
      const row8Y = row7Y + 20;
      pdf.fontSize(12);
      // Add the section content
      pdf.text(receiptNo, col1X, row1Y);
      pdf.text(patientID, col2X, row1Y);
      pdf.text(visitID, col3X, row1Y);

      pdf.text(patientName, col1X, row2Y);
      pdf.text(genderAge, col2X, row2Y);
      pdf.text(fatherName, col3X, row2Y);

      pdf.text(receiptDate, col1X, row3Y);
      pdf.text(paymentMode, col2X, row3Y);
      pdf.text(paymentStatus, col3X, row3Y);
      pdf.moveDown();
      pdf.moveDown();





      // Define the table content as a 2D array
      const table = [
        ['Sno', 'Service/Package', 'Qty', 'Fee']
      ];

      const items = bookingDetails.items;
      let i = 1;
      items.forEach(element => {
        const row = [this.addLeadingZero(i), element.name as string, this.addLeadingZero(element.qty), this.addLeadingZero(element.amount)];
        table.push(row as string[]);
        i++;
      });

      // Define the dimensions of the table
      const tableWidth = 700; // Adjust the width of the table as needed
      const cellHeight = 30; // Adjust the cell height as needed

      // Calculate the X and Y positions for the table
      pdf.x = (pdf.page.width - tableWidth) / 2;
      const tableX = pdf.x; // Adjust the X position as needed
      const tableY = pdf.y; // Adjust the Y position as needed

      // Define the custom widths for the columns
      const columnWidths = [50, 400, 100, 150]; // Adjust the widths as needed


      // Loop through the rows and columns to create the table
      for (let i = 0; i < table.length; i++) {
        const row = table[i];
        for (let j = 0; j < row.length; j++) {
          const cellText = row[j];
          const cellX = tableX + columnWidths.slice(0, j).reduce((sum, width) => sum + width, 0); // Calculate the X position for the cell
          const cellY = tableY + i * cellHeight; // Calculate the Y position for the cell
          const cellWidth = columnWidths[j]; // Get the width for the current column

          // Create a cell as a rectangle with a lighter border
          pdf.rect(cellX, cellY, cellWidth, cellHeight).strokeOpacity(0.5).stroke();

          // Add the cell text to the cell
          const textWidth = pdf.widthOfString(cellText);
          const centerX = cellX + (cellWidth - textWidth) / 2;

          if (i === 0) {
            pdf.font('Helvetica-Bold');
            pdf.fillColor("#000").text(cellText, centerX, cellY + 10);
            pdf.font('Helvetica');
          } else if (j === 2 || j == 3) {
            pdf.fillColor("#666666").text(cellText, centerX, cellY + 10);
          } else {
            pdf.fillColor("#666666").text(cellText, cellX + 5, cellY + 10); // Adjust the text position for padding
          }
        }
      }

      // Add the additional text below the table
      pdf.moveDown(); // Move down to create some space
      pdf.moveDown(); // Move down to create some space
      pdf.x = 100;
      pdf.fontSize(12); // Set a smaller font size for the additional text
      // pdf.fontSize(fontSize).text(text, );
      pdf.text('Print Date Time: ' + formattedDate, { align: "left" });

      //---------------------------discount-----------------------------------
      pdf.font('Helvetica-Bold');
      pdf.y = pdf.y - 10;
      const discountAmount = bookingDetails?.discount && bookingDetails.discount !== undefined ? bookingDetails.discount : 0;
      const discount = 'Discount: ' + discountAmount as string;
      pdf.fillColor("#000").fontSize(14).text(discount,{align :"right"});
      const discountWords = 'Discount In Words : [' + this.numberToWords(discountAmount) + ']';
      pdf.fillColor("#666666").fontSize(10).text(discountWords,{align :"right"});
      //---------------------------total-----------------------------------

      //---------------------------total-----------------------------------
      pdf.font('Helvetica-Bold');
      const totalDue = 'Total: ' + bookingDetails.totalDue;
      pdf.fillColor("#000").fontSize(14).text(totalDue,{align :"right"});


      const totalDueWords = 'Total In Words : [' + this.numberToWords(bookingDetails.totalDue) + ']';
      pdf.fillColor("#666666").fontSize(10).text(totalDueWords,{align :"right"});
      //---------------------------total-----------------------------------

      //---------------------------paid-----------------------------------
      let totalPaid = 0;
      let due = 0;
      
      if(!transactionId){
        totalPaid = bookingDetails.totalPaid;
        due = bookingDetails.totalDue;
      }else{
        const transactions = bookingDetails.tx;
        let breakLoop = false;
        due  = bookingDetails.totalDue;
        transactions.forEach(element => {
          if(!breakLoop){
            const transactionAmount = element.amount as number;
            due = due - transactionAmount
            if (element._id == transactionId) {
              totalPaid = transactionAmount;
              breakLoop = true;
            }
          }
        });
      }
      pdf.fillColor("#000").fontSize(14).text('Paid: ' + totalPaid as unknown as string,{align :"right"});
      const totalPaidWords = 'Paid In Words : [' + this.numberToWords(totalPaid) + ']';
      pdf.fillColor("#666666").fontSize(10).text(totalPaidWords,{align :"right"});

      //---------------------------paid-----------------------------------

      //---------------------------due-----------------------------------
      pdf.fillColor("#000").fontSize(14).text('Due: ' + due as unknown as string,{align :"right"});
      const dueWords = 'Due In Words : [' + this.numberToWords(due) + ']';
      pdf.fillColor("#666666").fontSize(10).text(dueWords,{align :"right"});

      //---------------------------due-----------------------------------
      
      pdf.moveDown();
      const hospitalName = 'For ' + orgDetails?.appName;
      const textHospitalNameWidth = pdf.widthOfString(hospitalName);
      const hospitalNameX = pdf.page.width - textHospitalNameWidth - 100;
      pdf.fontSize(12).text(hospitalName, hospitalNameX, pdf.y);
      pdf.x = 100;
      const listItems = [
        'Cultural Report : After 2-3 days enquire',
        'Outside Report : No same day gaurantee',
      ];
      pdf = this.pdfkitService.createList(pdf, listItems, "Note :")
      pdf.end();

    } catch (error) {
      console.log(error);

      return error;
    }
  };

  public createPharmacyOrderReceipt = async (orderId: string, res: Response): Promise<any> => {
    try {
      const orderDetails = await this.pharmacyService.getOrderDetails(orderId);
      const orgDetails = await this.orgService.getOrgById(orderDetails.orgId);
      const userDetails = await this.userService.getUserById(orderDetails.user);

      let pdf = this.pdfkitService.createNewDoc(`RECEIPT_${orderDetails._id}`);
      pdf.pipe(res);

      pdf = this.pdfkitService.addTextCenter(pdf, 20, orgDetails?.name as string);
      const address = orgDetails?.address?.city || "" + ", " + orgDetails?.address?.district || "" + ", " + orgDetails?.address?.state || "" + ", " + orgDetails?.address?.country || "";
      pdf = this.pdfkitService.addTextCenter(pdf, 10, address);

      pdf = this.pdfkitService.addLine(pdf, 0.5);

      //user details 
      // Define key-value pairs
      const dob = userDetails?.doB.getDate() + "-" + userDetails?.doB.getMonth() + "-" + userDetails?.doB.getFullYear();
      const userDetailsList = [
        { key: "First Name", value: userDetails?.nameF || "" },
        { key: "Last Name", value: userDetails?.nameL || "" },
        { key: "Father Name", value: userDetails?.fatherName || "" },
        { key: "Phone", value: userDetails?.cell || "" },
        { key: "Email", value: userDetails?.email2 || " " },
        { key: "DOB", value: dob || "" },
        { key: "Gender", value: userDetails?.gender || "" },
        { key: "Age", value: userDetails?.age || "" }
      ];

      pdf = this.pdfkitService.addKeyValuePair(pdf, userDetailsList);
      //invoice heading
      // Add a heading after the line with centered alignment
      pdf = this.pdfkitService.addLine(pdf, 0.5);
      pdf.moveDown();
      pdf = this.pdfkitService.addTextCenter(pdf, 20, "INVOICE");
      pdf = this.pdfkitService.addLine(pdf, 0.5);


      // Define the table content manually
      const tableHeaders = ['', 'Service/Package', 'Qty', 'Amount'];
      let tableRows = [] as string[][];
      const items = orderDetails.items;
      let i = 1;
      items.forEach(element => {
        const row = [i, element.name, element.qty, element.amount];
        tableRows.push(row as string[]);
      });
      const totalDue = orderDetails.totalDue as unknown as string;
      tableRows.push(['', '', 'Total Amount', totalDue]);
      pdf = this.pdfkitService.createTable(pdf, tableHeaders, tableRows);
      const inWordsAmount = this.numberToWords(orderDetails.totalPaid);

      pdf = this.pdfkitService.addTextCenter(pdf, 10, `RECEIVED SUM OF RS ${orderDetails.totalPaid} [IN WORDS : ${inWordsAmount}] ON ACCOUNT OF ${orgDetails?.name}`);



      pdf = this.pdfkitService.addLine(pdf, 0.5);
      pdf.moveDown();

      pdf = this.pdfkitService.addTextRight(pdf, 14, `Paid :           ${orderDetails.totalPaid}`);

      pdf = this.pdfkitService.addLine(pdf, 0.5);
      pdf.moveDown();
      const now = new Date();
      pdf = this.pdfkitService.addTextLeft(pdf, 10, "Print Date Time  : " + now.toLocaleString());
      pdf.y = pdf.y - 10;
      pdf = this.pdfkitService.addTextRight(pdf, 10, `for ${orgDetails?.name}`);
      pdf.moveDown();
      pdf = this.pdfkitService.addTextLeft(pdf, 10, `Subject to ${orgDetails?.address?.city} Juridiction`);
      pdf.y = pdf.y - 10;
      pdf = this.pdfkitService.addTextRight(pdf, 12, userDetails?.nameF + " " + userDetails?.nameL);
      pdf = this.pdfkitService.addLine(pdf, 0.5);
      pdf.moveDown();

      pdf = this.pdfkitService.addTextCenter(pdf, 10, `All Payments Made by Cheque/DD to be in favour of ${orgDetails?.name}`);

      pdf = this.pdfkitService.addLine(pdf, 0.2);
      pdf.moveDown();

      // Define the list items
      const listItems = [
        'Cultural Report : After 2-3 days enquire',
        'Outside Report : No same day gaurantee',
      ];
      pdf = this.pdfkitService.createList(pdf, listItems, "Note :")
      pdf.moveDown();
      pdf.end();

    } catch (error) {
      console.log(error);

      return error;
    }
  };

  /* ************************************* Private Methods ******************************************** */

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

  private addLeadingZero(number: number): string {
    // Check if the number is less than 10
    if (number < 10) {
      // Add a leading '0' and convert it to a string
      return '0' + number.toString();
    } else {
      // If the number is 10 or greater, convert it to a string without adding '0'
      return number.toString();
    }
  }

  private formatDate(date: Date, formate : string): string {
    if(formate == "MMMDY"){
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
    
      const monthIndex = date.getMonth();
      const day = date.getDate();
      const year = date.getFullYear();
    
      const month = months[monthIndex];
    
      return `${month} ${day}, ${year}`;
    }
    return "";
    
  }
  
  

}
