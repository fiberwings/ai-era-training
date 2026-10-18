// The distributable embeds these payloads; the development app loads local files.
export const portable = !!document.getElementById('embedded-catalogue');
export async function loadData(name) {
  const embedded = document.getElementById('embedded-' + name);
  if (embedded) return JSON.parse(embedded.textContent);
  const response = await fetch('./data/' + name + '.json');
  if (!response.ok) throw Error('Could not load ' + name);
  return response.json();
}
export function createSolverWorker() {
  const embedded = document.getElementById('embedded-worker');
  if (!embedded) return new Worker('./solver-worker.js');
  const url = URL.createObjectURL(new Blob([JSON.parse(embedded.textContent)], {type:'text/javascript'}));
  try {
    const worker = new Worker(url);
    const terminate = worker.terminate.bind(worker);
    worker.terminate = () => { terminate(); URL.revokeObjectURL(url); };
    return worker;
  } catch (error) { URL.revokeObjectURL(url); throw error; }
}
