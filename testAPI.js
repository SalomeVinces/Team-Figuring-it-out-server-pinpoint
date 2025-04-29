import { fetchFromOpenStates } from "./services/openStatesApiService.js"

(async () => {
  const data = await fetchFromOpenStates('/bills', { jurisdiction: 'ga' });
  console.log(data);
})();