import React, { useState, useEffect, useCallback } from "react";

/* ================================================================== */
/*  DATA                                                               */
/* ================================================================== */

const MAX_HOPE = 8;
const STORE_KEY = "fotf:v2";

const BY_PLAYERS = {
  1: { events: 5, hand: 4 },
  2: { events: 6, hand: 4 },
  3: { events: 6, hand: 3 },
  4: { events: 7, hand: 2 },
  5: { events: 9, hand: 2 },
};

const DIFFICULTIES = [
  { id: "introductory", name: "Introductory", sd: 4, obj: 4 },
  { id: "standard", name: "Standard", sd: 5, obj: 4 },
  { id: "heroic", name: "Heroic", sd: 5, obj: 5 },
  { id: "epic", name: "Epic", sd: 6, obj: 5 },
  { id: "legendary", name: "Legendary", sd: 6, obj: 6 },
];

const ARMIES = [
  { name: "Dwarven", swatch: "#9AA3AF", total: 3, spots: [["Ered Luin", 1], ["Erebor", 1], ["Iron Hills", 1]] },
  { name: "Elven", swatch: "#4FBF8B", total: 4, spots: [["Grey Havens", 1], ["Rivendell", 1], ["Lórien", 1], ["Woodland Realm", 1]] },
  { name: "Rohirrim", swatch: "#C08552", total: 3, spots: [["Helm's Deep", 1], ["Edoras", 1], ["Eastemnet", 1]] },
  { name: "Gondor", swatch: "#4C9BE8", total: 5, spots: [["Minas Tirith", 2], ["Dol Amroth", 2], ["Pelargir", 1]] },
];

const SHADOW_SPOTS = [
  ["Dunland", 1], ["Isengard", 1], ["Moria", 2], ["Dol Guldur", 1], ["Rhûn", 3],
  ["Minas Morgul", 2], ["Barad-dûr", 2], ["Núrn", 3], ["Umbar", 1], ["Near Harad", 2],
];

const NAZGUL_SPOTS = [["Eriador", 2], ["Rhudaur", 1], ["Misty Mountains", 1], ["Gondor", 1], ["Mordor", 4]];

const CHARACTER_STARTS = [
  ["Aragorn", "Weather Hills"], ["Arwen", "Rivendell"], ["Boromir", "Minas Tirith"],
  ["Éomer", "Eastemnet"], ["Éowyn", "Edoras"], ["Faramir", "Minas Tirith"],
  ["Frodo & Sam", "The Shire"], ["Galadriel", "Lórien"], ["Gandalf", "Tharbad"],
  ["Gimli", "Erebor"], ["Gollum", "Moria"], ["Legolas", "Woodland Realm"],
  ["Merry & Pippin", "The Shire"],
];

const SUGGESTED_HANDS = [
  "Frodo & Sam, Legolas", "Merry & Pippin, Éowyn", "Arwen, Aragorn",
  "Gandalf, Boromir", "Gimli, Éomer",
];

const SCENARIOS = {
  four: [
    ["Your First Game", "Attain the Blessing of the Elves · “Saruman, Your Staff Is Broken” · Challenge Sauron · Destroy the One Ring"],
    ["Keep the Darkness at Bay", "Confront the Balrog · Oathbreakers Fulfill Their Duty · Subdue Umbar · Destroy the One Ring"],
  ],
  five: [
    ["Riders of Rohan", "Ride with the Éored · Free Theoden's Mind · Deal with Freca's Heirs · Shieldmaiden No Longer · Destroy the One Ring"],
    ["Fate of the Elves", "“That Makes Six!” · Arwen Unfurls the Banner · Lay Bare the Pits · Bring Light to Mirkwood · Destroy the One Ring"],
    ["Sons of the Steward", "Boromir Reclaims His Honor · Secure the Crossing of the Anduin · Unseat Denethor · Infiltrate Minas Morgul · Destroy the One Ring"],
  ],
  six: [
    ["No Hero Too Small", "Avenge Balin! · Lift Shadow from Dwarven Lands · Rangers Secure Eriador · Hobbits Pledge Their Loyalty · Shelob's Lair · Destroy the One Ring"],
  ],
};

const ACTIONS = [
  {
    id: "travel", name: "Travel", cost: "+ symbols", tint: "stealth",
    summary: "Move one connected location along a path.",
    lines: [
      "Friendly troops and characters in your location may come along. Ask before moving someone else's character.",
      "Special paths charge the symbols printed on them, always paid by the character doing the Travel.",
      "Battle lines work both ways for characters — the arrows only govern shadow troops.",
      "Friendly troops never move on their own.",
      "Frodo travelling, or being brought along, costs an extra 1 Stealth or a search roll in the destination — again paid by whoever is doing the Travel, and on top of any special-path cost.",
    ],
  },
  {
    id: "fellowship", name: "Fellowship", cost: "—", tint: "friend",
    summary: "Trade a card matching your region with another character in your location.",
    lines: [
      "Both players must agree. Give or take one card, and it must match the region you are standing in.",
      "If the receiver goes over 7 cards they immediately discard or play an event.",
      "This is how Frodo collects the Resistance he needs for Mount Doom.",
      "Not available in solo games.",
    ],
  },
  {
    id: "prepare", name: "Prepare", cost: "1 region card", tint: "hope",
    summary: "At a haven, turn a region card into a matching symbol token.",
    lines: [
      "Take a token showing the same symbol as the card you discarded.",
      "Blocked if the supply is out of that token.",
      "Tokens cannot be passed to another player with Fellowship.",
      "Solo only: you must also be standing in that card's region.",
    ],
  },
  {
    id: "muster", name: "Muster", cost: "1 Friendship", tint: "friend",
    summary: "Add 1 troop matching the colour of your location.",
    lines: [
      "Only at Dwarven, Elven, Rohirrim or Gondor locations — never white or red ones.",
      "The troop matches your location's army and goes there.",
      "Blocked if that army's supply is empty.",
    ],
  },
  {
    id: "attack", name: "Attack", cost: "—", tint: "peril",
    summary: "Fight shadow troops standing in your location.",
    lines: [
      "Needs both friendly and shadow troops where your character stands.",
      "Shift the Eye of Sauron to that region first — attacking pulls his gaze off Frodo.",
      "Then roll up to 1 die per friendly troop present. Minimum 1, maximum 3, your choice.",
      "Rolling fewer dice limits your own losses.",
    ],
  },
  {
    id: "capture", name: "Capture", cost: "3 Valor", tint: "valor",
    summary: "Take a shadow stronghold and turn it into a haven.",
    lines: [
      "Needs your character plus at least 1 friendly troop there, and zero shadow troops.",
      "A printed stronghold gets a haven token. A fallen haven gets its stronghold token removed.",
      "Shift the Eye to that region and gain 2 hope.",
      "Capturing Moria, Isengard, Dol Guldur or Umbar shuts off troop spawns there for good.",
    ],
  },
  {
    id: "ring", name: "Destroy the One Ring", cost: "5 Resistance", tint: "hope",
    summary: "Frodo's action at Mount Doom, once every other objective is done.",
    lines: [
      "Roll a final search: 1 die per Nazgûl and shadow troop present, plus 1 for every hope missing from the track. Maximum 7.",
      "Come through with at least 1 hope left and the Free Peoples win.",
    ],
  },
];

