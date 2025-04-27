import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { getAllStudents } from "../../../utils";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingBar from 'react-top-loading-bar';

function Attendance() {
  const [progress, setProgress] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [markedList, setMarkedList] = useState([]);
  const [unmarkedList, setUnmarkedList] = useState([]);

  const fetchAttendance = async () => {
    try {
      setProgress(30);
      const hostelId = JSON.parse(localStorage.getItem("hostel"))._id;
      const response = await fetch("http://localhost:3000/api/attendance/getHostelAttendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostel: hostelId }),
      });
      setProgress(50);
      const result = await response.json();

      if (result.success) {
        const marked = result.attendance.map((entry) => ({
          id: entry.student._id,
          cms: entry.student.cms_id,
          name: entry.student.name,
          room: entry.student.room_no,
          attendance: entry.status === "present",
        }));
        setMarkedList(marked);

        const allStudentsData = await getAllStudents();
        const allStudents = allStudentsData.students;

        const unmarked = allStudents
          .filter((student) => !marked.some((m) => m.id === student._id))
          .map((student) => ({
            id: student._id,
            cms: student.cms_id,
            name: student.name,
            room: student.room_no,
            attendance: undefined,
          }));

        setUnmarkedList(unmarked);
        setProgress(100);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to fetch attendance data.", { position: "top-right" });
    }
  };

  const handleMarkAttendance = async (studentId, status) => {
    try {
      const res = await fetch(`http://localhost:3000/api/attendance/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student: studentId, status: status ? "present" : "absent" }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Attendance updated!", { position: "top-right", autoClose: 3000 });
        updateStudentLists(studentId, status);
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Failed to mark attendance.", { position: "top-right" });
    }
  };

  const updateStudentLists = (id, isPresent) => {
    const updatedUnmarked = unmarkedList.map((student) => {
      if (student.id === id) {
        return { ...student, attendance: isPresent };
      }
      return student;
    });
    const remainingUnmarked = updatedUnmarked.filter((student) => student.attendance === undefined);
    const newlyMarked = updatedUnmarked.filter((student) => student.attendance !== undefined);

    setUnmarkedList(remainingUnmarked);
    setMarkedList((prev) => [...prev, ...newlyMarked]);
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    const count = markedList.filter((student) => student.attendance === true).length;
    setPresentCount(count);
  }, [markedList]);

  const todayDate = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const chartData = {
    labels: ["Present", "Absent", "Unmarked"],
    datasets: [
      {
        label: "Students",
        data: [presentCount, markedList.length - presentCount, unmarkedList.length],
        backgroundColor: ["#1D4ED8", "#F26916", "#808080"],
        hoverOffset: 10,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center overflow-auto max-h-screen pt-20 md:pt-40">
      <LoadingBar color="#0000FF" progress={progress} onLoaderFinished={() => setProgress(0)} />
      <h1 className="text-white text-5xl font-bold">Attendance</h1>
      <p className="text-white text-xl mb-10">Date: {todayDate}</p>

      <div className="flex gap-5 flex-wrap items-center justify-center">
        <div className="flex flex-row-reverse items-center gap-3 h-64">
          <Doughnut data={chartData} options={chartOptions} />
          <ul className="text-white">
            <li className="flex items-center gap-2"><span className="w-10 h-5 bg-orange-500 block"></span>Absent</li>
            <li className="flex items-center gap-2"><span className="w-10 h-5 bg-blue-500 block"></span>Present</li>
          </ul>
        </div>

        <div className="bg-neutral-950 px-7 py-5 rounded-lg shadow-xl max-h-[250px] overflow-auto md:w-[400px] w-full">
          <h2 className={`font-bold text-xl text-white ${unmarkedList.length ? "block" : "hidden"}`}>
            Unmarked Students
          </h2>
          <ul className="divide-y divide-gray-700 text-white">
            {unmarkedList.length === 0 ? (
              "All students are marked!"
            ) : (
              unmarkedList.map((student) => (
                <li
                  key={student.id}
                  className="py-3 sm:py-4 px-5 rounded hover:bg-neutral-700 hover:scale-105 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 text-white"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75c-2.68 0-5.23-.584-7.5-1.632z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{student.name}</p>
                      <p className="text-sm truncate text-gray-400">{student.cms} | Room: {student.room}</p>
                    </div>
                    <button
                      className="hover:underline hover:text-green-600 hover:scale-125 transition-all"
                      onClick={() => handleMarkAttendance(student.id, true)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      className="hover:underline hover:text-red-600 hover:scale-125 transition-all"
                      onClick={() => handleMarkAttendance(student.id, false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </div>
  );
}

export default Attendance;
