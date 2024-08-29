import React from "react";

const ProgressBar = ({ progress }) => {
	return (
		<div className="mt-4">
			<div className="w-full bg-gray-200 rounded-full h-2.5">
				<div
					className="bg-blue-600 h-2.5 rounded-full"
					style={{ width: `${progress}%` }}
				></div>
			</div>
			<p className="text-center mt-2">{progress}% Downloaded</p>
		</div>
	);
};

export default ProgressBar;
