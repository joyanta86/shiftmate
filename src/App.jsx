import { useState, useEffect } from "react";

// Utility: Convert data to CSV
const exportToCSV = (data, year) => {
  const rows = [
    ["Month", "Total Hours", "Gross (€)", "Tax (€)", "Net (€)"],
    ...data.map((m) => [m.month, m.totalHours, m.gross.toFixed(2), m.tax.toFixed(2), m.net.toFixed(2)]),
  ];

  const csvContent =
    "data:text/csv;charset=utf-8," +
    rows.map((e) => e.join(",")).join("\n");

  const link = document.createElement("a");
  link.href = encodeURI(csvContent);
  link.download = `ShiftMate_${year}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

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

  const generateYearlyData = () => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const yearlyData = months.map((m) => {
      const saved = localStorage.getItem(`${year}-${m}`);
      if (!saved) return { month: m, totalHours: 0, gross: 0, tax: 0, net: 0 };
      const data = JSON.parse(saved);
      const totalH = data.reduce((s, d) => s + d.hours, 0);
      const gross = totalH * hourlyRate;
      const tax = (gross * taxRate) / 100;
      const net = gross - tax;
      return { month: m, totalHours: totalH, gross, tax, net };
    });
    return yearlyData;
  };

  const yearlyData = generateYearlyData();
  const yearlyHours = yearlyData.reduce((s, m) => s + m.totalHours, 0);
  const yearlyGross = yearlyData.reduce((s, m) => s + m.gross, 0);
  const yearlyTax = yearlyData.reduce((s, m) => s + m.tax, 0);
  const yearlyNet = yearlyData.reduce((s, m) => s + m.net, 0);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">ShiftMate</h1>

        <div className="flex flex-wrap justify-between gap-4 mb-6">
          <div>
            <label className="block text-sm">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border p-2 rounded w-28"
            />
          </div>
          <div>
            <label className="block text-sm">Month</label>
            <input
              type="number"
              value={month}
              min="1"
              max="12"
              onChange={(e) => setMonth(e.target.value)}
              className="border p-2 rounded w-28"
            />
          </div>
          <div>
            <label className="block text-sm">Hourly Rate (€)</label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
              className="border p-2 rounded w-32"
            />
          </div>
          <div>
            <label className="block text-sm">Tax Rate (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value))}
              className="border p-2 rounded w-32"
            />
          </div>
        </div>

        <div className="flex justify-between mb-4">
          <button
            onClick={addWorkDay}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + Add Work Day
          </button>
          <button
            onClick={() => setShowYearly(!showYearly)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            {showYearly ? "Back to Month" : "View Yearly Summary"}
          </button>
        </div>

        {!showYearly ? (
          <>
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-2">Date</th>
                  <th className="p-2">Start</th>
                  <th className="p-2">End</th>
                  <th className="p-2">Hours</th>
                  <th className="p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {workDays.map((day, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <input
                        type="date"
                        value={day.date}
                        onChange={(e) => updateWorkDay(index, "date", e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="time"
                        value={day.start}
                        onChange={(e) => updateWorkDay(index, "start", e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="time"
                        value={day.end}
                        onChange={(e) => updateWorkDay(index, "end", e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="p-2">{day.hours.toFixed(2)}</td>
                    <td className="text-center">
                      <button
                        onClick={() => deleteWorkDay(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p>Total Hours: <b>{totalHours.toFixed(2)} h</b></p>
              <p>Gross Salary: <b>€{grossSalary.toFixed(2)}</b></p>
              <p>Tax ({taxRate}%): <b>-€{taxAmount.toFixed(2)}</b></p>
              <p>Net Salary: <b className="text-green-600">€{netSalary.toFixed(2)}</b></p>
            </div>
          </>
        ) : (
          <>
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-2">Month</th>
                  <th className="p-2">Total Hours</th>
                  <th className="p-2">Gross (€)</th>
                  <th className="p-2">Tax (€)</th>
                  <th className="p-2">Net (€)</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.map((m, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{m.month}</td>
                    <td className="p-2">{m.totalHours.toFixed(2)}</td>
                    <td className="p-2">€{m.gross.toFixed(2)}</td>
                    <td className="p-2">€{m.tax.toFixed(2)}</td>
                    <td className="p-2 text-green-600">€{m.net.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p>Yearly Total Hours: <b>{yearlyHours.toFixed(2)} h</b></p>
              <p>Yearly Gross: <b>€{yearlyGross.toFixed(2)}</b></p>
              <p>Yearly Tax: <b>-€{yearlyTax.toFixed(2)}</b></p>
              <p>Yearly Net: <b className="text-green-600">€{yearlyNet.toFixed(2)}</b></p>
            </div>

            <button
              onClick={() => exportToCSV(yearlyData, year)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Export Yearly Data (CSV)
            </button>
          </>
        )}
      </div>
    </div>
  );
}

