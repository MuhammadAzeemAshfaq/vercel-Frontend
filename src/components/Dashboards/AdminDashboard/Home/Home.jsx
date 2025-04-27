import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "react-toastify";
import { ShortCard } from "./ShortCard";
import { List } from "./List";
import { getAllStudents } from "../../../../utils";

function Home() {
  const admin = JSON.parse(localStorage.getItem("admin")) || {};
  const hostel = JSON.parse(localStorage.getItem("hostel")) || {};

  const [studentsCount, setStudentsCount] = useState(0);
  const [complaintsData, setComplaintsData] = useState([]);
  const [pendingSuggestions, setPendingSuggestions] = useState([]);
  const [messOffRequests, setMessOffRequests] = useState([]);

  const fetchStudents = async () => {
    const response = await getAllStudents();
    if (response.success) {
      setStudentsCount(response.students.length);
    }
  };

  const fetchComplaints = async () => {
    try {
      const hostelId = hostel._id;
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/complaint/hostel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostel: hostelId }),
      });
      const result = await res.json();
      if (result.success) {
        setComplaintsData(result.complaints);
      } else {
        throw new Error("Failed to fetch complaints");
      }
    } catch (err) {
      toast.error("Unable to fetch complaints!", { position: "top-right" });
    }
  };

  const fetchSuggestions = async () => {
    try {
      const hostelId = hostel._id;
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/suggestion/hostel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostel: hostelId }),
      });
      const result = await res.json();
      if (result.success) {
        const pending = result.suggestions.filter(item => item.status === "pending");
        setPendingSuggestions(pending);
      } else {
        throw new Error("Failed to fetch suggestions");
      }
    } catch (err) {
      toast.error("Unable to fetch suggestions!", { position: "top-right" });
    }
  };

  const fetchMessOffRequests = async () => {
    try {
      const hostelId = hostel._id;
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/messoff/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostel: hostelId }),
      });
      const result = await res.json();
      if (result.success) {
        const formattedRequests = result.list.map(request => ({
          id: request._id,
          from: new Date(request.leaving_date).toDateString().slice(4, 10),
          to: new Date(request.return_date).toDateString().slice(4, 10),
          title: `${request.student.name} [Room: ${request.student.room_no}]`,
          desc: `${new Date(request.leaving_date).toDateString().slice(4, 10)} to ${new Date(request.return_date).toDateString().slice(4, 10)}`,
          status: request.status,
          student: request.student,
        }));
        setMessOffRequests(formattedRequests);
      }
    } catch (err) {
      toast.error("Unable to fetch mess off requests!", { position: "top-right" });
    }
  };

  const prepareChartData = (complaintsArray) => {
    const dateMap = complaintsArray.reduce((acc, complaint) => {
      const date = new Date(complaint.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "UTC",
      });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(dateMap).map(([date, count]) => ({ name: date, DailyComplaints: count }));
  };

  useEffect(() => {
    fetchStudents();
    fetchComplaints();
    fetchSuggestions();
    fetchMessOffRequests();
  }, []);

  const complaintChartData = prepareChartData(complaintsData);

  const messIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  );

  const suggestionIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const complaintGraph = (
    <ResponsiveContainer width="100%" height="85%" className="bg-neutral-950 px-7 py-5 rounded-xl shadow-xl w-full max-w-[350px] max-h-96">
      <AreaChart data={complaintChartData} margin={{ top: 5, right: 50, bottom: 15, left: -25 }}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" />
        <Legend verticalAlign="top" height={36} />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="DailyComplaints" stroke="#8884d8" fill="url(#colorUv)" />
      </AreaChart>
    </ResponsiveContainer>
  );

  return (
    <div className="w-full h-screen flex flex-col gap-3 items-center justify-center max-h-screen overflow-x-hidden overflow-y-auto pt-[400px] sm:pt-96 md:pt-96 lg:pt-80 xl:pt-20">
      <h1 className="text-white font-bold text-5xl text-center">
        Welcome <span className="text-blue-500">{admin.name || "Admin"}</span>!
      </h1>
      <h2 className="text-white text-xl">Manager, {hostel.name || "Hostel"}</h2>
      <div className="flex w-full gap-5 sm:px-20 pt-5 flex-wrap items-center justify-center">
        <ShortCard title="Total Students" number={studentsCount} />
        <ShortCard title="Total Complaints" number={complaintsData.length} />
        <ShortCard title="Pending Suggestions" number={pendingSuggestions.length} />
      </div>
      <div className="flex w-full flex-wrap gap-5 sm:px-20 h-80 items-center justify-center">
        <List list={messOffRequests} title="Mess Off Requests" icon={messIcon} />
        {complaintGraph}
        <List list={pendingSuggestions} title="Suggestions" icon={suggestionIcon} />
      </div>
    </div>
  );
}

export default Home;