const SEARCH_FACES = [
  { name: "Slip By", effect: "Nothing happens.", tone: "good" },
  { name: "Weary", effect: "Lose 1 hope.", tone: "bad" },
  { name: "Exposed", effect: "Lose 1 hope. Ignored while Frodo is in a haven.", tone: "bad" },
  { name: "Recall", effect: "If Nazgûl are present, send 1 back to Mordor. No effect if Frodo is already in Mordor.", tone: "good" },
];

const BATTLE_FACES = [
  { name: "Rout", effect: "Remove 1 shadow troop.", tone: "good" },
  { name: "Exchange", effect: "Remove 1 shadow troop and 1 friendly troop.", tone: "mixed" },
  { name: "Overrun", effect: "Remove 1 friendly troop. Ignored in a haven.", tone: "bad" },
  { name: "Nazgûl!", effect: "If Nazgûl are in the region, remove 2 friendly troops. Otherwise nothing.", tone: "bad" },
];

const SKIES_DARKEN = [
  ["The Shadow Grows", "Move the threat rate marker up 1."],
  ["I See You", "Eye already in Frodo's region? Lose 2 hope. Otherwise move the Eye there."],
  ["Under Cover of Darkness", "Add 3 shadow troops to the location pictured. Lose 1 hope per troop the supply cannot cover. Roll a battle if friendly troops are there."],
  ["The Danger Intensifies", "Shuffle the shadow discard pile and set it facedown on top of the shadow deck."],
];

const SPECIAL_ORDERS = [
  ["Shift the Eye to Frodo's region", "If the Eye is already there, roll a search instead."],
  ["Move 2 Nazgûl closer to Frodo", "Take the 2 nearest Nazgûl not already in his region and move each 1 region closer, one at a time."],
  ["Deploy 3 Nazgûl from Mordor to the Eye", "One at a time into the Eye's region. If Mordor runs dry, pull from the region with the most Nazgûl, ignoring the Eye's region. If the Eye is in Mordor, instead recall 3 Nazgûl to Mordor from the largest group outside it."],
];

const RULES = [
  { c: "Cards", t: "Hand limit is 7", k: "hand discard limit", d: "Over 7 player cards, discard or play events until you are back to 7. Resolve any Skies Darken cards you drew first. Only player cards count — tokens are free." },
  { c: "Cards", t: "Your two characters share everything", k: "tokens hand", d: "One hand and one token pool between them. Gain a card with one character, spend it with the other." },
  { c: "Cards", t: "A card's region does not limit spending", k: "symbols spend region", d: "Spend a card's symbol anywhere on the map. The printed region only matters for Fellowship, for solo Prepare, and for some character abilities." },
  { c: "Cards", t: "Hands stay faceup", k: "open information", d: "Everyone can see everyone's player cards at all times." },
  { c: "Cards", t: "What you may look through", k: "deck discard inspect", d: "Both discard piles are open any time. You may not look through the shadow draw pile, except the card on top." },
  { c: "Cards", t: "Running out of player cards", k: "deck empty hope", d: "Lose 1 hope for each card you cannot draw." },
  { c: "Battle", t: "The Eye moves only when players attack or capture", k: "sauron eye", d: "It does not shift when a shadow card or Skies Darken card triggers a battle, or when an ability removes shadow troops." },
  { c: "Battle", t: "Attack minimums", k: "dice roll", d: "You cannot attack a location with no shadow troops, and once you attack you must roll at least 1 battle die." },
  { c: "Battle", t: "Choosing which friendly troops die", k: "losses armies", d: "When several armies share a location, the current player picks which troops are removed." },
  { c: "Battle", t: "Not enough troops to remove", k: "excess", d: "Remove what is there and ignore the rest." },
  { c: "Battle", t: "Valor during a battle", k: "shadow troops spend", d: "After the dice are rolled, characters present may each spend Valor to remove 1 shadow troop per symbol." },
  { c: "Battle", t: "No stacking limit on shadow troops", k: "pile", d: "Unlike other Pandemic System games, a location can hold any number of them." },
  { c: "Search", t: "Rerolls can chain", k: "resistance fate dice", d: "Spend 1 Resistance to reroll a die, then spend more to reroll again. Any character present may chip in." },
  { c: "Search", t: "Frodo puts on the Ring", k: "ring eye hope", d: "Lose 1 hope, shift the Eye to his region, then roll a search that ignores shadow troops in his location. Nazgûl still count." },
  { c: "Hope", t: "A haven can fall at any moment", k: "stronghold lose", d: "Whenever shadow troops sit in a haven with no friendly troops — after a battle, an action, or any other effect — lose 3 hope and cover it with a shadow stronghold token." },
  { c: "Hope", t: "Running out of shadow troops", k: "supply empty", d: "Lose 1 hope for each troop you cannot place." },
  { c: "Hope", t: "Captured strongholds stop spawning", k: "moria isengard dol guldur umbar", d: "Once Moria, Isengard, Dol Guldur or Umbar is yours, ignore any shadow card that would add a troop there." },
  { c: "Timing", t: "When you may play events", k: "abilities interrupt", d: "Any player, any turn — but not mid-search, mid-battle, or while another card or ability is resolving. Between two shadow cards is fine; part-way through one is not." },
  { c: "Timing", t: "Shadow and Skies Darken cards resolve on draw", k: "immediate", d: "Immediately, as they come off the deck." },
  { c: "Timing", t: "Simultaneous effects", k: "order choose", d: "If two effects would happen at once, the players choose the order." },
  { c: "Timing", t: "Multiple possible outcomes", k: "nazgul choice", d: "When a special order could resolve more than one way, the current player decides." },
  { c: "Timing", t: "Destroy the One Ring goes last", k: "objectives win", d: "Every other objective must be completed and turned facedown before Frodo may attempt it." },
  { c: "Solo", t: "Solo Prepare is stricter", k: "region haven", d: "You must be at a haven and standing in the card's own region." },
  { c: "Solo", t: "No Fellowship in solo", k: "trade", d: "All five characters already share one hand, so there is nothing to trade." },
  { c: "Solo", t: "Frodo never gets a four-action turn", k: "token bonus", d: "The solo token never lands on Frodo & Sam. They get 1 bonus action each turn instead — travel other characters with them to move them along." },
  { c: "Cards", t: "Frodo & Sam are one character", k: "merry pippin pair", d: "So are Merry & Pippin. Any rule naming one of them includes the companion." },
  { c: "Timing", t: "The two special shadow cards", k: "drums war wheels saruman", d: "Drums of War and The Wheels of Saruman replace the normal Advance or Reinforce. Just follow the card." },
  { c: "Cards", t: "Playing an event costs no action", k: "events free discard turn", d: "Any player may play one on anybody's turn without spending an action. Whoever plays it decides how it is used, then discards it." },
  { c: "Timing", t: "Down to one character", k: "missing four actions", d: "If you are somehow left with a single character, take all 4 actions with them." },
  { c: "Battle", t: "Both sides can survive a battle", k: "remain leftover troops", d: "A location can still hold friendly troops and shadow troops once the roll is resolved. Nobody has to be wiped out." },
  { c: "Battle", t: "Where battle lines run", k: "advance arrows haven red", d: "Each starts at a red shadow location, follows one coloured arrow, and ends at a haven. Characters travel them in either direction; the arrows only direct shadow troops." },
  { c: "Solo", t: "Some region cards can never be Prepared", k: "haven region", d: "Solo Prepare needs a haven inside the card's own region, and not every region has one." },
];

