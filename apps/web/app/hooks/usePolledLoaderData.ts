import type { LoaderFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";

/**
 * Unwrap a json response from a loader into its data type
 */
type LoaderJson<T extends LoaderFunction = LoaderFunction> = Awaited<
  ReturnType<Awaited<ReturnType<T>>["json"]>
>;

/**
 * Get LoaderData from the closest route, then, if enabled, poll a loader route by href
 * and replace data with it until the poll condition passes
 *
 * @param href - the loader url to poll, unfortunately required by useFetcher. Should be the same
 *  as the route this hook is called on.
 * @param shouldPoll - a function, receiving current loaderData, that determines if the poll should
 *  continue
 * @param interval - how often, in ms, to poll the loader
 *
 * @returns loader data
 */
export const usePolledLoaderData = <T extends LoaderFunction = LoaderFunction>(
  href: string,
  shouldPoll: (data: LoaderJson<T>) => boolean,
  interval: number = 2000
) => {
  const fetcher = useFetcher();
  const loaderData = useLoaderData();
  const [data, setData] = useState(loaderData);

  // Whenever the loader gives us new data
  // (for example, after a form submission),
  // update our `data` state.
  useEffect(() => setData(loaderData), [loaderData]);

  const willPoll = shouldPoll(data);

  // Poll data if `willPoll`
  useEffect(() => {
    if (!willPoll) {
      return () => {};
    }

    const intervalId = setInterval(() => {
      if (fetcher.state === "idle") {
        fetcher.load(href);
      }
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
    // fetcher is not stable...
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [willPoll, interval, href]);

  // When the fetcher comes back with new data,
  // update our `data` state.
  useEffect(() => {
    if (fetcher.data) {
      setData(fetcher.data);
    }
  }, [fetcher.data]);

  return data as LoaderJson<T>;
};
