export default async function fetch2(method, params) {
	let fetch_params = params || "";
	const data = await fetch(
		"https://services.koka.team/links/api.php?" +
			window.location.href.slice(window.location.href.indexOf("?") + 1),
		{
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: "method=" + method + "&" + fetch_params,
		}
	);
	return await data.json();
}
