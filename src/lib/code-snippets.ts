export interface CodeChallenge {
  id: string;
  name: string;
  description: string;
  code: string;
}

export const cleanChallenges: CodeChallenge[] = [
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    description: 'Implement a BFS algorithm to traverse a graph and find the shortest path.',
    code: `async function findShortestPath(graph, start, end) {
  let queue = [{ node: start, path: [start] }];
  let visited = new Set();
  visited.add(start);

  while (queue.length > 0) {
    let { node, path } = queue.shift();

    if (node === end) {
      return path;
    }

    let neighbors = await graph.getNeighbors(node);
    for (let i = 0; i < neighbors.length; i++) {
      let neighbor = neighbors[i];
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ node: neighbor, path: [...path, neighbor] });
      }
    }
  }
  return null;
}`
  },
  {
    id: 'use-fetch',
    name: 'useFetch Hook',
    description: 'A custom React hook to fetch data with loading and error states.',
    code: `import { useState, useEffect } from 'react';

export function useFetch(url) {
  let [data, setData] = useState(null);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        let response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        let result = await response.json();
        
        if (isMounted === true) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted === true) {
          setError(err.message);
          setData(null);
        }
      } finally {
        if (isMounted === true) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url]);

  return { data, loading, error };
}`
  }
];

export function getRandomChallenge(): CodeChallenge {
  return cleanChallenges[Math.floor(Math.random() * cleanChallenges.length)];
}
