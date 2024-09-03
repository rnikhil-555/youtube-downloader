const { exec } = require("child_process");

// Example command to download a video using yt-dlp
exec(
	"./bin/yt-dlp_linux -f best https://www.youtube.com/watch?v=VIDEO_ID",
	(error, stdout, stderr) => {
		if (error) {
			console.error(`Error: ${error.message}`);
			return;
		}
		if (stderr) {
			console.error(`Stderr: ${stderr}`);
			return;
		}
		console.log(`Output: ${stdout}`);
	}
);
