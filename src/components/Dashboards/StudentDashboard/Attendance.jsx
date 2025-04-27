import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";

const Attendance = () => {
  const [totalDays, setTotalDays] = useState(0);
  const [absentDays, setAbsentDays] = useState(0);
  const [weeklySummary, setWeeklySummary] = useState([]);

  const fetchAttendanceData = async () => {
    const studentData = JSON.parse(localStorage.getItem("student"));
    if (!studentData) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/attendance/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ student: studentData._id }),
      });
      const result = await response.json();

      if (result.success) {
        let missedDays = 0;
        const recentWeekData = result.attendance
          .filter((record) => {
            if (record.status === "absent") missedDays++;
            return new Date(record.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          })
          .map((record) => ({
            date: new Date(record.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
            dayName: new Date(record.date).toLocaleDateString('en-PK', { weekday: 'long' }),
            wasPresent: record.status === "present",
          }));

        setAbsentDays(missedDays);
        setWeeklySummary(recentWeekData);
        setTotalDays(result.attendance.length);
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    }
  };

  const doughnutLabels = ["Days Absent", "Days Present"];

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col gap-6 items-center justify-start pt-20 md:pt-0 overflow-y-auto">
      <h1 className="text-white text-5xl font-bold">Attendance Overview</h1>

      <ul className="flex flex-wrap gap-6 text-white text-xl justify-center">
        <li>Total Days: {totalDays}</li>
        <li>Days Present: {totalDays - absentDays}</li>
        <li>Days Absent: {absentDays}</li>
      </ul>

      <div className="flex flex-wrap gap-8 justify-center items-center w-full max-w-5xl p-5">
        <div className="w-72 h-72">
          <Doughnut
            data={{
              labels: doughnutLabels,
              datasets: [
                {
                  label: "Attendance",
                  data: [absentDays, totalDays - absentDays],
                  backgroundColor: ["#F26916", "#1D4ED8"],
                  borderColor: "transparent",
                  hoverOffset: 10,
                },
              ],
            }}
            options={{
              plugins: { legend: { display: true } },
            }}
          />
        </div>

        <div className="bg-neutral-950 rounded-xl shadow-lg w-full sm:w-80 p-5 overflow-y-auto max-h-96">
          <h2 className="text-white text-xl font-bold mb-4">This Week</h2>
          <ul className="divide-y divide-gray-700">
            {weeklySummary.length === 0 ? (
              <li className="text-gray-400 text-center">No attendance data for this week</li>
            ) : (
              weeklySummary.map((entry, index) => (
                <li key={index} className="py-3 flex items-center space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-white">
                      {entry.dayName} — {entry.date}
                    </p>
                    <p className="text-sm text-gray-400">{entry.wasPresent ? "Present" : "Absent"}</p>
                  </div>
                  <div>
                    {entry.wasPresent ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