const CATEGORIES = ["All", "Cards", "Battle", "Search", "Hope", "Timing", "Solo"];

const SYMBOLS = [
  ["Friendship", "friend", "Spend 1 to Muster a troop."],
  ["Valor", "valor", "Spend 1 in a battle to remove a shadow troop. Spend 3 to Capture a stronghold."],
  ["Stealth", "stealth", "Spend 1 to travel with Frodo without rolling a search."],
  ["Resistance", "hope", "Spend 1 to reroll a search or battle die. Spend 5 to destroy the Ring."],
];

const HOPE_LOSS = [
  ["Weary on a search die", "1 each"],
  ["Exposed on a search die, outside a haven", "1 each"],
  ["Skies Darken card while the Eye is in Frodo's region", "2"],
  ["Shadow troops take a haven", "3"],
  ["A shadow troop you cannot place", "1 each"],
  ["A player card you cannot draw", "1 each"],
  ["Frodo puts on the Ring", "1"],
];

const HOPE_GAIN = [["Capture a shadow stronghold", "2"], ["Objectives and character abilities", "varies"]];

/* ================================================================== */
/*  STYLE                                                              */
/* ================================================================== */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');

.ff{
  --bg:#0B0E14; --surf:#141926; --surf2:#1E2534; --line:#2C3547;
  --text:#EAEDF2; --dim:#8B96AB;
  --hope:#FFC24B; --peril:#E8523F; --stealth:#4FBF8B; --friend:#B57BE0;
  --valor:#9FB3C8; --link:#5EC8E8;
  background:var(--bg); color:var(--text); min-height:100vh;
  font-family:'Instrument Sans',system-ui,sans-serif; font-size:16px; line-height:1.5;
  -webkit-font-smoothing:antialiased; position:relative; overflow-x:hidden;
}
.ff *,.ff *::before,.ff *::after{box-sizing:border-box;}
.ff button{font-family:inherit;}
.ff :focus-visible{outline:2px solid var(--link);outline-offset:2px;border-radius:4px;}

.amb{position:fixed;inset:0 0 auto;height:280px;pointer-events:none;z-index:0;transition:opacity .5s;}
.body{position:relative;z-index:1;max-width:640px;margin:0 auto;padding:0 16px 108px;}

/* ---- status bar ---- */
.status{position:sticky;top:0;z-index:20;margin:0 -16px;padding:0 16px;
  background:rgba(11,14,20,.95);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);}
.statusbtn{display:flex;align-items:center;gap:0;width:100%;background:none;border:none;
  padding:10px 0;cursor:pointer;color:inherit;text-align:left;}
.rdg{flex:1;display:flex;flex-direction:column;gap:1px;}
.rdgk{font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--dim);}
.rdgv{font-family:'IBM Plex Mono',monospace;font-size:19px;font-weight:600;line-height:1.1;}
.rdgv.hope{color:var(--hope);} .rdgv.low{color:var(--peril);}
.rdgv.pend{color:var(--peril);}
.caret{color:var(--dim);font-size:12px;padding-left:6px;transition:transform .25s;}
.caret.up{transform:rotate(180deg);}

.sheet{overflow:hidden;transition:max-height .3s ease;}
.sheetin{padding:4px 0 18px;border-top:1px solid var(--line);}
.ladder{display:flex;align-items:flex-end;gap:4px;height:76px;margin:14px 0 8px;}
.rung{flex:1;border-radius:4px 4px 2px 2px;border:1px solid var(--line);background:var(--surf);
  cursor:pointer;padding:0;position:relative;transition:background .2s,box-shadow .2s;}
.rung.on{background:rgba(255,194,75,.28);border-color:rgba(255,194,75,.55);}
.rung.cur{background:var(--hope);border-color:var(--hope);box-shadow:0 0 16px rgba(255,194,75,.45);}
.rung.zero{border-color:rgba(232,82,63,.6);}
.rung.zero.cur{background:var(--peril);box-shadow:0 0 16px rgba(232,82,63,.5);}
.rungn{position:absolute;bottom:-17px;left:0;right:0;text-align:center;
  font-family:'IBM Plex Mono',monospace;font-size:9.5px;color:var(--dim);}
.ends{display:flex;justify-content:space-between;margin-top:20px;
  font-family:'IBM Plex Mono',monospace;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;}
.ends .a{color:var(--peril);} .ends .b{color:var(--hope);}

.ctrl{display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:13px 0;border-top:1px solid var(--line);}
.ctrll{font-size:15px;} .ctrll small{display:block;color:var(--dim);font-size:12.5px;}
.pad{display:flex;align-items:center;gap:8px;}
.pb{width:42px;height:42px;border-radius:10px;border:1px solid var(--line);background:var(--surf2);
  color:var(--text);font-size:20px;line-height:1;cursor:pointer;font-family:'IBM Plex Mono',monospace;}
.pb:active{background:var(--line);}
.pv{font-family:'IBM Plex Mono',monospace;font-size:20px;font-weight:600;min-width:34px;text-align:center;}

/* ---- generic ---- */
.h{font-family:'Fraunces',Georgia,serif;font-weight:700;font-size:23px;letter-spacing:-.01em;
  margin:26px 0 4px;}
.h:first-child{margin-top:22px;}
.sub{color:var(--dim);font-size:14.5px;margin:0 0 16px;}
.lab{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--dim);margin:24px 0 9px;}

.card{background:var(--surf);border:1px solid var(--line);border-radius:12px;padding:15px;margin-bottom:11px;}
.card.lift{border-left:3px solid var(--hope);}
.card.hot{border-left:3px solid var(--peril);}
.ct{font-weight:600;font-size:16px;margin:0 0 5px;}
.cd{margin:0;font-size:14.5px;color:var(--text);opacity:.88;}
.cd + .cd{margin-top:8px;}
.muted{color:var(--dim);font-size:13.5px;margin:9px 0 0;}

