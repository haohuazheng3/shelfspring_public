/** English client strings: modules (MiniMap, and the other-trackers footnote that server and client modules share). */
export const modules = {
  /** MiniMap on a store page: {label} is the store's name ("Apple Fifth Avenue"). */
  minimap: {
    aria: "See {label} on the pickup atlas",
    cta: "See this store on the atlas →",
  },
  /**
   * Returns other trackers published (dashed / hollow marks in the charts), kept apart from the ledger. {sources}
   * their names, {range} the dates ("Oct 26 – Nov 1"), {mark} how the chart draws them, {what} "iPhone Duo return
   * reports", {links} the trackers' names linked to their sites.
   */
  reports: {
    legend: "Outside reports · {sources} · {range}",
    note: "{mark} = {what} that {links} posted for {range}. ShelfSpring did not observe these itself, so they stay outside the ledger and no figure here includes them.",
    /** {models} "iPhone Duo" or "iPhone Duo and iPhone 18 Pro". */
    what: "{models} return reports",
    whatAny: "return reports",
    /** How each chart draws them (the footnote starts with it). */
    markDashed: "Dashed outline",
    markDashedRings: "Dashed circles",
    markHollowDots: "Open circles",
  },
};
