import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([
    {
      title: "Mess bill",
      date: "20-5-2023",
      amount: "Rs. 690",
      status: "pending",
    },
    {
      title: "Mess bill",
      date: "20-5-2023",
      amount: "Rs. 690",
      status: "pending",
    },
  ]);

  useEffect(() => {
    const fetchInvoices = async () => {
      const student = JSON.parse(localStorage.getItem("student"));
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/invoice/student`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ student: student._id }),
        });
        const data = await response.json();
        if (data.success) {
          const formattedInvoices = data.invoices
            .filter((invoice) => invoice.status.toLowerCase() === "pending")
            .map((invoice) => {
              const formattedDate = new Date(invoice.date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
              return {
                title: invoice.title,
                amount: `Rs. ${invoice.amount}`,
                status: invoice.status,
                date: formattedDate,
              };
            });
          setInvoices(formattedInvoices);
        }
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      }
    };

    fetchInvoices();
  }, []);

  return (
    <div className="w-full max-w-md p-4 rounded-lg shadow sm:p-8 bg-neutral-950 drop-shadow-xl overflow-y-auto max-h-70">
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-xl font-bold text-white">Pending Invoices</h5>
      </div>
      <div className="flow-root">
        <ul role="list" className="divide-y divide-gray-700">
          {invoices.map((invoice, index) => (
            <li key={index} className="py-3 sm:py-4">
              <div className="flex items-center space-x-4">
                <div className="text-white">
                  {invoice.status.toLowerCase() === "pending" ? (
                    <PendingIcon />
                  ) : (
                    <PaidIcon />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{invoice.title}</p>
                  <p className="text-sm text-gray-400 truncate">{invoice.date}</p>
                </div>
                <div className="text-white font-semibold">{invoice.amount}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const PendingIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-8 h-8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const PaidIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-8 h-8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

const Home = () => {
  const [daysAbsent, setDaysAbsent] = useState(0);
  const student = JSON.parse(localStorage.getItem("student"));

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/attendance/get`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ student: student._id }),
        });
        const data = await res.json();
        if (data.success) {
          const absentDays = data.attendance.filter((entry) => entry.status === "absent").length;
          setDaysAbsent(absentDays);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    };

    fetchAttendance();
  }, [student._id]);

  const totalDays = new Date().getDate();
  const attendanceLabels = ["Days Absent", "Days Present"];

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-5 pt-64 lg:pt-0 md:pt-64 sm:pt-96 overflow-y-auto">
      <h1 className="text-5xl font-bold text-white text-center">
        Welcome, <span className="text-blue-500">{student.name}!</span>
      </h1>
      <div className="flex flex-wrap justify-center gap-5 w-full">
        <InvoiceList />
        <div className="flex flex-col items-center bg-neutral-950 rounded-xl shadow-xl p-5">
          <span className="text-xl text-white mb-2">Attendance</span>
          <Doughnut
            datasetIdKey="id"
            data={{
              labels: attendanceLabels,
              datasets: [
                {
                  label: "Days",
                  data: [daysAbsent, totalDays - daysAbsent],
                  backgroundColor: ["#F26916", "#1D4ED8"],
                  borderColor: "transparent",
                  hoverOffset: 10,
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