.chips{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;margin:0 -16px 14px;padding:0 16px 2px;}
.chips::-webkit-scrollbar{display:none;}
.chp{font-size:14px;padding:9px 14px;border-radius:999px;border:1px solid var(--line);
  background:var(--surf);color:var(--dim);cursor:pointer;white-space:nowrap;}
.chp.on{background:var(--text);border-color:var(--text);color:var(--bg);font-weight:600;}

.seg{display:flex;background:var(--surf);border:1px solid var(--line);border-radius:11px;
  padding:4px;gap:4px;margin-bottom:18px;}
.sgb{flex:1;padding:11px 4px;border:none;border-radius:8px;background:none;color:var(--dim);
  font-size:14px;cursor:pointer;line-height:1.2;}
.sgb.on{background:var(--surf2);color:var(--text);font-weight:600;
  box-shadow:0 1px 0 rgba(255,255,255,.05) inset;}
.sgb small{display:block;font-family:'IBM Plex Mono',monospace;font-size:9.5px;
  letter-spacing:.1em;color:var(--dim);margin-bottom:2px;}

.acc{border:1px solid var(--line);border-radius:12px;background:var(--surf);margin-bottom:9px;overflow:hidden;}
.acc>summary{cursor:pointer;padding:15px;list-style:none;display:flex;align-items:center;gap:11px;}
.acc>summary::-webkit-details-marker{display:none;}
.accn{font-weight:600;font-size:16px;flex:1;}
.accc{font-family:'IBM Plex Mono',monospace;font-size:10.5px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--dim);}
.bar{width:3px;align-self:stretch;border-radius:2px;flex:none;min-height:20px;}
.accb{padding:0 15px 16px 29px;}
.accb p{margin:0 0 10px;font-size:14.5px;opacity:.88;}
.accb ul{margin:0;padding-left:18px;} .accb li{margin-bottom:8px;font-size:14.5px;opacity:.88;}

.tbl{width:100%;border-collapse:collapse;font-size:14.5px;}
.tbl td{padding:9px 0;border-bottom:1px solid var(--line);vertical-align:top;}
.tbl tr:last-child td{border-bottom:none;}
.tbl td.n{font-family:'IBM Plex Mono',monospace;color:var(--hope);width:32px;font-size:15px;}
.tbl td.r{text-align:right;color:var(--dim);font-size:13.5px;white-space:nowrap;padding-left:10px;}

.armyh{display:flex;align-items:center;gap:9px;margin:18px 0 2px;font-weight:600;font-size:15px;}
.armyh:first-child{margin-top:4px;}
.sw{width:12px;height:12px;border-radius:3px;flex:none;}
.armyh .t{margin-left:auto;font-family:'IBM Plex Mono',monospace;font-size:11.5px;color:var(--dim);font-weight:400;}

.face{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--line);}
.face:last-child{border-bottom:none;}
.pip{width:10px;height:10px;border-radius:3px;flex:none;margin-top:6px;}
.face b{display:block;font-size:15px;} .face span{font-size:14px;opacity:.85;}

.out{display:flex;align-items:center;gap:14px;background:var(--surf2);border-radius:10px;
  padding:14px;margin-top:12px;}
.outn{font-family:'IBM Plex Mono',monospace;font-size:32px;font-weight:600;color:var(--hope);line-height:1;}
.outl{font-size:13.5px;color:var(--dim);}

.srch{width:100%;background:var(--surf);border:1px solid var(--line);border-radius:11px;
  color:var(--text);padding:14px 15px;font-family:inherit;font-size:16px;margin-bottom:14px;}
.srch:focus{outline:none;border-color:var(--link);}
.srch::placeholder{color:var(--dim);}

.tally{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 6px;}
.tb{width:48px;height:52px;border-radius:10px;border:1px solid var(--line);background:var(--surf2);
  cursor:pointer;font-family:'IBM Plex Mono',monospace;font-size:14px;color:var(--dim);}
.tb.on{background:rgba(232,82,63,.2);border-color:var(--peril);color:var(--text);}

.step{display:flex;gap:13px;padding:14px 0;border-bottom:1px solid var(--line);}
.step:last-of-type{border-bottom:none;}
.chk{width:26px;height:26px;flex:none;border-radius:8px;border:1px solid var(--line);
  background:var(--surf2);cursor:pointer;color:var(--hope);font-size:14px;line-height:1;padding:0;}
.chk.on{background:rgba(255,194,75,.22);border-color:var(--hope);}
.stept{font-weight:600;font-size:16px;margin:0 0 4px;}
.step.done .stept{opacity:.45;text-decoration:line-through;}
.step.done .stepb{opacity:.45;}

.prog{display:flex;gap:4px;margin:16px 0 6px;}
.pseg{flex:1;height:5px;border-radius:3px;background:var(--surf2);border:none;cursor:pointer;padding:0;}
.pseg.done{background:rgba(255,194,75,.45);}
.pseg.cur{background:var(--hope);}
.pcount{font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--dim);
  letter-spacing:.1em;text-transform:uppercase;margin-bottom:14px;}

.btn{width:100%;padding:15px;border-radius:11px;border:1px solid var(--line);
  background:var(--surf2);color:var(--text);font-size:15px;font-weight:600;cursor:pointer;}
