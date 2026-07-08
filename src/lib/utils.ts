import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Subscription } from "../types";
import { startOfDay } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isSubscriptionOnDay(sub: Subscription, date: Date): boolean {
  const subDate = startOfDay(new Date(sub.endDate));
  const checkDate = startOfDay(date);

  return subDate.getMonth() === checkDate.getMonth() &&
         subDate.getDate() === checkDate.getDate() &&
         subDate.getFullYear() === checkDate.getFullYear();
}

export function isSubscriptionInMonth(sub: Subscription, date: Date): boolean {
  const subDate = startOfDay(new Date(sub.endDate));
  const checkDate = startOfDay(date);

  return subDate.getMonth() === checkDate.getMonth() &&
         subDate.getFullYear() === checkDate.getFullYear();
}

export function getNextOccurrence(sub: Subscription, fromDate: Date = new Date()): Date {
  const subDate = startOfDay(new Date(sub.endDate));
  const current = startOfDay(fromDate);
  
  let nextDate = new Date(current.getFullYear(), subDate.getMonth(), subDate.getDate());
  
  // If the initial subscription start is in the future, return that
  if (subDate.getTime() > current.getTime() && subDate.getFullYear() > current.getFullYear()) {
     return subDate;
  }
  
  if (nextDate.getTime() < current.getTime()) {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  }
  
  return nextDate;
}