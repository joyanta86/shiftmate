import { useState, useEffect } from "react";
import "./index.css";


export default function App() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [workDays, setWorkDays] = useState([]);
  const [hourlyRate, setHourlyRate] = useState(12);
  const [taxRate, setTaxRate] = useState(10);
  const [showYearly, setShowYearly] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem(`${year}-${month}`);
    if (savedData) setWorkDays(JSON.parse(savedData));
    else setWorkDays([]);
  }, [year, month]);

  useEffect(() => {
    localStorage.setItem(`${year}-${month}`, JSON.stringify(workDays));
  }, [workDays, year, month]);

  const addWorkDay = () => {
    setWorkDays([...workDays, { date: "", start: "", end: "", hours: 0 }]);
  };

  const updateWorkDay = (index, field, value) => {
    const updated = [...workDays];
    updated[index][field] = value;

    if (updated[index].start && updated[index].end) {
      const start = new Date(`2000-01-01T${updated[index].start}`);
      const end = new Date(`2000-01-01T${updated[index].end}`);
      const diff = (end - start) / (1000 * 60 * 60);
      updated[index].hours = diff > 0 ? diff : 0;
    }

    setWorkDays(updated);
  };

  const deleteWorkDay = (index) => {
    setWorkDays(workDays.filter((_, i) => i !== index));
  };

  const totalHours = workDays.reduce((sum, d) => sum + d.hours, 0);
  const grossSalary = totalHours * hourlyRate;
  const taxAmount = (grossSalary * taxRate) / 100;
  const netSalary = grossSalary - taxAmount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 text-gray-800 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">
        <h1 className="text-4xl font-extrabold text-center text-blue-600 mb-2 tracking-tight">
          ShiftMate
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Track your work hours, income & tax — simple and elegant.
        </p>

        {/* Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-600">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Month</label>
            <input
              type="number"
              value={month}
              min="1"
              max="12"
              onChange={(e) => setMonth(e.target.value)}
              className="border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Hourly Rate (€)</label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
              className="border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Tax Rate (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value))}
              className="border border-gray-300 rounded-lg w-full p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={addWorkDay}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-md transition"
          >
            + Add Work Day
          </button>
          <button
            onClick={() => setShowYearly(!showYearly)}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium shadow-md transition"
          >
            {showYearly ? "Back to Month" : "View Yearly Summary"}
          </button>
        </div>

        {/* Monthly View */}
        {!showYearly ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse mb-6">
                <thead>
                  <tr className="bg-blue-50 text-left border-b">
                    <th className="p-3">Date</th>
                    <th className="p-3">Start</th>
                    <th className="p-3">End</th>
                    <th className="p-3">Hours</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {workDays.map((day, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-blue-50 transition"
                    >
                      <td className="p-3">
                        <input
                          type="date"
                          value={day.date}
                          onChange={(e) =>
                            updateWorkDay(index, "date", e.target.value)
                          }
                          className="border rounded-md w-full p-1"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="time"
                          value={day.start}
                          onChange={(e) =>
                            updateWorkDay(index, "start", e.target.value)
                          }
                          className="border rounded-md w-full p-1"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="time"
                          value={day.end}
                          onChange={(e) =>
                            updateWorkDay(index, "end", e.target.value)
                          }
                          className="border rounded-md w-full p-1"
                        />
                      </td>
                      <td className="p-3 font-semibold text-gray-700">
                        {day.hours.toFixed(2)}
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => deleteWorkDay(index)}
                          className="text-red-500 hover:text-red-700 text-lg"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center bg-slate-50 p-4 rounded-xl border">
              <div>
                <p className="text-gray-500 text-sm">Total Hours</p>
                <p className="text-xl font-semibold">{totalHours.toFixed(2)} h</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Gross</p>
                <p className="text-xl font-semibold text-blue-600">
                  €{grossSalary.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Tax ({taxRate}%)</p>
                <p className="text-xl font-semibold text-red-500">
                  -€{taxAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Net</p>
                <p className="text-xl font-semibold text-green-600">
                  €{netSalary.toFixed(2)}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-600 py-10">
            <p>Yearly summary view coming soon...</p>
          </div>
        )}

        <p className="text-center text-gray-400 mt-8 text-sm">
          © {new Date().getFullYear()} <span className="font-semibold">Joyanta Dey</span> • ShiftMate
        </p>
      </div>
    </div>
  );
}

