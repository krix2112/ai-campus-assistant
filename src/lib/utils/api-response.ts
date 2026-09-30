import { NextResponse } from "next/server";
import { ApiError } from "@/types";

export function successResponse<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export function errorResponse(
  message: string,
  code = "BAD_REQUEST",
  status = 400
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      code,
      message,
    },
    { status }
  );
}
