import {
  BOOKING_STATUS,
  BOOKING_TYPE,
  BookingAddTransactionDto,
  BookingPopulateVo,
  BookingVo,
  InvestigationVo,
  ORDER_TX_STATUS,
  OrgBookingDto,
  OrgCodeNoDto,
  TX_STATUS,
  TxVo,
  UserBookingDto,
  UserBookingInvestigationDto,
  UserVo
} from "aayam-clinic-core";
import bookingModel from "../../@app/model/booking.model";
import TransactionModel from "../../@app/model/transaction.model";
import { APP_CONST } from "../../@shared/const/app.const";
import departmentModel from "../../@shared/model/department.model";
import { MetaOrgService } from "../../@shared/service/meta-org.service";
import { UserService } from "../../@shared/service/user.service";
import { InvestigationService } from "./investigation.service";
import { PharmacyService } from "./pharmacy.service";
import { SmsService } from "../../@shared/service/sms.service";
import { OrgService } from "../../@shared/service/org.service";
import userModel from "../../@shared/model/users.model";
import { Types } from "mongoose";

export class BookingService {
  public bookingModel = bookingModel;
  public userModel = userModel;
  public transactionModel = TransactionModel;

  /* ************************************* Public Methods ******************************************** */
  public addUpdateBooking = async (
    userBookingDto: UserBookingDto
  ): Promise<UserBookingDto | null> => {
    try {
      const booking = userBookingDto.booking;
      if (booking._id) {
        userBookingDto.booking = (await bookingModel.findByIdAndUpdate(
          booking._id,
          booking,
          { new: true }
        )) as BookingVo;
        if (userBookingDto.user?._id) { 
          userBookingDto.user = await userModel.findByIdAndUpdate(userBookingDto.user._id, userBookingDto.user, { new: true }) as UserVo; 
        }
      } else {
        const newUpdatedOrderNo = await this._updateBookingStatusAndNo(booking);
        const user = await new UserService().saveBookingCust(
          userBookingDto.user,
          booking.orgId
        );
        userBookingDto.booking.user = user?._id ?? "";
        userBookingDto.booking = await this.bookingModel.create(booking);
        await new MetaOrgService().updateCodeNo(
          booking.orgId,
          newUpdatedOrderNo
        );
        try {
        await SmsService.sendAppointmentConfirmation(userBookingDto.user.cell, userBookingDto.booking.bookingDate?.toDateString(), userBookingDto.booking.timeSlot);
        }
        catch (error) {
          return userBookingDto;
        }
      }
      return userBookingDto;
    } catch (error) {
      throw error;
    }
  };

  public getPatientBooking = async (
    orgId: string,
    userId: string
  ): Promise<UserBookingInvestigationDto> => {
    const userBookingInvestigationDto = {} as UserBookingInvestigationDto;
    userBookingInvestigationDto.bookingList = (await this.bookingModel.find({
      user: userId,
      orgId: orgId,
    })) as Array<BookingVo>;
    userBookingInvestigationDto.investigation =
      (await new InvestigationService().getUserInvestigation(userId)) ??
      ([] as Array<InvestigationVo>);
    userBookingInvestigationDto.user =
      (await new UserService().getUserById(userId)) ?? ({} as UserVo);
    return userBookingInvestigationDto;
  };

