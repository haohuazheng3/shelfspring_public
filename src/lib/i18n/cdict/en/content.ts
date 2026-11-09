/**
 * English client strings: content — the first-screen stock checker (components/content/QuickCheck.tsx) and the
 * navigation skeletons (components/ui/RouteSkeletons.tsx). Plain data: "{n}" placeholders (fill), **bold** (Md).
 */
export const content = {
  quickCheck: {
    /** aria-label of the model switch. */
    model: "Choose an iPhone model",
    /** Search box label and placeholder. */
    search: "Find stores by ZIP, city or store name",
    useLocation: "Sort stores by my location",
    nearMe: "📍 Locate me",
    locationOff: "Location access is off here; enter a ZIP code instead.",
    /** {n} / {total}: stores with it now; {what}: the model, or a narrower label such as a colour of it. */
    storesNow: "{what}: on the shelf at **{n} / {total}** US Apple Stores right now",
    /** {place}: the typed ZIP / city / store, or "you". */
    nearestTo: " · sorted from {place}",
    you: "you",
    noMatch: "Nothing matched. Enter a five-digit ZIP or a city name.",
    /** {n} configurations of {total} at one store. */
    inStock: "{n} of {total} on shelf",
    soldOut: "Off the shelf",
    alertMe: "Add it to my watchlist",
    allStores: "Full store list ({n}) →",
    /** Drive time under a few hundred metres. */
    here: "here",
  },
  skeleton: {
    /** aria-label while the next page loads. */
    loading: "Loading",
  },
};
