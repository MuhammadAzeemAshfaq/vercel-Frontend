import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Complaints() {
  const [unsolvedComplaints, setComplaints] = useState([]);
  const [resolvedComplaints, setResolvedComplaints] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [graphData, setGraphData] = useState([0, 0, 0, 0, 0, 0, 0]);

  const getComplaints = async () => {
    try {
      const hostel = JSON.parse(localStorage.getItem("hostel"))?._id;
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/complaint/hostel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostel }),
      });

      const data = await response.json();
      if (data.success) {
        const complaints = data.complaints.map((complaint) => {
          const date = new Date(complaint.date);
          return {
            id: complaint._id,
            type: complaint.type,
            title: complaint.title,
            desc: complaint.description,
            student: complaint.student.name,
            room: complaint.student.room_no,
            status: complaint.status,
            date: date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
          };
        });

        setAllComplaints(complaints);
        setResolvedComplaints(complaints.filter((c) => c.status.toLowerCase() !== "pending"));
        setComplaints(complaints.filter((c) => c.status.toLowerCase() === "pending"));
      } else {
        console.error(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const dismissComplaint = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/complaint/resolve`, {
        method: "PATCH", // corrected from POST to PATCH
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Complaint Dismissed", { autoClose: 2000 });
        setComplaints((prev) => prev.filter((complaint) => complaint.id !== id));
        setResolvedComplaints((prev) => [
          ...prev,
          ...allComplaints.filter((complaint) => complaint.id === id),
        ]);
      } else {
        toast.error("Something went wrong", { autoClose: 2000 });
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error", { autoClose: 2000 });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getComplaints();
    };
    fetchData();
  }, []);

  useEffect(() => {
    const dates = [...Array(7)].map((_, i) =>
      new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(
        "en-US",
        { day: "numeric", month: "long", year: "numeric" }
      )
    );

    setGraphData(
      dates.map((date) =>
        allComplaints.filter((complaint) => complaint.date === date).length
      )
    );
  }, [allComplaints]);

  const graph = (
    <div className="flex items-center justify-center md:h-64 h-40 md:w-96 w-full">
      <Line
        data={{
          labels: [...Array(7)].map((_, i) =>
            new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(
              "en-US",
              { day: "numeric", month: "long", year: "numeric" }
            )
          ),
          datasets: [
            {
              label: "No. of Complaints",
              pointHoverBackgroundColor: "orange",
              data: graphData,
            },
          ],
        }}
        options={{
          plugins: {
            legend: { display: false },
          },
        }}
      />
    </div>
  );

  return (
    <div className="w-full h-screen flex flex-col gap-10 md:gap-7 pt-32 items-center justify-center overflow-auto">
      <h1 className="text-white font-bold text-5xl">Complaints</h1>
      <div className="flex md:gap-7 flex-wrap justify-center items-center gap-7">
        {graph}
        <div className="bg-neutral-950 px-10 py-5 rounded-xl shadow-xl w-96 max-h-64 overflow-auto">
          <span className="text-white font-bold text-xl">New Complaints</span>
          <ul role="list" className="divide-y divide-gray-700 text-white">
            {unsolvedComplaints.length === 0 ? (
              "No new complaints!"
            ) : (
              unsolvedComplaints.map((complaint) => (
                <li
                  className="py-3 sm:py-4 px-5 rounded hover:bg-neutral-700 hover:scale-105 transition-all"
                  key={complaint.id} // corrected from complaint.student to complaint.id
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-7 h-7"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-white">
                        {complaint.title}
                      </p>
                      <p className="text-sm truncate text-gray-400">
                        {complaint.desc}
                      </p>
                    </div>
                    <button
                      className="hover:underline hover:text-green-600"
                      onClick={() => dismissComplaint(complaint.id)}
                    >
                      Solved
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
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="dark"
      />
    </div>
  );
}

export default Complaints;
