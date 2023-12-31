import { useEffect, useState } from "react";
import Chart from "chart.js/auto";

export function Stats() {
	const [chartData, setChartData] = useState(null);

	useEffect(() => {
		const storedChartData = JSON.parse(localStorage.getItem("chartData"));

		if (storedChartData) {
			setChartData(storedChartData);
			console.log("Chart data retrieved from localStorage.", storedChartData);
		} else {
			console.error("Chart data not found.");
		}
	}, []);

	useEffect(() => {
		if (chartData) {
			const ctx = document.getElementById("myChart");

			if (ctx) {
				new Chart(ctx, {
					type: "bar",
					data: {
						labels: chartData.map((item) => item[0]),
						datasets: [
							{
								label: "Amount",
								data: chartData.map((item) => item[1]),
								backgroundColor: ["rgba(75, 192, 192, 0.2)", "rgba(255, 99, 132, 0.2)"],
								borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
								borderWidth: 1,
							},
						],
					},
					options: {
						scales: {
							y: {
								type: "linear",
								beginAtZero: true,
							},
						},
					},
				});
			}
		}
	}, [chartData]);

	return (
		<div className='w-full mx-auto py-10 min-h-screen'>
			<canvas id='myChart'></canvas>
		</div>
	);
}