.btn.solid{background:var(--hope);border-color:var(--hope);color:#1A1204;}
.btn:disabled{opacity:.35;cursor:default;}
.pair{display:flex;gap:10px;margin-top:18px;}

.warnbox{border:1px solid var(--peril);background:rgba(232,82,63,.12);border-radius:12px;
  padding:15px;margin:18px 0;}
.warnbox b{font-family:'Fraunces',serif;font-size:17px;color:var(--peril);}
.warnbox p{margin:5px 0 0;font-size:14.5px;}

/* ---- bottom nav ---- */
.nav{position:fixed;left:0;right:0;bottom:0;z-index:30;display:flex;
  background:rgba(11,14,20,.97);backdrop-filter:blur(10px);border-top:1px solid var(--line);
  padding-bottom:env(safe-area-inset-bottom);}
.nb{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 0 10px;
  background:none;border:none;color:var(--dim);cursor:pointer;font-size:11px;letter-spacing:.02em;}
.nb.on{color:var(--hope);}
.nb svg{width:23px;height:23px;stroke:currentColor;fill:none;stroke-width:1.6;
  stroke-linecap:round;stroke-linejoin:round;}

@media (prefers-reduced-motion:reduce){.ff *{transition:none!important;}}
`;

const TINT = { hope: "var(--hope)", peril: "var(--peril)", stealth: "var(--stealth)", friend: "var(--friend)", valor: "var(--valor)" };
const TONE = { good: "var(--stealth)", bad: "var(--peril)", mixed: "var(--hope)" };

/* ================================================================== */
/*  PIECES                                                             */
/* ================================================================== */

function Pad({ value, set, min = 0, max = 99, label }) {
  return (
    <div className="pad">
      <button className="pb" onClick={() => set(Math.max(min, value - 1))} aria-label={`Fewer ${label}`}>–</button>
      <span className="pv">{value}</span>
      <button className="pb" onClick={() => set(Math.min(max, value + 1))} aria-label={`More ${label}`}>+</button>
    </div>
  );
}

function Acc({ title, meta, tint, children }) {
  return (
    <details className="acc">
      <summary>
        {tint && <span className="bar" style={{ background: TINT[tint] }} />}
        <span className="accn">{title}</span>
        {meta && <span className="accc">{meta}</span>}
      </summary>
      <div className="accb">{children}</div>
    </details>
  );
}

const ICONS = {
  setup: <svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h9" /><circle cx="18.5" cy="17" r="2.5" /></svg>,
  turn: <svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.4-5.7" /><path d="M20 4v4h-4" /></svg>,
  dice: <svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /></svg>,
  rules: <svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5" /></svg>,
};

/* ================================================================== */
/*  SETUP  (paged wizard)                                              */
/* ================================================================== */

function SetupView({ players, setPlayers, diff, setDiff, checks, toggle, idx, setIdx, listMode, setListMode }) {
  const d = DIFFICULTIES.find((x) => x.id === diff);
  const p = BY_PLAYERS[players];
  const solo = players === 1;

  const steps = [
    { id: "config", t: "Choose the game" },
    { id: "board", t: "Place the board", d: "Center of the table." },
    { id: "markers", t: "Set the two track markers", d: "Hope marker on 6, threat rate marker on 2 — the spaces marked with a dot on each track." },
    { id: "shadowdeck", t: "Build the shadow deck", d: "The two special cards — Sauron and Saruman art — go straight into the shadow discard pile. Shuffle every other shadow card together, both card backs mixed, and stack them facedown." },
    { id: "friendly", t: "Place 15 friendly troops" },
    { id: "shadowtroops", t: "Place 18 shadow troops" },
    { id: "seed", t: "Seed the map with 9 shadow cards", d: "Draw 9 shadow cards one at a time and add 1 shadow troop to the red location shown on each. Ignore everything else printed on them, then discard all 9. That leaves 21 shadow troops in the supply." },
    { id: "nazgul", t: "Place 9 Nazgûl and the Eye" },
    { id: "objectives", t: `Choose ${d.obj} objectives` },
    { id: "chars", t: solo ? "Lay out five characters" : "Deal out characters" },
    { id: "figures", t: "Place the figures" },
    { id: "playercards", t: "Deal player cards" },
    { id: "deck", t: "Build the player deck" },
    { id: "first", t: solo ? "Begin" : "Pick the first player" },
  ];

  const extra = {
    config: (
      <>
        <p className="lab" style={{ marginTop: 4 }}>Players</p>
        <div className="chips">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} className={`chp ${players === n ? "on" : ""}`} onClick={() => setPlayers(n)}>
              {n === 1 ? "Solo" : n}
            </button>
          ))}
        </div>
        <p className="lab">Difficulty</p>
        <div className="chips">
          {DIFFICULTIES.map((x) => (
            <button key={x.id} className={`chp ${diff === x.id ? "on" : ""}`} onClick={() => setDiff(x.id)}>{x.name}</button>
          ))}
        </div>
        <div className="card lift">
          <table className="tbl"><tbody>
            <tr><td>Objective cards</td><td className="r">{d.obj}</td></tr>
            <tr><td>Skies Darken cards</td><td className="r">{d.sd}</td></tr>
            <tr><td>Event cards</td><td className="r">{p.events}</td></tr>
            <tr><td>Starting hand {solo ? "" : "each"}</td><td className="r">{p.hand}</td></tr>
          </tbody></table>
        </div>
      </>
    ),
    friendly: (
      <>
        {ARMIES.map((a) => (
          <div key={a.name}>
            <div className="armyh"><span className="sw" style={{ background: a.swatch }} />{a.name}<span className="t">{a.total}</span></div>
            <table className="tbl"><tbody>
              {a.spots.map(([loc, n]) => <tr key={loc}><td className="n">{n}</td><td>{loc}</td></tr>)}
            </tbody></table>
          </div>
        ))}
        <p className="muted">When you're done, 5 troops of each army should still be in the supply.</p>
      </>
    ),
    shadowtroops: (
      <table className="tbl"><tbody>
        {SHADOW_SPOTS.map(([loc, n]) => <tr key={loc}><td className="n">{n}</td><td>{loc}</td></tr>)}
      </tbody></table>
    ),
    nazgul: (
      <>
        <table className="tbl"><tbody>
          {NAZGUL_SPOTS.map(([r, n]) => <tr key={r}><td className="n">{n}</td><td>{r}</td></tr>)}
        </tbody></table>
        <p className="muted">Then set the Eye of Sauron on Eriador.</p>
      </>
    ),
    objectives: (
      <>
        <p className="cd">Destroy the One Ring — the red star card — plus {d.obj - 1} others drawn at random, all faceup beside the board. Follow any setup instructions on them and set aside the characters they call for. The rest go back in the box.</p>
        <p className="lab">Suggested sets for {d.obj} objectives</p>
        {(d.obj === 4 ? SCENARIOS.four : d.obj === 5 ? SCENARIOS.five : SCENARIOS.six).map(([n, list]) => (
          <div className="card" key={n}>
            <p className="ct">{n}</p>
            <p className="cd">{list}</p>
          </div>
        ))}
        {players <= 2 && (
          <p className="muted">
            {solo ? "Solo allows 5 characters total." : "Two players allow 4 characters total."} If your objectives demand more, shuffle them back and draw again.
          </p>
        )}
      </>
    ),
    chars: solo ? (
      <>
        <p className="cd">Set Frodo &amp; Sam beside the board. Draw 4 other characters at random, lay them face up in a row, and put the solo token on the leftmost.</p>
        <p className="muted">First time out: Merry &amp; Pippin, Éowyn, Legolas, Gandalf.</p>
      </>
    ) : (
      <>
        <p className="cd">Take any characters the objectives set aside, top up with random ones until you have 2 per player, shuffle, and deal 2 each. Two reference cards each as well.</p>
        <table className="tbl"><tbody>
          {SUGGESTED_HANDS.slice(0, players).map((h, i) => (
            <tr key={i}><td className="n">P{i + 1}</td><td>{h}</td></tr>
          ))}
        </tbody></table>
        <p className="muted">Suggested pairings for a first game.</p>
      </>
    ),
    figures: (
      <>
        <table className="tbl"><tbody>
          {CHARACTER_STARTS.map(([c, loc]) => <tr key={c}><td>{c}</td><td className="r">{loc}</td></tr>)}
        </tbody></table>
        <p className="muted">Unused character cards, figures and reference cards go back in the box.</p>
      </>
    ),
    playercards: (
      <p className="cd">
        Set aside all 12 Skies Darken cards. Shuffle the 14 events and pull <b>{p.events}</b> without looking.
        Shuffle those into the 48 region cards, then deal <b>{p.hand}</b> to {solo ? "yourself" : "each player"}. Hands stay faceup.
      </p>
    ),
    deck: (
      <>
        <p className="cd">
          Split the remaining player cards into <b>{d.sd}</b> facedown stacks. Shuffle 1 Skies Darken card into each,
          shuffle each stack again, then pile them up. Oversized stacks go nearest the top.
        </p>
        <p className="muted">Unused event and Skies Darken cards go back in the box unlooked at.</p>
      </>
    ),
    first: solo ? (
      <p className="cd">The character with the solo token takes 4 actions, and Frodo &amp; Sam get 1 bonus action before or after.</p>
    ) : (
      <>
        <p className="cd">Whoever holds the region card with the lowest printed number starts.</p>
        <p className="muted">Or just start with whoever has Frodo.</p>
      </>
    ),
  };

  if (listMode) {
    return (
      <>
        <h1 className="h">Setup</h1>
        <p className="sub">{players === 1 ? "Solo" : `${players} players`} · {d.name}</p>
        {steps.map((s, i) => {
          const done = checks.includes(s.id);
          return (
            <div key={s.id} className={`step ${done ? "done" : ""}`}>
              <button className={`chk ${done ? "on" : ""}`} onClick={() => toggle(s.id)} aria-pressed={done} aria-label={s.t}>{done ? "✓" : ""}</button>
              <div className="stepb">
                <p className="stept">{s.t}</p>
                {s.d && <p className="cd">{s.d}</p>}
                {extra[s.id]}
              </div>
            </div>
          );
        })}
        <button className="btn" style={{ marginTop: 20 }} onClick={() => setListMode(false)}>Back to one step at a time</button>
      </>
    );
  }

  const i = Math.min(idx, steps.length - 1);
  const s = steps[i];
  const done = checks.includes(s.id);

  return (
    <>
      <div className="prog">
        {steps.map((x, n) => (
          <button
            key={x.id}
            className={`pseg ${n === i ? "cur" : checks.includes(x.id) ? "done" : ""}`}
            onClick={() => setIdx(n)}
            aria-label={`Step ${n + 1}: ${x.t}`}
          />
        ))}
      </div>
      <p className="pcount">Step {i + 1} of {steps.length}</p>

      <h1 className="h" style={{ marginTop: 0 }}>{s.t}</h1>
      {s.d && <p className="cd" style={{ marginBottom: 12 }}>{s.d}</p>}
      {extra[s.id]}

      <div className="pair">
        <button className="btn" onClick={() => setIdx(Math.max(0, i - 1))} disabled={i === 0}>Back</button>
        <button
          className="btn solid"
          onClick={() => { if (!done) toggle(s.id); setIdx(Math.min(steps.length - 1, i + 1)); }}
        >
          {i === steps.length - 1 ? "Finish" : "Done · next"}
        </button>
      </div>
      <button className="btn" style={{ marginTop: 10 }} onClick={() => setListMode(true)}>See all steps</button>
    </>
  );
}

/* ================================================================== */
/*  TURN                                                               */
/* ================================================================== */

function TurnView({ players, threat, drawn, setDrawn, active, turn, endTurn, phase, setPhase }) {
  const solo = players === 1;

  return (
    <>
      <h1 className="h">Turn {turn}</h1>
      <p className="sub">{solo ? `Solo token on character ${active}` : `Player ${active}`} · {solo ? "4 actions, plus 1 for Frodo & Sam" : "4 actions with one character, 1 with the other"}</p>

      <div className="seg" role="tablist">
        {[["Actions", 0], ["Cards", 1], ["Shadow", 2]].map(([n, v]) => (
          <button key={v} role="tab" aria-selected={phase === v} className={`sgb ${phase === v ? "on" : ""}`} onClick={() => setPhase(v)}>
            <small>Phase {v + 1}</small>{n}
          </button>
        ))}
      </div>

      {phase === 0 && (
        <>
          {ACTIONS.map((a) => (
            <Acc key={a.id} title={a.name} meta={a.cost} tint={a.tint}>
              <p>{a.summary}</p>
              <ul>{a.lines.map((l, n) => <li key={n}>{l}</li>)}</ul>
            </Acc>
          ))}
          <p className="muted">A dash means the action itself is the whole cost. Finish every action with one character before starting the other. Down to a single character? Take all 4 actions with them. Playing an event never costs an action.</p>
        </>
      )}

      {phase === 1 && (
        <>
          <div className="card lift">
            <p className="ct">Draw 2 player cards</p>
            <p className="cd">Take the top 2 together. If the deck can't cover it, lose 1 hope per missing card.</p>
            <p className="cd">Then trim to 7 cards, discarding or playing events.</p>
          </div>
          <p className="lab">If you drew a Skies Darken card</p>
          {SKIES_DARKEN.map(([t, d], n) => (
            <div className="card" key={t}>
              <p className="ct"><span style={{ fontFamily: "'IBM Plex Mono',monospace", color: "var(--peril)", marginRight: 8 }}>{n + 1}</span>{t}</p>
              <p className="cd">{d}</p>
            </div>
          ))}
          <p className="muted">Two at once? Run all four steps, then run them again. Afterwards remove the card from the game and don't replace the draw.</p>
        </>
      )}

      {phase === 2 && (
        <>
          <div className="card hot">
            <p className="ct">Resolve {threat} shadow {threat === 1 ? "card" : "cards"}</p>
            <p className="cd">
              Flip the top card face up beside the deck, then look at the <b>new</b> top of the deck.
              A red flag means resolve the <b>top</b> half of the flipped card. A black banner means the <b>bottom</b> half.
            </p>
            <div className="tally">
              {Array.from({ length: Math.max(threat, drawn) }, (_, n) => (
                <button key={n} className={`tb ${n < drawn ? "on" : ""}`} onClick={() => setDrawn(n < drawn ? n : n + 1)} aria-label={`Card ${n + 1}`}>
                  {n + 1}
                </button>
              ))}
            </div>
            <p className="muted">{drawn} of {threat} resolved{drawn >= threat ? " — done" : ""}. Stack the cards in the resolve area as you go, then sweep them to the discard area once the turn is over.</p>
          </div>

          <Acc title="Advance" meta="red flag" tint="peril">
            <ul>
              <li>Battle lines start at a red shadow location, follow one coloured arrow, and end at a haven.</li>
              <li>Every shadow troop on the pictured battle line moves 1 space forward. Start with the frontmost group, then the next one back, until each has moved once.</li>
              <li>They advance even into locations holding friendly troops.</li>
              <li>Troops already at the end of the line stay put, but still fight.</li>
              <li>Nothing on that line means nothing happens.</li>
              <li>Then roll a battle in every location holding both kinds of troop, front to back.</li>
            </ul>
          </Acc>
          <Acc title="Reinforce" meta="black banner" tint="peril">
            <ul>
              <li>Add 1 shadow troop to the pictured location. No stacking limit. Lose 1 hope per troop the supply can't cover.</li>
              <li>Skip it if you already captured that location and it's a haven now.</li>
              <li>Roll a battle there if friendly troops are present.</li>
            </ul>
            <p style={{ marginTop: 4 }}>Then the special order on the bottom of the card:</p>
            <ul>{SPECIAL_ORDERS.map(([t, d]) => <li key={t}><b>{t}</b> — {d}</li>)}</ul>
          </Acc>
          <Acc title="Drums of War · Wheels of Saruman" meta="special">
            <p style={{ margin: 0 }}>These ignore Advance and Reinforce entirely. Just do what the card says.</p>
          </Acc>

          <div className="card hot" style={{ marginTop: 14 }}>
            <p className="ct">Keep watching the havens</p>
            <p className="cd">The moment a haven holds shadow troops and no friendly troops — after a battle, an action, or any other effect — it falls. Lose 3 hope and cover it with a shadow stronghold token.</p>
          </div>

          <button className="btn solid" style={{ marginTop: 8 }} onClick={endTurn}>
            End turn · pass {solo ? "the solo token" : "left"}
          </button>
        </>
      )}
    </>
  );
}

/* ================================================================== */
/*  DICE                                                               */
/* ================================================================== */

function DiceView({ hope }) {
  const [sN, setSN] = useState(0), [sT, setST] = useState(0);
  const [bF, setBF] = useState(1), [bS, setBS] = useState(1);
  const [rN, setRN] = useState(0), [rT, setRT] = useState(0);
  const [which, setWhich] = useState(0);

  const search = Math.min(7, sN + sT);
  const ring = Math.min(7, rN + rT + (MAX_HOPE - hope));

  return (
    <>
      <h1 className="h">Dice</h1>
      <p className="sub">Count them, then read the faces.</p>

      <div className="seg" role="tablist">
        {[["Search", 0], ["Battle", 1], ["Mount Doom", 2]].map(([n, v]) => (
          <button key={v} role="tab" aria-selected={which === v} className={`sgb ${which === v ? "on" : ""}`} onClick={() => setWhich(v)}>{n}</button>
        ))}
      </div>

      {which === 0 && (
        <>
          <div className="card">
            <p className="cd">1 die per Nazgûl in Frodo's <b>region</b> and per shadow troop in his <b>location</b> — his destination if he's travelling. Max 7. Nothing present, no roll.</p>
            <div className="ctrl"><span className="ctrll">Nazgûl in his region</span><Pad value={sN} set={setSN} max={9} label="Nazgûl" /></div>
            <div className="ctrl"><span className="ctrll">Shadow troops in his location</span><Pad value={sT} set={setST} max={20} label="troops" /></div>
            <div className="out"><span className="outn">{search}</span><span className="outl">{search === 0 ? "no roll needed" : `search ${search === 1 ? "die" : "dice"}`}</span></div>
          </div>
          {SEARCH_FACES.map((f) => (
            <div className="face" key={f.name}>
              <span className="pip" style={{ background: TONE[f.tone] }} />
              <div><b>{f.name}</b><span>{f.effect}</span></div>
            </div>
          ))}
          <p className="muted">Any character in Frodo's location may spend Resistance to reroll, and keep spending to reroll again.</p>
        </>
      )}

      {which === 1 && (
        <>
          <div className="card">
            <div className="ctrl"><span className="ctrll">Friendly troops<small>you're attacking</small></span><Pad value={bF} set={setBF} max={20} label="friendly" /></div>
            <div className="out"><span className="outn">{bF === 0 ? 0 : Math.min(3, Math.max(1, bF))}</span><span className="outl">dice — up to 1 per friendly troop, min 1, max 3. Fewer dice, fewer losses. Shift the Eye first.</span></div>
          </div>
          <div className="card">
            <div className="ctrl"><span className="ctrll">Shadow troops<small>a card started it</small></span><Pad value={bS} set={setBS} max={20} label="shadow" /></div>
            <div className="out"><span className="outn" style={{ color: "var(--peril)" }}>{Math.min(3, bS)}</span><span className="outl">dice — 1 per shadow troop, max 3. The Eye does not move.</span></div>
          </div>
          {BATTLE_FACES.map((f) => (
            <div className="face" key={f.name}>
              <span className="pip" style={{ background: TONE[f.tone] }} />
              <div><b>{f.name}</b><span>{f.effect}</span></div>
            </div>
          ))}
          <p className="muted">After rolling, characters present may spend Resistance to reroll and Valor to remove 1 shadow troop each. Then check whether a haven fell.</p>
        </>
      )}

      {which === 2 && (
        <div className="card hot">
          <p className="cd">Frodo spends 5 Resistance at Mount Doom, and only once every other objective is finished.</p>
          <div className="ctrl"><span className="ctrll">Nazgûl present</span><Pad value={rN} set={setRN} max={9} label="Nazgûl" /></div>
          <div className="ctrl"><span className="ctrll">Shadow troops present</span><Pad value={rT} set={setRT} max={20} label="troops" /></div>
          <div className="ctrl"><span className="ctrll">Hope missing<small>from the track</small></span><span className="pv">{MAX_HOPE - hope}</span></div>
          <div className="out"><span className="outn">{ring}</span><span className="outl">{ring === 1 ? "die" : "dice"}, capped at 7. Come through with 1 hope left and the Free Peoples win.</span></div>
        </div>
      )}
    </>
  );
}

/* ================================================================== */
/*  RULES                                                              */
/* ================================================================== */

function RulesView() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const n = q.trim().toLowerCase();
  const hits = RULES.filter(
    (r) => (cat === "All" || r.c === cat) && (!n || (r.t + " " + r.k + " " + r.d).toLowerCase().includes(n))
  );

  return (
    <>
      <h1 className="h">Rules</h1>
      <p className="sub">Answers first — no tapping to open.</p>

      <input className="srch" value={q} onChange={(e) => setQ(e.target.value)} placeholder="haven, eye, reroll, hand limit…" aria-label="Search rules" />
      <div className="chips">
        {CATEGORIES.map((c) => (
          <button key={c} className={`chp ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {hits.length === 0 && <div className="card"><p className="cd">Nothing matches. Try a shorter word — haven, eye, reroll, solo.</p></div>}
      {hits.map((r) => (
        <div className="card" key={r.t}>
          <p className="ct">{r.t}</p>
          <p className="cd">{r.d}</p>
        </div>
      ))}

      {!n && cat === "All" && (
        <>
          <p className="lab">Symbols</p>
          {SYMBOLS.map(([name, tint, use]) => (
            <div className="face" key={name}>
              <span className="pip" style={{ background: TINT[tint] }} />
              <div><b>{name}</b><span>{use}</span></div>
            </div>
          ))}
          <p className="muted">Spend a symbol by discarding a card showing it, or returning a matching token to the supply.</p>

          <p className="lab">Hope you lose</p>
          <table className="tbl"><tbody>{HOPE_LOSS.map(([k, v]) => <tr key={k}><td>{k}</td><td className="r">{v}</td></tr>)}</tbody></table>
          <p className="lab">Hope you gain</p>
          <table className="tbl"><tbody>{HOPE_GAIN.map(([k, v]) => <tr key={k}><td>{k}</td><td className="r">{v}</td></tr>)}</tbody></table>
          <p className="muted">Hope tops out at 8. Reach zero and the game is over.</p>
        </>
      )}
    </>
  );
}

