import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import type { DateRange } from "react-day-picker";
import { parseISO, eachDayOfInterval } from "date-fns";

interface BookingCalendarProps {
  villaId: string;
  selectedRange?: DateRange;
  onSelectRange: (range: DateRange | undefined) => void;
  mode?: "range" | "single";
}

const BookingCalendar = ({
  villaId,
  selectedRange,
  onSelectRange,
  mode = "range",
}: BookingCalendarProps) => {
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);

  useEffect(() => {
    const loadBlockedDates = async () => {
      const q = query(
        collection(db, "bookings"),
        where("villa_id", "==", villaId),
        where("status", "==", "confirmed")
      );

      const snap = await getDocs(q);

      const blocked: Date[] = [];

      snap.docs.forEach((doc) => {
        const { start_date, end_date } = doc.data();

        const days = eachDayOfInterval({
          start: parseISO(start_date),
          end: parseISO(end_date),
        });

        blocked.push(...days);
      });

      setDisabledDates(blocked);
    };

    loadBlockedDates();
  }, [villaId]);

  return (
    <DayPicker
      mode={mode}
      selected={selectedRange}
      onSelect={onSelectRange}
      disabled={disabledDates}
      modifiersClassNames={{
        disabled: "opacity-50 cursor-not-allowed",
      }}
    />
  );
};

export default BookingCalendar;