  public getOrgBooking = async (
    orgId: string,
    type: string,
    limit: number,
    offset: number
  ): Promise<OrgBookingDto[]> => {
    const list = (await this.bookingModel
      .find({ orgId, type })
      .limit(limit)
      .skip(offset)
      .sort({ no: "desc" })
      .collation({ locale: "en_US", numericOrdering: true })
      .populate(["patient", "drDetail"])) as Array<BookingPopulateVo>;
    const orgBookingList = [] as Array<OrgBookingDto>;
    if (list?.length > 0) {
      for (let i = 0; i < list.length; i++) {
        const it: BookingPopulateVo = list[i];
        const record = JSON.parse(JSON.stringify(it));
        const dto = {} as OrgBookingDto;
        dto.drDetail = record.drDetail;
        dto.patient = record.patient;
        dto.pharmacyOrderId = await new PharmacyService().pharmacyIdByBookingId(record._id?.toString());
        delete record.drDetail;
        delete record.patient;
        dto.booking = record;
        orgBookingList.push(dto);
      }
    }
    return orgBookingList;
  };
  

//   public searchBooking = async (orgId: string, query: string, maxRecord: number, skip: number): Promise<OrgBookingDto[]> => {
//     // try {
//       const results = (await this.bookingModel.find({
//         // const results = (await this.userModel.find({

//         orgId: orgId,
//         $text: { $search: query }
//       }).skip(skip).limit(250).populate(["patient", "drDetail"])) as Array<BookingPopulateVo>;

// // newly added to show search patient in the table start
// const orgBookingList = [] as Array<OrgBookingDto>;
//     if (results?.length > 0) {
//       for (let i = 0; i < results.length; i++) {
//         const it: BookingPopulateVo = results[i];
//         const record = JSON.parse(JSON.stringify(it));
//         const dto = {} as OrgBookingDto;
//         dto.drDetail = record.drDetail;
//         dto.patient = record.patient;
//         dto.pharmacyOrderId = await new PharmacyService().pharmacyIdByBookingId(record._id?.toString());
//         delete record.drDetail;
//         delete record.patient;
//         dto.booking = record;
//         orgBookingList.push(dto);
//       }
      
//     // }
// // newly added to show search patient in the table start


  
//     //   console.log('Results:', results); // Log the results
//     //   // return results;
//     // } catch (error) {
//     //   console.error('Error in searchBooking:', error);
//     //   throw error;
//     }
//     return orgBookingList;
//   }



// it is working perfectly till now but it only search user name and not "no" and mobile number
// public searchBooking = async (orgId: string, query: string, maxRecord: number, skip: number): Promise<OrgBookingDto[]> => {

//   const userResults = await this.userModel.find({
//     $text: { $search: query }
//   }).select('_id');  // Fetch only IDs of matched users
//   const userIds = userResults.map(user => user._id);
//   console.log("id is",userIds);

//   console.log("User IDs found:", userIds);
// const users = await this.userModel.find({ _id: { $in: userIds } });
// console.log("User details:", users);
//   // const bookingResults = await this.bookingModel.find({
//   //   orgId: orgId,
//   //   $text: { $search: query },
//   //   user: { $in: userIds }  // Match bookings with the IDs of users found in the previous step
//   // }).skip(skip).limit(maxRecord).populate(['patient', 'drDetail']);

//   const bookingResults = await this.bookingModel.find({
//     orgId: orgId,
//     user: { $in: userIds }  // Only check if there are bookings for this user
//   }).skip(skip).limit(maxRecord).populate(['patient', 'drDetail']);

//   // const bookingResults = await this.bookingModel.find({
//   //   orgId: orgId,
//   //   user: { $in: userIds },
//   //   $text: { $search: "Sumeet" }
//   // }).skip(skip).limit(maxRecord).populate(['patient', 'drDetail']);
//   // console.log("Booking results:", bookingResults);

//   const orgBookingList = [] as Array<OrgBookingDto>;
//   if (bookingResults?.length > 0) {
//     for (const it of bookingResults) {
//       const record = JSON.parse(JSON.stringify(it));
//       const dto = {} as OrgBookingDto;
//       dto.drDetail = record.drDetail;
//       dto.patient = record.patient;
//       dto.pharmacyOrderId = await new PharmacyService().pharmacyIdByBookingId(record._id?.toString());
//       delete record.drDetail;
//       delete record.patient;
//       dto.booking = record;
//       orgBookingList.push(dto);
//     }
//   }
//   return orgBookingList;

//   // const results = await this.bookingModel.find({
//   //   orgId: orgId,
//   //   $text: { $search: query }
//   // }).skip(skip).limit(250).populate(["patient", "drDetail"]);

//   // const orgBookingList = [] as Array<OrgBookingDto>;
//   // if (results?.length > 0) {
//   //   for (const it of results) {
//   //     const record = JSON.parse(JSON.stringify(it));
//   //     const dto = {} as OrgBookingDto;
//   //     dto.drDetail = record.drDetail;
//   //     dto.patient = record.patient;
//   //     dto.pharmacyOrderId = await new PharmacyService().pharmacyIdByBookingId(record._id?.toString());
//   //     delete record.drDetail;
//   //     delete record.patient;
//   //     dto.booking = record;
//   //     orgBookingList.push(dto);
//   //   }
//   // }
//   // return orgBookingList;
// }



// in it only "no" is search and username gave internal server error
// public searchBooking = async (orgId: string, query: string, maxRecord: number, skip: number): Promise<OrgBookingDto[]> => {
//   try {
//     // Step 1: Perform text search on userModel
//     const userResults = await this.userModel.find({
//       $text: { $search: query }
//     }).select('_id');
    
//     const userIds = userResults.map(user => user._id);

//     // Log user IDs for debugging
//     console.log("User IDs found:", userIds);

//     // Step 2: Perform combined query on bookingModel
//     const bookingQuery: any = {
//       orgId: orgId,
//       $text: { $search: query }
//     };

//     // If user IDs are found, add them to the booking query
//     if (userIds.length > 0) {
//       bookingQuery.$or = [
//         { user: { $in: userIds } },
//         { $text: { $search: query } }
//       ];
//     }

//     const bookingResults = await this.bookingModel.find(bookingQuery)
//       .skip(skip)
//       .limit(maxRecord)
//       .populate(['patient', 'drDetail']);

//     // Log booking results for debugging
//     console.log("Booking results:", bookingResults);

//     // Prepare the final result list
//     const orgBookingList: OrgBookingDto[] = [];
//     if (bookingResults?.length > 0) {
//       for (const it of bookingResults) {
//         const record = JSON.parse(JSON.stringify(it));
//         const dto: OrgBookingDto = {} as OrgBookingDto;
//         dto.drDetail = record.drDetail;
//         dto.patient = record.patient;
//         dto.pharmacyOrderId = await new PharmacyService().pharmacyIdByBookingId(record._id?.toString());
//         delete record.drDetail;
//         delete record.patient;
//         dto.booking = record;
//         orgBookingList.push(dto);
//       }
//     }

//     return orgBookingList;

//   } catch (error) {
//     console.error("Error in search API:", error);
//     throw error;
//   }
// }


// it is working perfectly i.e searching user name and "no" both  but not searching mobile number
// public searchBooking = async (orgId: string, query: string, maxRecord: number, skip: number): Promise<OrgBookingDto[]> => {
//   try {
//     // Step 1: Perform text search on userModel
//     const userResults = await this.userModel.find({
//       $text: { $search: query }
//     }).select('_id');
    
//     const userIds = userResults.map(user => user._id);

//     // Log user IDs for debugging
//     console.log("User IDs found:", userIds);

//     // Step 2: Query bookingModel using user IDs
//     const userIdQueryResults = userIds.length > 0 ? await this.bookingModel.find({
//       orgId: orgId,
//       user: { $in: userIds }
//     })
//     .skip(skip)
//     .limit(maxRecord)
//     .populate(['patient', 'drDetail']) : [];

//     // Log booking results for debugging
//     console.log("Booking results by user IDs:", userIdQueryResults);

//     // Step 3: Perform text search on bookingModel
//     const bookingTextQueryResults = await this.bookingModel.find({
//       orgId: orgId,
//       $text: { $search: query }
//     })
//     .skip(skip)
//     .limit(maxRecord)
//     .populate(['patient', 'drDetail']);

//     // Log booking results for debugging
//     console.log("Booking results by text search:", bookingTextQueryResults);

//     // Step 4: Merge results ensuring uniqueness
//     const bookingResults = [...userIdQueryResults, ...bookingTextQueryResults]
//       .filter((value, index, self) => index === self.findIndex((t) => t._id.toString() === value._id.toString()));

//     // Prepare the final result list
//     const orgBookingList: OrgBookingDto[] = [];
//     if (bookingResults?.length > 0) {
//       for (const it of bookingResults) {
//         const record = JSON.parse(JSON.stringify(it));
//         const dto: OrgBookingDto = {} as OrgBookingDto;
//         dto.drDetail = record.drDetail;
//         dto.patient = record.patient;
//         dto.pharmacyOrderId = await new PharmacyService().pharmacyIdByBookingId(record._id?.toString());
//         delete record.drDetail;
//         delete record.patient;
//         dto.booking = record;
//         orgBookingList.push(dto);
//       }
//     }

//     return orgBookingList;

//   } catch (error) {
//     console.error("Error in search API:", error);
//     throw error;
//   }
// }



public searchBooking = async (orgId: string, query: string, maxRecord: number, skip: number): Promise<OrgBookingDto[]> => {
  try {
    let userIds: Types.ObjectId[] = [];

    // Step 1: Perform direct search on userModel for phone numbers
    const phoneSearchResults = await this.userModel.find({
      cell: query
    }).select('_id');

    const phoneUserIds = phoneSearchResults.map(user => user._id);

    // Log user IDs from phone search
    console.log("User IDs found from phone search:", phoneUserIds);

    // Step 2: Perform text search on userModel for other fields
    const textSearchResults = await this.userModel.find({
      $text: { $search: query }
    }).select('_id');

    const textUserIds = textSearchResults.map(user => user._id);

    // Log user IDs from text search
    console.log("User IDs found from text search:", textUserIds);

    // Combine user IDs from text and phone searches
    userIds = [...new Set([...phoneUserIds, ...textUserIds])];  // Ensure uniqueness

    // Log combined user IDs
    console.log("Combined User IDs:", userIds);

    // Step 3: Query bookingModel using user IDs
    const userIdQueryResults = userIds.length > 0 ? await this.bookingModel.find({
      orgId: orgId,
      user: { $in: userIds }
    })
    .skip(skip)
    .limit(maxRecord)
    .populate(['patient', 'drDetail']) : [];

    // Log booking results for debugging
    console.log("Booking results by user IDs:", userIdQueryResults);

    // Step 4: Perform text search on bookingModel
    const bookingTextQueryResults = await this.bookingModel.find({
      orgId: orgId,
      $text: { $search: query }
    })
    .skip(skip)
    .limit(maxRecord)
    .populate(['patient', 'drDetail']);

    // Log booking results for debugging
    console.log("Booking results by text search:", bookingTextQueryResults);

    // Step 5: Merge results ensuring uniqueness
    const bookingResults = [...userIdQueryResults, ...bookingTextQueryResults]
      .filter((value, index, self) => index === self.findIndex((t) => t._id.toString() === value._id.toString()));

    // Prepare the final result list
    const orgBookingList: OrgBookingDto[] = [];
    if (bookingResults?.length > 0) {
      for (const it of bookingResults) {
        const record = JSON.parse(JSON.stringify(it));
        const dto: OrgBookingDto = {} as OrgBookingDto;
        dto.drDetail = record.drDetail;
        dto.patient = record.patient;
        dto.pharmacyOrderId = await new PharmacyService().pharmacyIdByBookingId(record._id?.toString());
        delete record.drDetail;
        delete record.patient;
        dto.booking = record;
        orgBookingList.push(dto);
      }
    }

    return orgBookingList;

  } catch (error) {
    console.error("Error in search API:", error);
    throw error;
  }
}











// newly added for the whole table search"

// public searchOrgBooking = async (
//   orgId: string,
//   query: string,
//   limit: number,
//   offset: number
// ): Promise<OrgBookingDto[]> => {
//   const searchCriteria = {
//     orgId,
//     $or: [
//       { 'patient.nameF': { $regex: query, $options: 'i' } },
//       { 'drDetail.nameF': { $regex: query, $options: 'i' } },
//       { 'booking.bookingId': { $regex: query, $options: 'i' } },
//       // Add more fields if needed
//     ]
//   };

//   const list = (await this.bookingModel
//     .find(searchCriteria)
//     .limit(limit)
//     .skip(offset)
//     .sort({ no: 'desc' })
//     .collation({ locale: 'en_US', numericOrdering: true })
//     .populate(['patient', 'drDetail'])) as Array<BookingPopulateVo>;

//     const orgBookingList = await Promise.all(list.map(async (record) => {
//       const dto = {} as OrgBookingDto;
//       dto.drDetail = record.drDetail;
//       dto.patient = record.patient;
//       dto.pharmacyOrderId = await new PharmacyService().pharmacyIdByBookingId(record._id?.toString());
//       dto.booking = record;
//       return dto;
//     }));
//   return orgBookingList;
// };



// public searchBooking = async(orgId: string, query: string, maxRecord: number, skip: number)=>{
// // async searchOrgBooking(orgId: string, query: string, maxRecord: number, skip: number) {
//   try {
//     // Simplified query for testing
//     const results = await this.bookingModel.find({ orgId: orgId }).skip(skip).limit(maxRecord);
//     console.log('Results:', results);
//     return results;
//   } catch (error) {
//     console.error('Error in searchOrgBooking:', error);
//     throw error;
//   }
// }


// public searchBooking = async (orgId: string, query: string, maxRecord: number, skip: number) => {
//   try {
//     const results = await this.bookingModel.find({
//       orgId: orgId,
//       $text: { $search: query }
//     }).skip(skip).limit(maxRecord);

//     console.log('Results:', results); // Log the results
//     return results;
//   } catch (error) {
//     console.error('Error in searchBooking:', error);
//     throw error;
//   }
// }

// async searchOrgBooking(orgId: string, query: string, maxRecord: number, skip: number) {
//   try {
//     // Example of filtering by patient name or doctor name (adjust as necessary)
//     const searchCriteria = {
//       orgId: orgId,
//       $or: [
//         { 'patient.nameF': new RegExp(query, 'i') }, // Patient's first name
//         { 'patient.nameM': new RegExp(query, 'i') }, // Patient's middle name
//         // Add more fields as needed
//       ],
//     };

//     // Perform the search
//     const results = await this.bookingModel.find(searchCriteria).skip(skip).limit(maxRecord);
//     console.log('Search Results:', results);
//     return results;
//   } catch (error) {
//     console.error('Error in searchOrgBooking:', error);
//     throw error;
//   }
// }

  
  // newly added to search from whole table end



