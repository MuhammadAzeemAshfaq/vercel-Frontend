import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingBar from 'react-top-loading-bar';

function Invoices() {
  const [progress, setProgress] = useState(0);
  const [allInvoices, setAllInvoices] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState([]);

  const fetchInvoices = async () => {
    setProgress(30);
    const hostel = JSON.parse(localStorage.getItem("hostel"));

    try {
      const response = await fetch("http://localhost:3000/api/invoice/getbyid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostel: hostel._id }),
      });
      setProgress(60);

      const data = await response.json();
      if (data.success) {
        setAllInvoices(data.invoices);
        setPendingInvoices(data.invoices.filter(invoice => invoice.status === "pending"));
      } else {
        toast.error(data.errors, toastOptions);
      }
    } catch (error) {
      toast.error(error.errors, toastOptions);
    }

    setProgress(100);
  };

  const generateInvoices = async () => {
    setProgress(30);
    const hostel = JSON.parse(localStorage.getItem("hostel"));

    try {
      const response = await fetch("http://localhost:3000/api/invoice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostel: hostel._id }),
      });
      setProgress(60);

      const data = await response.json();
      if (data.success) {
        toast.success("Invoices generated successfully!", toastOptions);
        fetchInvoices();
      } else {
        toast.error(data.errors, toastOptions);
      }
    } catch (error) {
      toast.error(error.errors, toastOptions);
    }

    setProgress(100);
  };

  const approveInvoice = async (studentId) => {
    setProgress(30);

    try {
      const response = await fetch("http://localhost:3000/api/invoice/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student: studentId, status: "approved" }),
      });
      setProgress(60);

      const data = await response.json();
      if (data.success) {
        toast.success("Invoice approved successfully!", toastOptions);
        fetchInvoices();
      } else {
        toast.error("Failed to approve invoice!", toastOptions);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.", toastOptions);
    }

    setProgress(100);
  };

  const toastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="w-full h-screen flex flex-col gap-3 items-center justify-center">
      <LoadingBar color="#0000FF" progress={progress} onLoaderFinished={() => setProgress(0)} />

      <h1 className="text-white font-bold text-5xl">Invoices</h1>

      <button
        onClick={generateInvoices}
        className="py-3 px-7 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-800 transition-all"
      >
        Generate Invoices
      </button>

      <div className="bg-neutral-950 px-10 py-5 rounded-xl shadow-xl sm:w-[50%] sm:min-w-[500px] w-full mt-5 max-h-96 overflow-auto">
        <span className="text-white font-bold text-xl">Pending Invoices</span>

        <ul className="divide-y divide-gray-700 text-white">
          {pendingInvoices.length === 0 ? (
            <p>No Pending Invoices</p>
          ) : (
            pendingInvoices.map((invoice) => (
              <li
                key={invoice.id}
                className="py-3 px-5 rounded sm:py-4 hover:bg-neutral-700 hover:scale-105 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
                      />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{invoice.student.name}</p>
                    <p className="text-sm truncate text-gray-400">
                      Room: {invoice.student.room_no} | Amount: ₹{invoice.amount}
                    </p>
                  </div>

                  <button
                    className="group relative"
                    onClick={() => approveInvoice(invoice.student._id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 group-hover:scale-125 group-hover:text-green-600 transition-all"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-xs hidden absolute px-2 -right-10 top-6 bg-black text-center group-hover:block rounded">
                      Approve Payment
                    </span>
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <ToastContainer />
    </div>
  );
}

export default Invoices;
