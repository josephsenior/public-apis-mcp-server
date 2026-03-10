import axios from "axios";

const README_URL =
  "https://raw.githubusercontent.com/public-apis/public-apis/master/README.md";

export async function fetchReadme(): Promise<string> {
  const response = await axios.get<string>(README_URL, { timeout: 10_000 });
  return response.data;
}