  public getInvestigationPatient = async (
    orgId: string,
  ): Promise<OrgBookingDto[]> => {
    const dept = await departmentModel.findOne({ name: APP_CONST.PATHOLOGY, orgId });
    const list = (await this.bookingModel
      .find({ orgId, departmentId: dept?._id?.toString() })
      .sort({ no: "desc" })
      .collation({ locale: "en_US", numericOrdering: true })
      .populate(["patient", "drDetail"])) as Array<BookingPopulateVo>;
    let investigationPatientList = [] as Array<OrgBookingDto>;
    if (list?.length > 0) {
      investigationPatientList = list.map((it: BookingPopulateVo) => {
        const record = JSON.parse(JSON.stringify(it));
        const dto = {} as OrgBookingDto;
        dto.drDetail = record.drDetail;
        dto.patient = record.patient;
        delete record.drDetail;
        delete record.patient;
        dto.booking = record;
        return dto;
      });
    }
    return investigationPatientList;
  };

  public getBookingAndUserDetails = async (bookingId: string): Promise<BookingPopulateVo> => {
    const bookingDetails = await this.bookingModel.findOne({ _id: bookingId }).populate(["patient"]) as BookingPopulateVo;
    return bookingDetails;
  }

  public getBookingDetails = async (bookingId: string): Promise<BookingVo> => {
    const bookingDetails = await this.bookingModel.findOne({ _id: bookingId }) as BookingVo;
    return bookingDetails;
  }

