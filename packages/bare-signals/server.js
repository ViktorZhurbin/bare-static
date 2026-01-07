import polka from "polka";
import sirv from "sirv";
import { styleText } from "node:util";

const PORT = 3000;

polka()
	.use(sirv(".", { dev: true }))
	.listen(PORT, () => {
		console.log(
			`Open ${styleText("cyan", `http://localhost:${PORT}/demo`)} to view the demo`,
		);
	});
