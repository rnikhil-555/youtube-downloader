import React from "react";

const FormatSelector = ({ formats, onSelect }) => {
	return (
		<select
			onChange={(e) => onSelect(formats[e.target.value])}
			className="w-full text-black px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
		>
			<option value="">Select a format</option>
			{formats.map((format, index) => (
				<option key={format.itag} value={index}>
					{format.qualityLabel} - {format.container} ({format.codecs})
				</option>
			))}
		</select>
	);
};

export default FormatSelector;