  public removeBookingById = async (bookingId: string): Promise<boolean> => {
    await this.bookingModel.findByIdAndDelete({ _id: bookingId });
    return true;
  }

  public getOrgBookingCount = async (orgId: string, type: string): Promise<number> => {
    let count = 0;
    count = await this.bookingModel.countDocuments({ orgId: orgId, type: type });
    return count;
  };

  public addUpdateBookingTransaction = async (
    bookingAddTransactionDto: BookingAddTransactionDto
  ): Promise<any> => {
    try {
      const bookingDetails = (await this.bookingModel.findById(bookingAddTransactionDto.bookingId)) as BookingVo;
      if (bookingDetails) {
        const txList = bookingDetails.tx as Array<TxVo>;
        let txVo = {} as TxVo;
        txVo.orgId = bookingDetails.orgId;
        txVo.brId = bookingDetails.brId;
        txVo.bookingId = bookingDetails._id;
        txVo.custId = bookingDetails.user;
        txVo.txType = bookingAddTransactionDto.paymentMode;
        txVo.txStatus = TX_STATUS.SUCCESS;
        txVo.amount = bookingAddTransactionDto.amount;
        txVo.amountApproved = bookingAddTransactionDto.amount;
        txVo.serviceCharge = 0;
        txVo.date = new Date();
        txVo.created = new Date();

        txList.push(txVo);
        bookingDetails.tx = txList;
        bookingDetails.totalPaid = bookingDetails.totalPaid + bookingAddTransactionDto.amount;
        if (bookingDetails.totalDue == 0 || bookingDetails.totalPaid == 0) {
          bookingDetails.status = ORDER_TX_STATUS.NOT_PAID;
        } else if (bookingDetails.totalDue == bookingDetails.totalPaid) {
          bookingDetails.status = ORDER_TX_STATUS.PAID;
        } else if (bookingDetails.totalDue > bookingDetails.totalPaid) {
          bookingDetails.status = ORDER_TX_STATUS.PARTIALLY_PAID;
        } else if (bookingDetails.totalDue < bookingDetails.totalPaid) {
          bookingDetails.status = ORDER_TX_STATUS.ADVANCE_PAID;
        }
        const booking = (await bookingModel.findByIdAndUpdate(
          bookingDetails._id,
          bookingDetails,
          { new: true }
        )) as BookingVo;
        await this.transactionModel.create(txVo);
        const bookingDetail: BookingPopulateVo = await this.getBookingAndUserDetails(bookingAddTransactionDto.bookingId);
        const org = await new OrgService().getOrgById(bookingDetail.orgId);
        // try {
        //   await SmsService.sendThanksMsg(bookingDetail.patient?.cell, org?.ph ?? '');
        // }
        // catch (error) {
        //   return booking;
        // }
        return booking;
      }
      return null;
    } catch (error) {
      throw error;
    }
  };