/* ================================================================== */
/*  APP                                                                */
/* ================================================================== */

export default function FateOfTheFellowship() {
  const [tab, setTab] = useState("setup");
  const [open, setOpen] = useState(false);
  const [players, setPlayers] = useState(4);
  const [diff, setDiff] = useState("introductory");
  const [hope, setHope] = useState(6);
  const [threat, setThreat] = useState(2);
  const [drawn, setDrawn] = useState(0);
  const [turn, setTurn] = useState(1);
  const [active, setActive] = useState(1);
  const [phase, setPhase] = useState(0);
  const [checks, setChecks] = useState([]);
  const [idx, setIdx] = useState(0);
  const [listMode, setListMode] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await window.storage.get(STORE_KEY);
        if (alive && r && r.value) {
          const s = JSON.parse(r.value);
          if (s.tab) setTab(s.tab);
          if (s.players) setPlayers(s.players);
          if (s.diff) setDiff(s.diff);
          ["hope", "threat", "drawn", "turn", "active", "phase", "idx"].forEach((k) => {
            if (typeof s[k] === "number") {
              ({ hope: setHope, threat: setThreat, drawn: setDrawn, turn: setTurn, active: setActive, phase: setPhase, idx: setIdx })[k](s[k]);
            }
          });
          if (Array.isArray(s.checks)) setChecks(s.checks);
        }
      } catch (e) {
        /* nothing saved yet, or storage unavailable */
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      window.storage.set(STORE_KEY, JSON.stringify({ tab, players, diff, hope, threat, drawn, turn, active, phase, idx, checks })).catch(() => {});
    }, 350);
    return () => clearTimeout(t);
  }, [ready, tab, players, diff, hope, threat, drawn, turn, active, phase, idx, checks]);

  const toggle = useCallback((id) => {
    setChecks((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }, []);

  const endTurn = useCallback(() => {
    setDrawn(0); setPhase(0); setTurn((t) => t + 1);
    setActive((a) => (a % (players === 1 ? 4 : players)) + 1);
    setTab("turn");
  }, [players]);

  const newGame = useCallback(() => {
    setHope(6); setThreat(2); setDrawn(0); setTurn(1); setActive(1);
    setPhase(0); setChecks([]); setIdx(0); setListMode(false); setTab("setup"); setOpen(false);
  }, []);

  const g = hope / MAX_HOPE;
  const amb = {
    background: `radial-gradient(700px 300px at 50% 0%, rgba(255,194,75,${(0.09 * g).toFixed(3)}), rgba(0,0,0,0) 70%),
                 radial-gradient(700px 300px at 50% 0%, rgba(232,82,63,${(0.13 * (1 - g)).toFixed(3)}), rgba(0,0,0,0) 70%)`,
  };

  const NAV = [["setup", "Setup"], ["turn", "Turn"], ["dice", "Dice"], ["rules", "Rules"]];

  return (
    <div className="ff">
      <style>{CSS}</style>
      <div className="amb" style={amb} />

      <div className="body">
        <div className="status">
          <button className="statusbtn" onClick={() => setOpen(!open)} aria-expanded={open}>
            <span className="rdg"><span className="rdgk">Hope</span><span className={`rdgv hope ${hope <= 2 ? "low" : ""}`}>{hope}</span></span>
            <span className="rdg"><span className="rdgk">Threat</span><span className="rdgv">{threat}</span></span>
            <span className="rdg"><span className="rdgk">Shadow cards</span><span className={`rdgv ${drawn < threat ? "pend" : ""}`}>{drawn}/{threat}</span></span>
            <span className="rdg"><span className="rdgk">Turn</span><span className="rdgv">{turn}</span></span>
            <span className={`caret ${open ? "up" : ""}`}>▾</span>
          </button>

          <div className="sheet" style={{ maxHeight: open ? 420 : 0 }}>
            <div className="sheetin">
              <div className="ladder" role="group" aria-label="Hope track">
                {Array.from({ length: MAX_HOPE + 1 }, (_, i) => (
                  <button
                    key={i}
                    className={`rung ${i > 0 && i <= hope ? "on" : ""} ${i === hope ? "cur" : ""} ${i === 0 ? "zero" : ""}`}
                    style={{ height: `${34 + i * 5}%` }}
                    onClick={() => setHope(i)}
                    aria-label={`Set hope to ${i}`}
                    aria-pressed={i === hope}
                  >
                    <span className="rungn">{i}</span>
                  </button>
                ))}
              </div>
              <div className="ends"><span className="a">Despair</span><span className="b">Full hope</span></div>

              <div className="ctrl"><span className="ctrll">Hope<small>tap the ladder, or nudge it</small></span><Pad value={hope} set={setHope} max={MAX_HOPE} label="hope" /></div>
              <div className="ctrl"><span className="ctrll">Threat rate<small>shadow cards per turn</small></span><Pad value={threat} set={setThreat} min={1} max={7} label="threat" /></div>
              <div className="ctrl"><span className="ctrll">Turn<small>{players === 1 ? `solo token on character ${active}` : `player ${active}`}</small></span><Pad value={turn} set={setTurn} min={1} max={99} label="turn" /></div>
              <button className="btn" style={{ marginTop: 14 }} onClick={newGame}>Start a new game</button>
            </div>
          </div>
        </div>

        {hope === 0 && (
          <div className="warnbox">
            <b>Despair</b>
            <p>The marker has reached the bottom of the track. Frodo has nothing left, and the game is lost. Set it up again — the Shadow has been beaten before.</p>
          </div>
        )}

        {tab === "setup" && (
          <SetupView
            players={players} setPlayers={setPlayers} diff={diff} setDiff={setDiff}
            checks={checks} toggle={toggle} idx={idx} setIdx={setIdx}
            listMode={listMode} setListMode={setListMode}
          />
        )}
        {tab === "turn" && (
          <TurnView
            players={players} threat={threat} drawn={drawn} setDrawn={setDrawn}
            active={active} turn={turn} endTurn={endTurn} phase={phase} setPhase={setPhase}
          />
        )}
        {tab === "dice" && <DiceView hope={hope} />}
        {tab === "rules" && <RulesView />}
      </div>

      <nav className="nav">
        {NAV.map(([id, label]) => (
          <button key={id} className={`nb ${tab === id ? "on" : ""}`} onClick={() => setTab(id)} aria-current={tab === id}>
            {ICONS[id]}
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
