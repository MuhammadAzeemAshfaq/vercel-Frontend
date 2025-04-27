import { useState, useEffect } from "react";
import { getAllStudents } from "../../../utils";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AllStudents = () => {
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    const response = await getAllStudents();
    if (response?.students) {
      setStudents(response.students);
    }
  };

  const downloadCSV = async () => {
    const hostelId = JSON.parse(localStorage.getItem('hostel'))?._id;
    try {
      const response = await fetch("http://localhost:3000/api/student/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostel: hostelId }),
      });

      const result = await response.json();

      if (result.success) {
        const csvLink = document.createElement("a");
        csvLink.href = `data:text/csv;charset=utf-8,${escape(result.csv)}`;
        csvLink.download = "students.csv";
        csvLink.click();
        toast.success("CSV has been downloaded!", { position: "top-right" });
      } else {
        throw new Error(result.errors?.[0]?.msg || "CSV Download failed");
      }
    } catch (error) {
      toast.error(error.message, { position: "top-right" });
    }
  };

  const removeStudent = async (studentId) => {
    try {
      const response = await fetch("http://localhost:3000/api/student/delete-student", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: studentId }),
      });

      const result = await response.json();

      if (result.success) {
        setStudents((prevStudents) => prevStudents.filter((stu) => stu._id !== studentId));
        toast.success("Student removed successfully!", { position: "top-right", theme: "dark" });
      } else {
        throw new Error(result.errors?.[0]?.msg || "Deletion failed");
      }
    } catch (error) {
      toast.error(error.message, { position: "top-right" });
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h2 className="text-white text-5xl font-bold">Student Directory</h2>

      <div className="flex justify-center w-80">
        <button
          onClick={downloadCSV}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md"
        >
          Download CSV
        </button>
      </div>

      <ToastContainer />

      <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full sm:w-[500px] max-h-[400px] overflow-y-auto mt-5">
        <h3 className="text-white text-2xl font-semibold mb-4">All Students</h3>
        <ul className="divide-y divide-gray-700">
          {students.length === 0 ? (
            <p className="text-gray-400">No students available.</p>
          ) : (
            students.map((student) => (
              <li
                key={student._id}
                className="py-4 px-4 hover:bg-gray-800 rounded-lg transition duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 
                          17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium truncate">{student.name}</p>
                    <p className="text-gray-400 text-sm truncate">
                      {student.cms_id} | Room {student.room_no}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {/* Edit Button - no action implemented */}
                  <button className="text-green-500 hover:scale-125 transition-transform">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 
                          2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 
                          18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM19.5 
                          7.125L18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 
                          2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      />
                    </svg>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeStudent(student._id)}
                    className="text-red-500 hover:scale-125 transition-transform"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 
                          1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 
                          01-2.244 2.077H8.084a2.25 2.25 0 
                          01-2.244-2.077L4.772 
                          5.79m14.456 0a48.108 48.108 0 
                          00-3.478-.397m-12 
                          .562c.34-.059.68-.114 1.022-.165m0 0a48.11 
                          48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 
                          51.964 0 00-3.32 0c-1.18.037-2.09 
                          1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 
                          00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default AllStudents;
