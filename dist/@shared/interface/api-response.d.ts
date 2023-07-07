/**
 * ApiResponse
 */
export declare class ApiResponse<T> {
    code: number;
    status: string;
    body: T | null;
    data: any;
    msg: string | null;
    errorMessage: string | null;
    constructor();
}
