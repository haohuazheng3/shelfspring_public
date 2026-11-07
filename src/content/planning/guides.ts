export interface PlanningGuide {
  slug: string; title: string; description: string; question: string; answer: string;
  tool: "delivery" | "stores" | "configuration" | "travel";
  sections: { title: string; paragraphs: string[] }[];
  checklist: string[];
  faqs: { question: string; answer: string }[];
}
export const PLANNING_REVIEWED = "2026-11-07";
export const PLANNING_HUB = "/pickup-planning";
export const planningGuides: readonly PlanningGuide[] = [
  {
    slug: "iphone-pickup-or-delivery", title: "iPhone pickup or delivery: build a plan that fits your deadline",
    description: "Compare a confirmed Apple pickup with a delivery estimate, travel effort and your deadline. Use a short decision tool before changing an iPhone order.",
    question: "Should I choose Apple Store pickup or delivery for my iPhone?",
    answer: "Choose the option you can actually complete within your deadline. Compare Apple's current delivery estimate with a confirmed pickup order and the time needed to collect it. A green stock result alone is not a reason to cancel an existing order or start driving.",
    tool: "delivery",
    sections: [
      { title: "Start with the date you need the phone, not the first green result", paragraphs: [
        "A delivery window and a nearby pickup listing answer different questions. The window is an estimate for an order and address. The listing is an observation that one configuration may be available at one store. Comparing them as if they were two confirmed arrival dates makes a fast looking option seem more certain than it is. Write down your actual deadline first, including time to set up the phone if it is needed for a trip, work or a trade-in.",
        "Then separate a preference from a requirement. Getting a phone this week may be pleasant; having a working device before a Monday departure may be essential. That difference determines how much uncertainty you can tolerate. If your current phone still works and delivery fits your schedule, pickup may save waiting but add little practical value. If you cannot receive a parcel reliably, collection may solve a real problem even when it is not earlier."
      ] },
      { title: "Compare equal configurations before comparing dates", paragraphs: [
        "Keep model, storage, color and buying conditions aligned. A pickup result for a different capacity is a different purchase, even if both cards say iPhone Duo. Decide whether you would still want that alternative after the excitement of finding stock has passed. Include the total price, any financing requirements and the cost of accessories that would change. Do not treat a more expensive configuration as free simply because it appears sooner.",
        "You can make a small acceptable-options list: the exact phone you want, an alternative you would be equally happy with, and an option you would reject. Only compare delivery and pickup inside the first two groups. This prevents an alert from becoming a purchase decision made under pressure. ShelfSpring's configuration worksheet helps count the alternatives; it does not know your budget, your carrier eligibility or the choices Apple will offer at checkout."
      ] },
      { title: "Treat pickup as a sequence with a clear departure point", paragraphs: [
        "The useful sequence is discover availability, open the exact configuration, complete Apple's order process, then follow the collection instructions. Apple says to wait for its ready-for-pickup notification before going to the store. A tracker alert sits at the beginning of that sequence. It cannot stand in for Apple's notification, and it does not reserve a device while you decide how to travel.",
        "When an order is ready, read the store address and any collection window in that order. Similar city names or multiple branches in one shopping area are easy to confuse. Plan the journey from where you will actually be at that time, rather than your home by default. If another person might collect it, check the eligibility and instructions Apple gives for that particular order before relying on that arrangement."
      ] },
      { title: "Keep an existing delivery order until you understand the replacement", paragraphs: [
        "Finding stock elsewhere does not automatically make an existing order redundant. Check the current status and any cancellation options in Apple's order details. Some orders can be changed or cancelled at some stages; that does not mean every order can be cancelled at any moment. Avoid assuming that a refund, financing reversal or release of funds will happen instantly enough to fund another checkout.",
        "A sensible comparison includes the risk of ending up with two orders or none. Before making a change, identify which order you intend to keep and what confirmation you need before abandoning the other. ShelfSpring cannot cancel an Apple order or check its payment status. Use the retailer's account and support channels for those actions. The planning tool below offers a next step, not an instruction to place or cancel a purchase."
      ] },
      { title: "Give travel time and receiving arrangements equal weight", paragraphs: [
        "Pickup requires more than a distance on a map. Include the round trip, parking, walking through a shopping center, a possible wait and the time you have available. Delivery requires a workable receiving arrangement and a suitable address. An earlier date is only useful if you can receive or collect the device. A two-hour detour during work can be less convenient than waiting an extra day at home.",
        "Compare the complete effort of each option in the same units. For example, write down total hours committed and money spent, then decide how much an earlier phone is worth to you. The travel calculator in this collection can make that tradeoff explicit. It deliberately asks you for local costs and travel time instead of pretending that straight-line distance is a route estimate or that all stores offer identical access."
      ] },
      { title: "Make a fallback that does not require constant refreshing", paragraphs: [
        "Choose a point at which you will stop hunting and use the best available option. That could be the last day a delivery estimate still fits, or the last collection window before a trip. Without a stopping rule, a search can continue long after it is worth your time. Keep a small, realistic store list and acceptable configuration list so any new signal can be evaluated quickly.",
        "If neither route meets a hard deadline, consider a temporary device or another arrangement before increasing your travel radius. That is a planning decision, not evidence that stock will appear overnight. Pickup availability can change and delivery estimates can change. Recheck the option you are about to act on. After ordering, let Apple's order information guide the next step rather than continuing to treat a public stock table as your order status."
      ] }
    ],
    checklist: ["Write down a deadline and acceptable configurations.", "Compare the current order estimate with a real collection opportunity.", "Check travel and receiving arrangements.", "Wait for Apple's ready notification before departure."],
    faqs: [
      { question: "Is pickup always faster than shipping?", answer: "No. Pickup may be useful when a suitable device can be ordered at a reachable store, but it still requires confirmation and collection. Compare the actual options shown for your purchase, not a general promise about which route wins." },
      { question: "Should I cancel delivery as soon as a tracker shows stock?", answer: "A stock observation is too early to make that decision on its own. Review the replacement order, the original order's status and any cancellation conditions. Decide what you will keep before creating unnecessary overlapping orders." },
      { question: "Does this tool check my Apple order?", answer: "No. Your answers stay in this page's browser state. The tool does not sign in to Apple, fetch a delivery estimate, reserve a phone or change an order. Its result is a planning prompt based on the information you enter." }
    ]
  },
  {
    slug: "how-many-apple-stores-to-track", title: "How many Apple Stores should you track? A practical watch-list budget",
    description: "Calculate store-by-configuration alert rules, compare ShelfSpring plan capacity, and build a watch list you can realistically use when an iPhone becomes available.",
    question: "How many stores should I add to an iPhone stock watch list?",
    answer: "Track stores you could realistically collect from, then multiply that count by the exact configurations you would accept. On ShelfSpring, one store paired with one model, storage and color is one alert rule. More saved choices do not automatically mean more running alerts.",
    tool: "stores",
    sections: [
      { title: "Build a reachable list before counting alert rules", paragraphs: [
        "Start with your normal movements: home, work, school and journeys you already make. A store close to your commute may be easier to use than one that looks closer to home but takes a difficult detour. Write down which branches you could reach on a weekday and which would require a weekend trip. This makes a stock notification a usable opportunity instead of another reminder that a device exists somewhere you cannot go.",
        "Do not choose a large radius simply because the interface allows it. Each additional store adds another place whose address, opening arrangements and travel cost you may need to evaluate. A concise list is easier to maintain when your schedule changes. The right number is personal: two reachable stores can be a better plan than ten distant ones, while a frequent traveler may have several genuinely convenient locations."
      ] },
      { title: "Count exact choices, not product names", paragraphs: [
        "An alert rule is a particular store and a particular configuration. If you want one model in two colors and one capacity at three stores, that is six store-configuration pairs. If you also accept a second capacity in both colors, the same three stores require twelve pairs. The multiplication is simple, but it is easy to underestimate when a selection interface displays stores and product choices in separate steps.",
        "Only multiply colors by capacities when every combination is acceptable. You might accept the smaller capacity in either color but the larger capacity in only one. That is three configurations, not four. Enter the number of exact configurations in this calculator after making that list. It estimates a rectangular watch list in which every selected store gets every selected configuration; your actual account may use a more selective mix."
      ] },
      { title: "Separate saved preferences from active coverage", paragraphs: [
        "A saved preference records what you want. An active alert requires an eligible subscription, a running rule within the plan allowance and a working notification setup. Those are related but different states. ShelfSpring's current plan capacities are supplied to the tool from the same plan definitions used by the application. The numbers are rule allowances, not an unrestricted count of stores or a promise that every saved item is being monitored for alerts.",
        "If your desired list exceeds the allowance, decide which pairs matter most and review their status in your account. Removing a configuration you would never buy may be more useful than increasing a plan. The calculator does not read your account and cannot tell which particular rules are running. After editing a real watch list, use the account's current status as the authority rather than assuming that the arithmetic alone has activated anything."
      ] },
      { title: "Choose breadth deliberately", paragraphs: [
        "There are two different ways to broaden a search. Geographic breadth adds stores for the same phone. Configuration breadth accepts different phones at the same stores. The first may add travel; the second may add compromises in color, storage or price. Decide which kind of flexibility is genuinely cheap for you. If your preferred configuration is essential, spend the available coverage on reachable stores rather than alternatives you will ignore.",
        "If location matters more, keep the store list short and compare acceptable configurations there. Neither strategy guarantees earlier availability. Stock across nearby stores can be correlated, and several configurations may appear in the same update. Counting more pairs does not justify calculating a percentage increase in your chances. ShelfSpring does not have a model that turns watch-list size into a reliable probability of getting a phone."
      ] },
      { title: "Use a two-tier list when your schedule changes", paragraphs: [
        "A useful planning worksheet has everyday stores and occasional-trip stores. Everyday locations are those you could collect from without rearranging the day. Occasional locations need a specific free afternoon, a planned journey or another person's help. Keep those categories in your own notes and review your actual watch list when availability to travel changes. The calculator is a scratchpad, so it will not automatically pause or rearrange account rules.",
        "For example, four stores with two configurations make eight pairs. Adding two weekend-only stores takes that to twelve if both configurations are watched everywhere. You might instead keep eight pairs and make one occasional store a manual check. This is an example of workload budgeting, not a recommendation to miss a particular store or a claim that paid alerts are necessary to browse public availability."
      ] },
      { title: "Audit the list after a purchase or a change of plans", paragraphs: [
        "A watch list should shrink when it stops serving a purpose. After buying a phone, review running alerts and any subscription you no longer need. If you change your preferred capacity, remove old choices deliberately rather than simply appending new ones. If you move or travel, check that your selected stores still match where you can collect. These small updates reduce distracting signals and make remaining alerts easier to act on.",
        "Also check notification permissions on the device you expect to use. A carefully budgeted list is not useful if the device cannot display alerts. Avoid interpreting silence as proof that no stock appeared: the list, plan status, inventory observations and delivery channel each contribute. Use ShelfSpring's current stock pages for browsing and your account for configuration; this public worksheet is here to help you choose the size of the task."
      ] }
    ],
    checklist: ["List reachable stores for your real schedule.", "Count exact acceptable configurations.", "Multiply stores by configurations, or count selected pairs individually.", "Review running rules in your account after making changes."],
    faqs: [
      { question: "Do ten alert rules mean ten stores?", answer: "Only if you track one exact configuration at each store. Five stores with two configurations also use ten rules. Different combinations can consume the same allowance while covering quite different buying preferences." },
      { question: "Does a larger plan make the stock feed faster?", answer: "No. ShelfSpring plans change the number of alert rules available. They use the same shared stock feed. The calculator compares capacity, not a faster collection schedule or a guaranteed notification arrival time." },
      { question: "Will the calculator add stores to my account?", answer: "No. It is a local planning tool with no account changes. Use its total as a guide, then review your selections and running status in the account interface. Reloading this page resets the worksheet." }
    ]
  },
  {
    slug: "iphone-color-or-storage-for-availability", title: "Should you change iPhone color or storage to find pickup stock?",
    description: "Build an acceptable-configuration shortlist before an iPhone restock. Compare color flexibility, minimum storage and alert-rule cost without assuming a variant is easier to buy.",
    question: "Should I compromise on iPhone color or storage to find availability?",
    answer: "Set a minimum storage requirement and a maximum budget first. Then add only colors and capacities you would still choose after the stock alert has passed. More acceptable configurations broaden what you can consider, but do not prove that any one variant will restock sooner.",
    tool: "configuration",
    sections: [
      { title: "Protect the requirements you will live with every day", paragraphs: [
        "A shortage can make the available phone feel like the right phone. Before looking at live stock, write down what the device must do for the next several years. Storage affects the files and applications you can keep locally. Color affects how you feel about the object you carry. Price affects your budget after the excitement of a successful checkout has faded. None of those requirements disappears because a particular configuration is briefly listed nearby.",
        "Decide which items are requirements and which are preferences. If a capacity is below your realistic needs, leave it off the acceptable list. If a finish is simply a second choice, decide whether you would enjoy it in normal use, including with the case you expect to use. This worksheet is about your preferences, not a ranking of which color is objectively better or which configuration other buyers should choose."
      ] },
      { title: "Use your current storage as evidence, with room for change", paragraphs: [
        "Look at the storage used on your current phone and understand what occupies it. Large video files, offline media and applications have different patterns from documents you mainly keep elsewhere. A new device can change those habits, so a snapshot of current usage is a starting point rather than a precise forecast. Include any planned travel, creative work or offline use that could make a smaller capacity inconvenient.",
        "Do not assume that a cloud service makes local capacity irrelevant, or that more capacity is automatically worth its price. Consider your existing services, connectivity and willingness to manage files. ShelfSpring does not inspect your device or recommend a specific number of gigabytes. The useful output is a minimum you are comfortable with and a set of capacities you can afford, both decided before a stock notification puts you under time pressure."
      ] },
      { title: "Make an explicit shortlist instead of saying anything is fine", paragraphs: [
        "Write each acceptable model, capacity and color as a separate line. If two colors are acceptable at two capacities and all four combinations fit, you have four configurations. If one larger-capacity color is over budget or unappealing, remove that line. The configuration counter assumes a full grid; if your list has exceptions, use the exact total in the store watch-list calculator instead of relying on a simple colors-times-capacities estimate.",
        "Keep the shortlist small enough to recognize immediately when an alert arrives. You should not have to research a model difference or debate a large price increase in the checkout flow. A useful test is whether you would keep the alternative if your first choice became available the next morning. If the answer is definitely no, adding it may create more frustration than flexibility. Your list should reduce decisions, not merely increase notifications."
      ] },
      { title: "Understand what broader coverage does and does not buy", paragraphs: [
        "Accepting more configurations means more listings could satisfy your requirements. It does not mean each extra configuration is an independent chance with the same probability of appearing. Variants can arrive together, disappear together or have different supply and demand. A count of four acceptable choices cannot be converted into four times the likelihood of success. Historical observations describe what was seen, not the next allocation Apple will make.",
        "This is why the worksheet counts choices and alert pairs rather than producing a success score. It also avoids declaring that an unpopular color or expensive storage tier is always easier to find. If you consult stock history, keep the model, market and observation window consistent. A pattern from another country or a different phone does not establish the current availability of your preferred configuration at a reachable store."
      ] },
      { title: "Price the compromise before activating it", paragraphs: [
        "For each alternative, note its additional purchase cost and whether it changes any financing, carrier or trade-in arrangement you planned to use. A more expensive phone that saves a long trip might still fit your budget; a minor cosmetic compromise might be preferable to paying for unused capacity. Those are personal tradeoffs. Use current checkout information for price and eligibility rather than treating an old stock entry as a quotation.",
        "You can set a simple ceiling: the most extra money you are willing to spend to get an acceptable phone sooner. Keep that separate from the cost of travel and any alert service. Seeing all three avoids treating a seemingly small upgrade as the whole cost of the decision. The worksheet does not calculate financing payments or evaluate credit. It only helps you organize the configurations you have already decided are acceptable."
      ] },
      { title: "Carry the shortlist through to the final order", paragraphs: [
        "An alert is a prompt to verify the exact item. At checkout, confirm the model, storage, finish and store address again. Similar product names and adjacent capacity options make it possible to select something different while moving quickly. If an acceptable alternative disappears, return to the shortlist rather than widening it impulsively. A failed attempt does not change the amount of storage you need or the budget you set.",
        "After completing a purchase, review remaining alerts so rejected or obsolete options do not continue to distract you. If you decide to keep looking, update the shortlist deliberately and recalculate its store coverage. This approach works whether you use alerts or browse manually: decide preferences when you have time, then use a stock observation to check an already acceptable option. It makes the buying decision calmer without pretending to control future supply."
      ] }
    ],
    checklist: ["Set minimum storage and maximum purchase cost.", "List colors you would happily keep.", "Remove unacceptable combinations from the grid.", "Check the exact configuration again at checkout."],
    faqs: [
      { question: "Is a higher-storage iPhone always easier to find?", answer: "No. Supply and demand differ by model, store and time. A price or capacity difference alone does not establish availability. Choose storage you can justify for your use, then check current listings and relevant observations." },
      { question: "Can I count colors across different iPhone models?", answer: "Only if those models are truly acceptable to you, and you count their exact configurations separately. The simple grid assumes one model. Use the combined number of acceptable configurations in the store calculator when comparing several models." },
      { question: "Does this worksheet select stock filters for me?", answer: "No. It counts a hypothetical shortlist in your browser. It does not select a real color, inspect inventory or save an alert. Use the resulting list to make deliberate selections on the stock and account pages." }
    ]
  },
  {
    slug: "how-far-to-travel-for-iphone-pickup", title: "How far is worth traveling for an iPhone pickup?",
    description: "Estimate round-trip pickup cost and time with your own inputs. Compare a distant Apple Store with waiting for a closer option, without confusing a stock listing with a reservation.",
    question: "Is a distant Apple Store pickup worth the trip?",
    answer: "Compare the complete round-trip cost and time with the value of receiving the phone earlier. Set your travel limit before watching distant stores, and only depart after Apple's ready-for-pickup notification. Distance on a stock map is not a travel-time estimate or a stock reservation.",
    tool: "travel",
    sections: [
      { title: "Count the whole journey, including the return", paragraphs: [
        "A store fifty miles away can mean a hundred-mile outing before any detour. Count the return journey, parking, tolls, access to the shopping center and time inside it. If you are already passing nearby, use the additional distance and time caused by the pickup rather than charging the entire planned trip to the phone. Be consistent: the comparison should reflect what changes because you choose that store.",
        "The calculator asks for a round-trip distance and your estimated cost per mile. That rate can be fuel alone or a broader vehicle cost, but you should know which you are using. Parking and tolls are separate fixed expenses. For public transport, walking or a ride service, you may prefer to enter zero distance cost and put the actual fare in the fixed-cost field. The result is arithmetic on your inputs, not a route quotation."
      ] },
      { title: "Give your time a visible place in the decision", paragraphs: [
        "Time does not need a monetary value to matter. A trip might take the only free evening you have, require someone to cover childcare or make a workday difficult. Enter total travel and collection minutes, then consider what you would give up. The optional value-per-hour input lets you express that tradeoff as a personal planning figure. It is not a wage calculation, an expense claim or a financial recommendation.",
        "Keep cash expense and time value separate when reading the result. Only the former represents money you expect to pay for the journey. The combined figure is a way to compare alternatives, not an amount a retailer will charge. If assigning a dollar value feels artificial, leave it at zero and use the displayed time alongside the cash estimate. A decision can be sensible without reducing every inconvenience to money."
      ] },
      { title: "Set a travel limit before an alert arrives", paragraphs: [
        "Decide the longest trip you would make for the exact phone you want and whether that limit changes by day. A weekday lunch break, a Saturday morning and a trip you already planned create different practical boundaries. Keep stores outside those boundaries off the urgent list unless you have a real collection plan. This makes a notification easier to evaluate and reduces the temptation to chase a listing across an unrealistic distance.",
        "A limit can be expressed in time rather than miles. Congestion, transit schedules, bridges and shopping-center access can make equal distances very different journeys. ShelfSpring's stock map helps locate stores, but straight-line proximity cannot account for those conditions. Use a route service and the store's current information when making an actual trip. Recheck those details at the time you intend to leave, especially if the journey crosses a time zone."
      ] },
      { title: "Never use a public stock listing as your departure signal", paragraphs: [
        "A listing is evidence of availability at an observation time. It does not allocate a phone to you for the duration of a drive. Apple instructs customers to wait for a ready-for-pickup notification before going to the store. Plan the route while deciding whether a store is practical, then use the confirmed order and its collection instructions to decide when to depart. This distinction matters more as the journey gets longer.",
        "Read the exact store address on the order, not just the city name in a search result. Check any selected pickup window and the documents or identification Apple asks you to bring. If something about the order is unclear, resolve it through Apple's order information or support before committing to a costly trip. ShelfSpring cannot extend a collection window, hold inventory during travel or verify that a particular person may collect your order."
      ] },
      { title: "Compare the trip with waiting in a fair way", paragraphs: [
        "Waiting has a cost too, but that cost depends on your situation. If your existing phone works, waiting may mainly mean inconvenience or impatience. If it is broken, a temporary replacement, repair or another practical arrangement may have a price. Compare those concrete alternatives with the complete pickup trip rather than assuming that earlier is always better or that a distant store is your only chance.",
        "For example, a hypothetical eighty-mile round trip at fifty cents per mile plus ten dollars in parking costs fifty dollars in cash. If it also takes three hours, the time commitment deserves its own consideration. These are illustrative inputs, not local rates or a recommended reimbursement amount. Enter your own numbers in the worksheet. A closer opportunity might appear later, but its timing is unknown and should not be presented as a guaranteed saving."
      ] },
      { title: "Use the estimate to simplify your store shortlist", paragraphs: [
        "After comparing a few stores, group them into easy trips, possible trips and trips you would decline. You do not need to keep recalculating every notification if the practical limits are already clear. A store can move between groups when you are traveling for another reason or have more free time. Review the list when your circumstances change rather than treating a radius chosen once as a permanent buying plan.",
        "Combine this worksheet with the store-count planner if you use alerts. Tracking distant stores consumes attention and potentially rule capacity even when you would never collect from them. A focused list can make the service more useful without requiring a bigger plan. Once you have an order you intend to keep, stop optimizing the map and follow the collection instructions. The purpose of planning is to finish the purchase with a journey you can comfortably make."
      ] }
    ],
    checklist: ["Use round-trip or incremental journey inputs consistently.", "Include parking, tolls or fares and total time.", "Set a maximum practical journey before tracking distant stores.", "Confirm the order is ready before leaving."],
    faqs: [
      { question: "Does the calculator know traffic or store opening hours?", answer: "No. It uses only the numbers you enter and does not request your location. Check a route service and current store or order information for an actual journey. The displayed time is your estimate, not a live prediction." },
      { question: "Can I use it for public transport?", answer: "Yes. Set distance cost to zero and put the return fare and other cash expenses in fixed costs. Enter the complete journey and collection time. The worksheet will keep cash expense separate from your optional value of time." },
      { question: "Does a pickup listing guarantee stock until I arrive?", answer: "No. A public listing does not reserve a phone. Complete the retailer's order process and follow the ready-for-pickup notification and collection instructions before making the trip." }
    ]
  }
];
