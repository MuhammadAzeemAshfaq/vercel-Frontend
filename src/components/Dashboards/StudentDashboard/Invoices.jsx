import { useState, useEffect } from "react";

const Invoices = () => {
  const [invoiceList, setInvoiceList] = useState([]);
  const [invoiceStats, setInvoiceStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
  });

  useEffect(() => {
    const fetchInvoices = async () => {
      const student = JSON.parse(localStorage.getItem("student"));
      try {
        const response = await fetch("http://localhost:3000/api/invoice/student", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ student: student._id }),
        });
        const data = await response.json();

        if (data.success) {
          let paidCount = 0;
          let pendingCount = 0;
          const formattedInvoices = data.invoices.map((invoice) => {
            const formattedDate = new Date(invoice.date).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            if (invoice.status.toLowerCase() === "paid") {
              paidCount += 1;
            } else {
              pendingCount += 1;
            }
            return {
              title: invoice.title,
              amount: `Rs. ${invoice.amount}`,
              status: invoice.status,
              date: formattedDate,
            };
          });

          setInvoiceList(formattedInvoices);
          setInvoiceStats({
            total: data.invoices.length,
            paid: paidCount,
            pending: pendingCount,
          });
        }
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      }
    };

    fetchInvoices();
  }, []);

  return (
    <div className="w-full h-screen flex flex-col gap-5 items-center justify-center max-h-screen overflow-y-auto">
      <h1 className="text-white font-bold text-5xl">Invoices</h1>
      <p className="text-white text-xl text-center px-5 sm:p-0">
        View all your invoices, including bills for Mess, Hostel, and more.
      </p>

      <div className="flex gap-10 items-center my-5">
        <div className="flex flex-col items-center justify-center">
          <dt className="mb-2 ml-2 text-5xl font-extrabold text-blue-700">{invoiceStats.total}</dt>
          <dd className="text-gray-400 text-center">Total Invoices</dd>
        </div>
        <div className="flex flex-col items-center justify-center">
          <dt className="mb-2 text-5xl font-extrabold text-blue-700">{invoiceStats.paid}</dt>
          <dd className="text-gray-400">Paid Invoices</dd>
        </div>
        <div className="flex flex-col items-center justify-center">
          <dt className="mb-2 text-5xl font-extrabold text-blue-700">{invoiceStats.pending}</dt>
          <dd className="text-gray-400">Pending Invoices</dd>
        </div>
      </div>

      <div className="w-full max-w-md p-4 border rounded-lg shadow sm:p-8 bg-neutral-950 border-neutral-900 drop-shadow-xl overflow-y-auto max-h-70">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-xl font-bold leading-none text-white">Latest Invoices</h5>
        </div>
        <div className="flow-root">
          <ul role="list" className="divide-y divide-gray-700">
            {invoiceList.length === 0 ? (
              <li className="text-center text-gray-400 py-4">No invoices found</li>
            ) : (
              invoiceList.map((invoice, index) => (
                <li key={index} className="py-3 sm:py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 text-white">
                      {invoice.status.toLowerCase() === "pending" ? (
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
                      ) : (
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
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-white">{invoice.title}</p>
                      <p className="text-sm truncate text-gray-400">{invoice.date}</p>
                    </div>
                    <div className="flex flex-col items-center text-base font-semibold text-white">
                      {invoice.amount}
                    </div>
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

export default Invoices;
