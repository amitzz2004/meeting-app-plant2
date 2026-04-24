import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function MyCalendar({ meetings }) {
  const events = meetings.map((m) => ({
    title: `${m.title} (${m.status || "PENDING"})`,
    start: new Date(m.startTime),
    end: new Date(m.endTime),
    resource: m
  }));

  const handleSelectEvent = (event) => {
    alert(`Meeting: ${event.title}`);
  };

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      defaultView="week"
      views={["month", "week", "day"]}
      style={{ height: 600 }}
      onSelectEvent={handleSelectEvent}
    />
  );
}