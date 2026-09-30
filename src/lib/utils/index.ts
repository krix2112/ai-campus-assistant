import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextResponse } from "next/server";
import { ApiError } from "@/types";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function apiSuccess<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export function apiError(code: string, message: string, status = 400): NextResponse<ApiError> {
  return NextResponse.json({ code, message }, { status });
}

export const successResponse = apiSuccess;
export const errorResponse = (message: string, code = "BAD_REQUEST", status = 400) =>
  apiError(code, message, status);
