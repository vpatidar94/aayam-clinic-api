
import PDFDocument from "pdfkit";


export class PdfkitService {

  /* ************************************* Public Methods ******************************************** */

  public createNewDoc = (name: string) => {
    // Create a new PDF document
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    return doc;
  };

  public addTextCenter = (
    doc: any,
    fontSize: number,
    text: string
  ) => {
    doc.fontSize(fontSize).text(text, { align: "center" });
    return doc;
  };

  public addTextLeft = (
    doc: any,
    fontSize: number,
    text: string
  ) => {
    doc.fontSize(fontSize).text(text, { align: "left" });
    return doc;
  };

  public addTextRight = (
    doc: any,
    fontSize: number,
    text: string
  ) => {
    doc.fontSize(fontSize).text(text, { align: "right" });
    return doc;
  };

  public addTextCenterAfterLine = (
    doc: any,
    fontSize: number,
    headingAfterLine: string
  ) => {
   
    const pageWidth = doc.page.width;
    const headingAfterLineWidth = doc.widthOfString(headingAfterLine);
    const headingAfterLineX = (pageWidth - headingAfterLineWidth) / 2;
    doc.moveDown();
    doc
      .fontSize(fontSize)
      .text(headingAfterLine, headingAfterLineX, doc.y +  20 );
    return doc;
  };

  public addLine = (doc: PDFKit.PDFDocument, strokeOpacity : number) => {
    // Add a line to the PDF
    const lineY = doc.y + 10;
    doc.strokeOpacity(strokeOpacity);
    // Draw a line after the current section
    doc
      .moveTo(50, lineY) // Starting point
      .lineTo(800, lineY) // Ending point
      .stroke();// Draw the line
    doc.y = lineY;
    doc.strokeOpacity(1);
    return doc;
  };

  public addKeyValuePair = (doc: any, keyValuePairs: any) => {
    // Set initial x and y positions for the two columns
    const column1X = 50;
    const column2X = doc.page.width / 2 + 10; // Adjust the gap between columns as needed
    let y = doc.y + 10;

    // Loop through key-value pairs and add them to the PDF in pairs per line
    for (let i = 0; i < keyValuePairs.length; i += 2) {
      const pair1 = keyValuePairs[i];
      const pair2 = keyValuePairs[i + 1];
      doc
        .fontSize(10)
        .text(`${pair1.key} : ${pair1.value}`, column1X, y)
      if(pair2){
        doc.text(`${pair2.key} :`, column2X, y)
        .text(pair2.value, column2X + 70, y, { align: "left" }); // Move to the next line
      }
      
        
      if(i < keyValuePairs.length - 2){
        y += 15; // Move down for the next line
      }
    }
    doc.x = column1X;
    doc.y = y +10;
    return doc;
  };

  public createTable = (doc: any, tableHeaders: any, tableRows: any) => {
    // Calculate column widths
    const columnWidth = (doc.page.width - 100) / tableHeaders.length;
    let y = doc.y;
    // Draw the table headers
    for (let i = 0; i <= tableHeaders.length; i++) {
      doc
        .fontSize(10)
        .text(tableHeaders[i], 50 + i * columnWidth, y + 10, {
          width: columnWidth,
          align: "center",
        }).moveDown();
        doc.y = y + 20;
    }
    doc = this.addLine(doc,0.5);
    y = doc.y;
    // Draw the table rows and separation lines
    // Draw the table rows
    for (let i = 0; i < tableRows.length; i++) {
      const row = tableRows[i];
      for (let j = 0; j < row.length; j++) {
        if(j < row.length - 1){
          doc
          .fontSize(10)
          .text(row[j], 50 + j * columnWidth, y + 10 + i * 20, {
            width: columnWidth,
            align: "center",
          });
        }else{
          doc
          .fontSize(10)
          .text(row[j], 50 + j * columnWidth, y + 10 + i * 20, {
            width: columnWidth,
            align: "right",
          });
        }
        
      }
      // Draw lines between row
      doc.x = 50;
      doc.y = doc.y -10;
      if(i < tableRows.length -1){
        doc = this.addLine(doc,0.2);
      }
    }
    doc = this.addLine(doc,0.5);
    doc.moveDown();

    return doc;
  };

  public createList = (doc: any, listItems:any, listName:string) => {
    const listIndentation = 100;
    if(listName != ""){
      // this.addTextLeft(doc,12,listName);
      // this.addTextLeft(doc,12,listName);
      this.addTextLeft(doc,12,listName);
    } 
    // Add the list to the PDF
      listItems.forEach((item: any, index: number) => {
        const listItemText = `${index + 1}. ${item}`;
        doc.text(listItemText);
        // doc.text(listItemText, listIndentation, doc.y);
      });
      return doc;
  }

  /* ************************************* Private Methods ******************************************** */
}