  public convertToPatient = async (bookingId: string, patientType: string, orgId: string): Promise<void> => {
    const lastBookingOrder = await new MetaOrgService().getLastCodeNo(orgId);
    const fields = {
      patientNo: String(lastBookingOrder.patientNo + 1),
      status: BOOKING_STATUS.CONFIRMED,
      type: BOOKING_TYPE.PATIENT,
      subType: patientType
    } as any;
    await this.bookingModel.findByIdAndUpdate(bookingId, { $set: fields }, { new: true });
  }

  /* ************************************* Private Methods ******************************************** */
  private _updateBookingStatusAndNo = async (
    booking: BookingVo
  ): Promise<OrgCodeNoDto> => {
    const newUpdatedOrderNo = {} as OrgCodeNoDto;
    const lastBookingOrder = await new MetaOrgService().getLastCodeNo(
      booking.orgId
    );
    booking.status = BOOKING_STATUS.PENDING;
    // booking.no = String(lastBookingOrder.no + 1);
    // newUpdatedOrderNo.no = lastBookingOrder.no + 1;
    booking.no = String(lastBookingOrder.no);
    newUpdatedOrderNo.no = lastBookingOrder.no;
    //@todo frontend will send BOOKING_TYPE PATIENT ALSO
    if (booking.type != BOOKING_TYPE.APPOINTMENT) {
      // booking.patientNo = String(lastBookingOrder.patientNo + 1);
      // newUpdatedOrderNo.patientNo = lastBookingOrder.patientNo + 1;
      booking.patientNo = String(lastBookingOrder.patientNo);
      newUpdatedOrderNo.patientNo = lastBookingOrder.patientNo;
      booking.status = BOOKING_STATUS.CONFIRMED;
    }
    return newUpdatedOrderNo;
  };

  
}
