import "../../styles/armory-bb-tailwind.css";
import React, { useState, useEffect, useMemo } from "react";
import {
  Swords, Coins, Flame, Crown, Landmark, ChevronRight, ChevronDown,
  RotateCcw, Dices, BookOpen, Play, Plus, Minus, Check, AlertTriangle,
  Skull, Pickaxe, Shield, ArrowRight, Sparkles, Info, Search, ListChecks, X,
  Snowflake, Eye, Wand2, Scroll, Gem,
} from "lucide-react";

/* ==================================================================== *
 *  BURNING BANNERS — TABLE COMPANION
 *  Christopher Moeller / Compass Games · Undying Rules v1.1
 *  Basic and Advanced game, switchable at any time.
 * ==================================================================== */

const C = {
  ink: "#0b111d", panel: "#141c2d", panel2: "#1b2437",
  line: "#2b3750", lineSoft: "#212c42",
  brass: "#c09a4e", brassDim: "#7a6231",
  vellum: "#e9e0c9", mute: "#9aa3b8", faint: "#5d6780",
  banner: "#b3312f", bannerLt: "#e07a72",
  moss: "#79996d", frost: "#7fa8c9", arcane: "#9b7fc4",
};

const SEASONS = ["Spring", "Summer", "Autumn"];
const MAPS = ["The Broken Coast", "The Wildlands", "Imperial Heartland", "Fields of Ash"];

const KINGDOMS = {
  fjordland: {
    name: "Fjordland", crest: "#5c93ad", motif: "Jarls of the Sea of Tyr", income: true,
    rules: [
      ["Ranger Woodcraft", "Ranger armies — and heroes stacked with them — enter forest for 1 MP instead of 2. A ranger army adds one light die when attacking into, defending in, or striking into a forest hex (12.5.1)."],
      ["Seafaring", "Ship movement is a free action for Fjordland units — declare it before, during or after moving, once per activation. Their ship rating runs 2 higher: 8 leaving a port, 5 anywhere else. The Drakken is excluded, being both feral and huge (12.5.2)."],
    ],
    setup: ["Check whether your campaign opens any Fjordland units in coastal hexes or ports."],
  },
  empire: {
    name: "The Eastern Empire", crest: "#8f7fbe", motif: "The golden towers, crumbling", income: true, revolts: true,
    rules: [
      ["Revolts", "Roll on the revolt table every income actions step. Each income step, pay gold equal to the revolt total — every gold you cannot pay causes another revolt (12.4.2–12.4.4)."],
      ["Suppression", "During your activation, spend 1 gold to move the revolt track down by one. It can never go below zero (12.4.5)."],
      ["Fields of Ash", "If your campaign uses only that map, add +2 to every revolt roll (12.4.6)."],
      ["Collapse", "Falls on cities only if both imperial cities are in play. It also collapses on any revolt taken while the marker already sits on its +10 side at the top of the track (7.6, 12.4.7)."],
    ],
    setup: [
      "Place the revolt marker on the revolt track at the number your campaign specifies — often zero.",
      "Some campaigns let the Empire suppress revolts during setup. Check before you begin.",
    ],
  },
  oathborn: {
    name: "The Oathborn", crest: "#c9a13f", motif: "Sun and stone, arm in arm", income: true, mines: true,
    rules: [
      ["Mining", "A miner army standing on a mine hex may spend its action to work it for 1 gold. Mines are not settlements — any kingdom's units may pass through them freely (12.1.1)."],
      ["Dwarven Mountaineers", "Every Oathborn army except the siege engine — and Oathborn heroes — enter mountain hexes for 1 MP instead of 2 (12.1.2)."],
      ["The Lost City of Khazud", "Advanced only. Blessing #5 places Khazud in any empty mountain hex that is not a mine or road and not in or beside a settlement or lair. It is a magically fortified loyal Oathborn city worth +1 income, never eliminated once placed, and it does not count toward victory conditions (12.1.3)."],
      ["Collapse", "Falls on cities only if all three Oathborn cities are in play (7.6)."],
    ],
    setup: ["Mines are printed on the map in mountain hexes — no markers needed. Only the Oathborn care about them."],
  },
  night: {
    name: "The Army of the Night", crest: "#a8405c", motif: "The Witch Queen's cult", income: true, covens: true,
    rules: [
      ["Covens", "Once per income actions step, try to plant a coven in a hostile settlement that does not already hold one. Roll 1d6 needing 5+, with +1 each if the settlement is unoccupied, unfortified, and in or beside wilderness (12.3.1–12.3.2)."],
      ["What a coven does", "Pays 1 extra gold every income step, lets you raise and recover feral armies in wilderness beside it, and adds a light die when you attack the settlement hiding it. It does not change who controls the place (12.3.3)."],
      ["Hiding in Shadows", "When an enemy army ends its move on your coven, roll 1d6. On 5–6 it survives and is safe for the rest of that kingdom's turn. Otherwise it is discovered and removed (12.3.5)."],
      ["Feral recruiting", "Feral armies may be built and recovered in wilderness hexes next to friendly settlements and covens, even besieged ones. They arrive finished (10.1.2, 12.3.8)."],
      ["The Spire of the Moon", "Magically fortified. Enemies may never build a unit in a hex adjacent to it (12.3.6)."],
      ["Enslaved heroes", "Advanced only. The Enslave blessing puts an enslaved hero onto an enemy army, handing you control of it. It cannot target an army stacked with a hero or sitting in a settlement. The first hit on the stack kills the hero and frees the army (12.3.7)."],
    ],
    setup: ["Covens listed in your opening builds go down automatically — no die roll. Place them in any hostile settlement (12.3.2)."],
  },
  goblins: {
    name: "The Goblins", crest: "#c07a33", motif: "Khark's mountain swarm", shashka: true,
    rules: [
      ["No treasury", "Goblins never track income. Instead they pay 1 gold per control marker on the map each income step, or collapse (12.2.1)."],
      ["Expert Plunderers", "Looting pays 3 gold, doubled to 6 in a city (12.2.6)."],
      ["Lay Waste", "During income actions, swap any of your control markers for razed markers and loot each one as you go (12.2.2)."],
      ["Goblin Mountaineers", "Goblin armies except the siege engine — and goblin heroes — enter mountains for 1 MP. The orcs get no such thing (12.2.5)."],
      ["Collapse", "Falls if it cannot pay for its control markers, or if it ends an activation with none left on the map — but it is immune until it takes its first settlement (7.7, 12.2.3)."],
    ],
    setup: [
      "Goblin entry hexes are printed along the northern edges of The Broken Coast and The Wildlands (12.2.4).",
      "Goblins take no income marker on the season display.",
    ],
  },
  orcs: {
    name: "The Orcs", crest: "#7d8a5e", motif: "Grom's coastal horde", shashka: true,
    rules: [
      ["No treasury", "Orcs never track income. Instead they pay 1 gold per control marker on the map each income step, or collapse (12.2.1)."],
      ["Expert Plunderers", "Looting pays 3 gold, doubled to 6 in a city (12.2.6)."],
      ["Lay Waste", "During income actions, swap any of your control markers for razed markers and loot each one as you go (12.2.2)."],
      ["No mountaineering", "Unlike the goblins, orc armies pay full cost to enter mountains (12.2.5)."],
      ["Collapse", "Falls if it cannot pay for its control markers, or if it ends an activation with none left on the map — but it is immune until it takes its first settlement (7.7, 12.2.3)."],
    ],
    setup: [
      "Orc entry hexes are printed along the eastern edges of The Wildlands and Fields of Ash (12.2.4).",
      "Orcs take no income marker on the season display.",
    ],
  },
};

const REVOLT_TABLE = [
  { roll: "1", n: 4, title: "A season of fire and terror" },
  { roll: "2", n: 3, title: "Treasonous nobles form a faction" },
  { roll: "3", n: 2, title: "A commander stages a coup" },
  { roll: "4–5", n: 1, title: "Peasant uprising" },
  { roll: "6+", n: 0, title: "Imperium in aeternum" },
];

const d = (sides) => 1 + Math.floor(Math.random() * sides);
const shuffle = (a) => { const n = a.slice(); for (let i = n.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = n[i]; n[i] = n[j]; n[j] = t; } return n; };

/* Arcane study pool by kingdom count (17.1). */
function studyPoolFor(kingdomCount, isAutumn) {
  let g = 4, c = 2;
  if (kingdomCount === 2) { g = 2; c = 1; }
  else if (kingdomCount === 3) { g = 3; c = 1; }
  const pool = [];
  for (let i = 0; i < g; i++) pool.push("glyph");
  for (let i = 0; i < c; i++) pool.push("churn");
  if (isAutumn) pool.push("churn");   // the Autumn Churn marker joins the pool (17.2)
  return shuffle(pool);
}

/* ============================== atoms =============================== */

const Eyebrow = ({ children, tone = C.brass, rule }) => (
  <div className="uppercase flex items-baseline gap-2 flex-wrap" style={{ color: tone, fontSize: 10.5, letterSpacing: "0.22em", fontWeight: 700 }}>
    <span>{children}</span>
    {rule && <span className="font-mono" style={{ color: C.faint, fontSize: 9.5, letterSpacing: "0.04em", fontWeight: 600 }}>{rule}</span>}
  </div>
);

/* A white square is one light die (1.7.2) — used to label values that add dice. */
const LightPip = () => (
  <span style={{
    display: "inline-block", width: 9, height: 9, marginLeft: 5,
    background: "#ece7da", border: "1px solid #b9b2a1", borderRadius: 2,
    verticalAlign: "middle",
  }} />
);

const Panel = ({ children, className = "", style = {} }) => (
  <div className={`rounded-sm ${className}`} style={{ background: C.panel, border: `1px solid ${C.line}`, ...style }}>{children}</div>
);

const Btn = ({ children, onClick, tone = "brass", disabled, className = "", small }) => {
  const tones = {
    brass: { bg: "transparent", bd: C.brass, fg: C.brass, hov: "rgba(192,154,78,0.12)" },
    solid: { bg: C.brass, bd: C.brass, fg: C.ink, hov: "#d4ab5c" },
    ghost: { bg: "transparent", bd: C.line, fg: C.mute, hov: "rgba(255,255,255,0.05)" },
    danger: { bg: "transparent", bd: C.banner, fg: C.bannerLt, hov: "rgba(179,49,47,0.15)" },
    arcane: { bg: "transparent", bd: C.arcane, fg: "#c0aade", hov: "rgba(155,127,196,0.15)" },
  }[tone];
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      className={`rounded-sm transition-colors ${small ? "px-2.5 py-1" : "px-3.5 py-2"} ${className}`}
      style={{
        background: disabled ? "transparent" : h ? tones.hov : tones.bg,
        border: `1px solid ${disabled ? C.lineSoft : tones.bd}`,
        color: disabled ? "#4d566b" : tones.fg,
        fontSize: small ? 12 : 13, fontWeight: 600, letterSpacing: "0.03em",
        cursor: disabled ? "not-allowed" : "pointer",
      }}>{children}</button>
  );
};

const Coach = ({ on, children, label = "Why this matters" }) => {
  if (!on) return null;
  return (
    <div className="mt-2.5 rounded-sm px-3 py-2.5 flex gap-2.5"
      style={{ background: "rgba(192,154,78,0.07)", borderLeft: `2px solid ${C.brassDim}` }}>
      <Info size={13} style={{ color: C.brass, marginTop: 2, flexShrink: 0 }} />
      <div>
        <div className="uppercase mb-1" style={{ color: C.brassDim, fontSize: 9.5, letterSpacing: "0.2em", fontWeight: 700 }}>{label}</div>
        <div style={{ color: "#c3bda9", fontSize: 12.5, lineHeight: 1.65 }}>{children}</div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <label className="flex items-center gap-2"><span style={{ color: C.mute, fontSize: 11 }}>{label}</span>{children}</label>
);

const NumInput = ({ value, onChange, w = 56 }) => (
  <input type="number" value={value} onChange={(e) => onChange(+e.target.value || 0)}
    className="font-mono rounded-sm px-2 py-1"
    style={{ width: w, background: C.ink, color: C.vellum, border: `1px solid ${C.line}`, fontSize: 13 }} />
);

const Pills = ({ options, value, onChange }) => (
  <div className="flex gap-1.5 flex-wrap">
    {options.map((o) => (
      <button key={o[0]} onClick={() => onChange(o[0])} className="rounded-sm px-2.5 py-1"
        style={{
          fontSize: 11, fontWeight: 600,
          background: value === o[0] ? C.brass : "transparent",
          color: value === o[0] ? C.ink : C.mute,
          border: `1px solid ${value === o[0] ? C.brass : C.lineSoft}`,
        }}>{o[1]}</button>
    ))}
  </div>
);

const AdvTag = () => (
  <span className="uppercase rounded-sm px-1.5" style={{
    color: "#c0aade", border: `1px solid rgba(155,127,196,0.45)`,
    fontSize: 8.5, letterSpacing: "0.16em", fontWeight: 700, padding: "1px 5px",
  }}>Advanced</span>
);

/* ------------------------ signature: dice tray ---------------------- */

const OCT = "polygon(50% 0%,85% 15%,100% 50%,85% 85%,50% 100%,15% 85%,0% 50%,15% 15%)";

const Die = ({ value, heavy, hit, crit, small }) => {
  const s = small ? 26 : 36;
  return (
    <div className="flex items-center justify-center font-mono" style={{
      width: s, height: s,
      background: heavy ? "#0e0e11" : "#ece7da",
      color: heavy ? "#ece7da" : "#1a1a1f",
      clipPath: heavy ? OCT : undefined,
      borderRadius: heavy ? 0 : 4,
      border: heavy ? "none" : "1px solid #b9b2a1",
      outline: crit ? `2px solid ${C.banner}` : hit ? `2px solid ${C.moss}` : "none",
      outlineOffset: 2, fontSize: small ? 12 : 16, fontWeight: 700,
      opacity: hit || crit ? 1 : 0.42,
    }}>{value}</div>
  );
};

const DiceRow = ({ rolls, title, tone }) => (
  <div>
    <Eyebrow tone={tone}>{title}</Eyebrow>
    <div className="flex flex-wrap gap-2.5 mt-2">
      {rolls.length === 0 && <div style={{ color: C.mute, fontSize: 12, fontStyle: "italic" }}>no dice</div>}
      {rolls.map((r, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <Die value={r.v} heavy={r.heavy} hit={r.hit} crit={r.crit} />
          {r.confirms && r.confirms.map((c, j) => (
            <div key={j} className="flex flex-col items-center">
              <div style={{ width: 1, height: 6, background: C.line }} />
              <Die value={c.v} hit={c.hit} small />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

function rollPool({ light, heavy, threshold, confirmCrits }) {
  const rolls = []; let successes = 0;
  /* A critical is a die result of 7+ *after* modifiers (1.10, 9.8). Since a −1 fortification
     is expressed here by raising the success threshold, the crit bar rises with it: open ground
     needs a raw 7, a fortification needs a raw 8, and a magical fortification puts criticals out
     of reach altogether until siege engines cut the modifier down. */
  const critAt = threshold + 2;
  for (let i = 0; i < light; i++) {
    const v = d(6), hit = v >= threshold;
    if (hit) successes++;
    rolls.push({ v, heavy: false, hit, crit: false });
  }
  for (let i = 0; i < heavy; i++) {
    const v = d(8), hit = v >= threshold, crit = v >= critAt;
    if (hit) successes++;
    const r = { v, heavy: true, hit, crit, confirms: [] };
    if (crit && confirmCrits) {
      const cv = d(6), chit = cv >= 5;   // confirmation is never modified by fortification (9.8.1)
      if (chit) successes++;
      r.confirms.push({ v: cv, hit: chit });
    }
    rolls.push(r);
  }
  return { rolls, successes };
}

/* ======================= CARD CLARIFICATION INDEX =================== */
/* Condensed from the rulebook's own card guide (18.1–18.3), in my words.
   Card text itself stays on the cards — this is the "how does that
   actually resolve" index for when play stops. */

const NONE = "Nothing extra to know — resolve it exactly as printed on the card.";

const SPELLS = [
  [1, "Heat Ray", "No effect at all if the target's combat rating contains no heavy dice."],
  [2, "Dust Devil", "No effect at all if the target's combat rating contains no light dice."],
  [3, "Sudden Fog", "It removes dice from a combat rating, so it does nothing against effects that bypass combat ratings — Lightning Bolt, for instance."],
  [4, "Earthquake", "May strike a fortified settlement, which strikes normally cannot, and ignores its −1. No effect on magically fortified settlements. Roll separately for each hex it touches."],
  [5, "Crushing Vines", "After seeing the first strike's result you may discard a spell to strike the same target again."],
  [6, "Tsunami", "The target must be in a coastal hex adjacent to a sea hex. It cannot target anything beside Loch Fossvanet on the Wildlands map — the loch is too small for a wave."],
  [7, "Mage Arrows", NONE],
  [8, "Lightning Bolt", "Decide whether to use the optional heavy die before any dice are rolled."],
  [9, "Swarm of Bees", "Gaining an ability never forces you to use it — play it for the light die even if you have no intention of declaring an ambush."],
  [10, "Necromancy", "May target any eliminated unit in range, friendly or enemy. Monsters are not valid targets."],
  [11, "Portal", "A unit placed into a hex holding a finished unit becomes finished itself."],
  [12, "Wave Strider", "The target may use ship movement as a free action once during its activation. Still only one ship move per turn, so it cannot then take ship movement as its action. Huge and feral armies may use ship movement when targeted by this."],
  [13, "Tidal Shelter", "May be played after dice have been rolled, to negate hits that were inflicted."],
  [14, "Illusion", "You may legally wait while the striking player pumps up the strike, then negate it — as long as you play it before any dice are rolled. Everything played in support is still spent. During an ambush, only the targeted player's strike is cancelled."],
  [15, "Negation", "Because of battle magic ordering, it cannot cancel a cantrip the attacker plays after the defender has finished with cantrips. A card it targets counts as played even though the effect was cancelled."],
  [16, "Sleep", "A hero stacked with the finished army becomes finished too. If the attacker negates it with a cantrip, combat carries on."],
  [17, "Cure Wounds", "It can save a unit taking two hits. Hits land after battle magic limits lift, so take the first hit, play this to recover, then take the second and end the battle weakened rather than dead."],
  [18, "Blood Magic", "Cannot be cast by a monster. Cards the eliminated caster played earlier are not negated."],
  [19, "Cloud of Darkness", "Must be played before dice are rolled."],
  [20, "Monsters in the Hills", "Places a wandering monster, never a sea monster, and it must appear within 3 hexes of a lair — not a sea lair."],
  [21, "Teleport", "The caster's stack does not become finished. It can start moving, teleport, finish its move, and still take an action."],
  [22, "Living Grimoire (Tome)", "The only tome in the spell deck. Play it alongside another spell, discard it, then draw a replacement spell and a blessing."],
  [23, "Spellbound", "Cannot be played if you would still hold three spells afterwards — your hand would already be at full strength."],
  [24, "Martyrdom", "Cards the eliminated caster played earlier are not negated. The two blessings you draw may come from the same kingdom or from different ones you control."],
  [25, "Giant's Strength", "Cannot target a unit whose combat rating has no light dice."],
  [26, "Earth to Mud", "Targets a stack that moved into a hex — moved, not built or placed — whether by ordinary movement, a magic card or a hero power. It cannot target a unit entering a hex it could not legally end its activation in. Play it as it happens; never retroactively."],
  [27, "Fear", "If the targeted army cannot legally move, it takes a hit instead. Moving adjacent to an enemy commanded monster is allowed. Monsters and garrisons cannot be targeted. A stacked hero may go with the army or stay put."],
  [28, "Molten Hammer", NONE],
  [29, "Black Tide", "The wandering monster goes into a sea hex adjacent to a coastal hex. Loch Fossvanet is a legal destination for it."],
  [30, "Feral Mastery", "Affects feral armies only — not a feral hero, and not a non-feral hero or army."],
  [31, "Ice Storm", NONE],
  [32, "Blazing Hands", NONE],
  [33, "Ray of Weakness", "May be played after dice have been rolled, to cancel one success."],
  [34, "Banished to Meji", "Battle magic ordering means it cannot cancel a cantrip the attacker plays after the defender has finished casting cantrips."],
  [35, "Demonic Possession", "Its strike harms nothing except the targeted hero. A hero gained this way must be placed immediately, following the rules for a gained hero."],
  [36, "Summon the Dead", "Disregard the reference to Monster on the card."],
  [37, "Ritual of Power", "Cannot be cast by a hero in a stack with no light dice in its combat rating."],
  [38, "Ritual of Speed", "Both the caster and an army it is stacked with gain +2 to their printed movement ratings for the spell's duration."],
  [39, "Summon Kraken", "Loch Fossvanet on the Wildlands map does contain a sea hex. Disregard the card's references to Monster and Garrison."],
  [40, "Summon Morag", "Disregard the card's references to Monster and Garrison."],
  [41, "Unerring Darts", "Played after the caster's stack has already rolled its dice."],
  [42, "Undertow", "Battle magic ordering means it cannot affect a cantrip the attacker plays after the defender has finished casting cantrips."],
  [43, "Fireball", NONE],
  [44, "Festering Wounds", "Lets one critical inflict up to three extra hits instead of one. If you rolled several criticals, only one of them confirms with three light dice — the rest confirm with one each."],
  [45, "Paths of Dread", "Casting is a free action, so the caster's stack can move and take its action before playing this."],
  [46, "The Four Fingered Fist", "Targeting an unexplored lair draws a monster into it, and that monster becomes the strike's target. The gold reward for defeating it is its printed value minus one — the adventuring company's fee. If the monster has no gold reward, you owe nothing."],
  [47, "Moryana's Fury", "Say stop as the target crosses a sea hexside, then play it. You may not wait to see where the stack ends up and play it retroactively."],
  [48, "Hawk Eye", "Only a unit or stack with Ranged may cast it."],
  [49, "Ritual of Vigilance", "The casting mage may not be occupying a settlement."],
  [50, "Sigil of Courage", "It cannot stop a full-strength army being weakened, but it can stop a weakened army being eliminated."],
  [51, "Spirit Blade", NONE],
  [52, "Heat Lightning", NONE],
];

const TREASURES = [
  [1, "Storm God's Hammer", "The caster gains one light die — or one heavy die instead, if the opposition includes a monster or a hero."],
  [2, "Endless Satchel", "On gaining it you must decide immediately whether to sell it or play it. While you own it you retrieve two treasures every time you study treasures, and in winter you may keep three treasures plus the satchel itself, four in all, instead of two."],
  [3, "Orb of Confusion", "Must be played before any dice are rolled. You cannot, for example, watch an Earthquake resolve and then cancel it."],
  [4, "Philosopher's Stone", "An opponent randomly chooses which spell gets discarded."],
  [5, "Horn of Udun", "Worth playing creatively. Place an army from an adjacent hex into a defending hex to deny the victor its advance, or drop an army into a hex an enemy is about to enter to block it."],
  [6, "Khadan's Feathered Cloak", "A feral hero stacked with a feral army does not cancel the army's feral characteristic."],
  [7, "Ring of the Moirai", "The blessing you discard must match the kingdom of the unit hoping to re-roll. Hold no blessings and you cannot play it."],
  [8, "The Journal of Thorgils Ogmundarson (Tome)", "Increases the range of the spell it is played alongside."],
  [9, "Infernal Sphere", "An opponent randomly chooses the discarded spell. Adds one success to your attack."],
  [10, "Soul Drinker", "One light die, plus two more if the opposition includes a hero. Monsters do not count — they have no souls to drink."],
  [11, "Elven Bow", "One light die plus Ranged, and one more light die if the opposition includes a monster or hero."],
  [12, "Ring of Invisibility", "It is legal to assign a hit to the caster and then negate that hit with this."],
  [13, "Ring of Dragons", "Does not grant Flying to an army the caster is stacked with. A feral hero stacked with a feral army does not cancel the army's feral characteristic."],
  [14, "Wizard Staff", NONE],
  [15, "Staff of Plagues", "Every spell or treasure your opponent plays during battle magic, before or after this one, costs them one die. If they are rolling mixed dice, you choose which type they lose. Blessings do not trigger it, and neither do cards played by anyone other than your opponent."],
  [16, "Black Arrow", "The caster gains Stealth and Ranged, plus one heavy die if the opposition includes a monster or hero."],
  [17, "Treasure Hoard", "Gain the gold shown. The card is then eliminated and returns to the treasure deck next winter."],
  [18, "Treasure Hoard", "Gain the gold shown. The card is then eliminated and returns to the treasure deck next winter."],
  [19, "Treasure Hoard", "Gain the gold shown. The card is then eliminated and returns to the treasure deck next winter."],
  [20, "Black Diamond", "Can start chains of criticals, because the dice used to confirm a critical can themselves roll criticals. A single lucky stack can inflict a startling number of hits."],
  [21, "Book of the Dead (Tome)", "Play alongside a spell to force an opponent to discard a magic card. They choose whether it is a spell or a blessing; if they only hold one type, that is the one. A player holding neither cannot be targeted."],
  [22, "Encyclopedia of Monstrosities (Tome)", "Play alongside a spell. The caster gains one light die plus all the abilities of one commanded monster in play. With no commanded monsters anywhere, you still get the die."],
  [23, "The Astronomicon (Tome)", "Play alongside a spell to draw another spell."],
  [24, "Scrolls of Scholos (Tome)", "Play alongside a spell to draw a blessing."],
  [25, "Staff of Healing", "Its effects last a full turn rather than the usual magic card duration."],
  [26, "Helm of Domination", "Every spell or treasure your opponent plays during battle magic, before or after this one, gains the caster one heavy die. Blessings are ignored, and so are cards played by anyone other than your opponent."],
  [27, "Draconic Shield", "Cards and hero powers that affect fortified settlements — Infernal Sphere, for one — do not affect it."],
  [28, "White Wolf Amulet", "A feral hero stacked with a feral army does not affect the army's feral characteristics."],
  [29, "Curse of Xaraxxes", "Once you have been given a curse you cannot pass it on. You must pay 1 gold to retrieve any treasure; without the gold, no retrieval. Curses themselves can never be sold or retrieved. You may eliminate a curse at any time for 3 gold."],
  [30, "The Red Wizard's Curse", "Works exactly like Curse of Xaraxxes — no passing it on, 1 gold to retrieve any treasure, 3 gold to be rid of it."],
  [31, "Tablets of Amûn Koth (Tome)", "The mage casting the tablets and the mage casting the accompanying spell must be the same one."],
  [32, "Eye of Kagutomo", "Cannot be cast by a mage occupying a settlement hex."],
  [33, "Storm Giant's Amulet", "The caster gains Huge for the rest of its activation — so no ship movement, and it will raze any settlement it occupies."],
  [34, "Iron Golem", "Roll the heavy die it provides separately. It hits on 5 or better, including against magical fortifications."],
  [35, "Fountain of Power", "Gain a hero, then eliminate the fountain and draw another treasure. The eliminated card returns to the deck next winter."],
  [36, "Fountain of Valor", "Works exactly like Fountain of Power — gain a hero, eliminate the fountain, draw another treasure."],
];

/* Blessings, by kingdom (18.3). Kingdom-specific: only that kingdom may draw, cast or
   benefit from them, and only on its own turn unless the card is a cantrip (16.4). */
const BLESSINGS = {
  fjordland: [
    [1, "Water Elemental", "Needs a Fjordland mage, range 2. It can target a Fjordland army sitting in a major river or coastal hex, or one attacking into such a hex."],
    [2, "Call of the Wild", "Needs a Fjordland mage, range 3. Targets a Fjordland army in a wilderness hex, or attacking into one. Wilderness settlements count as wilderness hexes."],
    [3, "Warrior of the North", "Not a cantrip — Fjordland's turn only."],
    [4, "Quest to the Western Isles", "Cannot be played unless you hold two spells."],
    [5, "Song of the Valkyrie", "Needs a Fjordland mage. On 5–6 a Valkyrie army is placed in an adjacent hex and the caster gains a light die."],
    [6, "Berserk Rage", "Only a Berserkir army may cast it. It scores criticals on 6 or better instead of the usual 7."],
    [7, "Shield Wall", "Any Fjordland unit may be affected, including garrisons — both of loyal Fjordland settlements and of settlements holding Fjordland control markers."],
    [8, "Tyr's Favor", "Any Fjordland army may discard a spell for one light die, plus a heavy die if it occupies a coastal or major river hex."],
    [9, "Gyda's Favor", "Any Fjordland army may discard a spell for one light die, plus two more light dice if it occupies a wilderness hex — a wilderness settlement counts."],
    [10, "Northern Rangers", "Only a Fjordland ranger army may cast it."],
  ],
  empire: [
    [1, "Bread & Circuses", "Playable only during the Imperial activation phase."],
    [2, "For the Emperor!", "Unplayable if both Placidia and Aureliana are razed, enemy-controlled, or not in play. Stacking limits apply, though the cataphract may go into a besieged city. Costs one extra revolt."],
    [3, "Hand of the Emperor", "Once played, no suppressions at all until the following Imperial turn."],
    [4, "Heir of Bahuramman", "Not a cantrip — Imperial turn only."],
    [5, "Conscription", "The suppression option is off the table while Hand of the Emperor is in force. Choosing the Akritoi option places three armies by the normal build rules, but free."],
    [6, "Massed Charge", "A cataphract or korsari army may cast it."],
    [7, "Elite Archers", "Cast by a stack with Ranged."],
    [8, "Disciplined Veterans", "May be played on a weakened Imperial army."],
    [9, "Fist of the Emperor", "You choose how many dice you want, up to three, and suffer that many revolts."],
    [10, "Call to Glory", "Cast by an Imperial mage, and it must be stacked with an army whose combat rating includes at least one light die."],
  ],
  oathborn: [
    [1, "The Deep Paths", "Sets a ready or activated stack's movement rating to 5 flat, whatever it was printed at. Movement points already spent come off that 5."],
    [2, "Delve Greedily", "Played after a miner army has used its action to mine. On a 6 the miner digs up two extra gold plus a treasure."],
    [3, "Secret Ways", "Once played, you may build and recover in or adjacent to besieged Oathborn settlements for the rest of the turn."],
    [4, "The Ravens are Flying", "A razed marker on the target settlement is removed immediately at no cost in gold. A unit may be placed into a besieged loyal Oathborn settlement with this."],
    [5, "Lost City of Khazud", "Places Khazud on the map — see 12.1.3. The card is removed from the game permanently once played."],
    [6, "Fury of the Ancestors", "Only after an Oathborn stack has won a combat, and before it advances. The stack may advance or stay, then attack again with one extra heavy die. It also lets you decline to advance into a defeated settlement — in which case it is not looted and control does not change hands."],
    [7, "Spirit of the Mountain", "A cantrip, so it can be used slyly — adding a hero to a combat during battle magic, for example."],
    [8, "Mountain Folk", "The target army may move with +2 movement, then attack with two extra light dice."],
    [9, "Strongheart", "Not a cantrip — Oathborn turn only."],
    [10, "Runestones", "Playable even when you are already at or above full strength. After drawing you discard back down to three spells."],
  ],
  goblins: [
    [1, "Instruments of Mischief", "Not a cantrip, so it can only ever help attacking goblin armies."],
    [2, "We Have Our Ways", NONE],
    [3, "Khark's Chosen", "Not a cantrip. Rather than taking a random hero you examine them all and choose one, then shuffle the rest back face down onto the playmat."],
    [4, "Quick and Quiet", "A goblin stack containing a hero may move through enemy-occupied hexes — but only those. Not hostile settlements, lairs, sea hexes, or any other prohibited terrain."],
    [5, "Spy Network", "Because the card never mentions winning or losing, it may return to hand after an ambush in which you inflicted one or more hits."],
    [6, "Natural Selection", "The hero may be placed in any eligible hex."],
    [7, "Eye of Badrok", "Requires a goblin hero to cast."],
    [8, "Sneak Attack", NONE],
    [9, "Boulder Toss", "Mountain troll and hill troll armies may cast it. Manstrangler may not — he is a hero, not an army."],
    [10, "Infiltration", "An opponent randomly chooses which spell is discarded. The enemy army or garrison affected is the one the goblins are attacking or defending against."],
  ],
  orcs: [
    [1, "Whips of Grom", "Requires an orc mage. The targeted orc stack must be able to perform an attack action after it moves."],
    [2, "Grom's Forge", "The target stack must include an orc hero and an orc reaver army — a weakened reaver is fine. Defeat a monster and you take the reward. Attacking a hostile settlement, it is razed if left unoccupied after taking hits; otherwise nothing happens to it."],
    [3, "Pestilence", "Not a strike, so it reaches units inside a fortified settlement. Choose one of your stacks adjacent to a non-orc stack and have that player roll a d6. A success means it backfires and your stack takes the hit; a failure means theirs does."],
    [4, "New Recruits", NONE],
    [5, "Enforced Discipline", NONE],
    [6, "Feed off the Land", "Armies may recover anywhere at all — no need to be in or beside an orc settlement."],
    [7, "Endless Hate", "If the reaver is eliminated after defeating a monster you still take the reward. If it dies attacking a hostile settlement, the settlement is razed if left unoccupied after hits."],
    [8, "Hate", "May only target an orc reaver army."],
    [9, "Grom's Hammer", "This one is a cantrip — playable on anyone's turn."],
    [10, "Overrun", "If an orc army eliminated by Overrun had just defeated a monster, you still take the reward. Same settlement-razing note as Endless Hate."],
  ],
  night: [
    [1, "Out of the Shadows", "Places a wandering monster, never a sea monster, and it must appear within 5 hexes of a lair — not a sea lair."],
    [2, "Enslave", "Requires an Army of the Night mage. If the roll fails and the casting hero is still unlocked, you may lock it to keep the blessing rather than discarding it."],
    [3, "Enslave", "Requires an Army of the Night mage. If the roll fails and the casting hero is still unlocked, you may lock it to keep the blessing rather than discarding it."],
    [4, "Enslave", "Requires an Army of the Night mage. If the roll fails and the casting hero is still unlocked, you may lock it to keep the blessing rather than discarding it."],
    [5, "Powerful and Eternal", "Lets you study one magical discipline — spells, blessings or treasures — at any point during your own turn."],
    [6, "Your True Rulers", "A cantrip, and it wants playing on an opponent's turn: units built in settlements holding your covens arrive finished. It also locks your covens in place for the rest of that turn."],
    [7, "Moonlit Champion", "A cantrip, so it can be used slyly — adding a hero to a combat during battle magic, for example."],
    [8, "Knives in the Dark", "Play it instead of making a Hiding in Shadows roll. Its strike works inside fortified and even magically fortified settlements, still succeeding on 5 or better."],
    [9, "Shapeshift", "Play it when a hero is eliminated, for any reason at all. Unplayable if the Army of the Night controls no settlements."],
    [10, "Rule the Night", "Requires a mage to cast."],
  ],
};

/* Hero cards, by kingdom (18.3). Each hero has both a unit and a card naming its power,
   which enters play unlocked beside the playmat (14.5). */
const HEROCARDS = {
  fjordland: [
    [11, "Lieva Eriksdottir · Mistress of the Hunt", "Move Lieva's stack one hex, or leave it where it is if that is a forest. Played during battle magic so that her stack is no longer adjacent to its opponent, the combat is cancelled outright and the attacker is finished."],
    [12, "Thor Jotunsson · Sea King's Axe", "An ongoing power. While Thor is in a coastal hex, lakes included, one light die in his stack becomes a heavy die. This is not optional — convert if you can."],
    [13, "Freyja · Wings of Valor", "The rescued hero and its card never leave play, and the card does not unlock if it was locked. The saved hero may not stay in the hex where it was eliminated, even if that hex is adjacent to Freyja."],
    [14, "Saffi Sigmundsdottir · Song of Rebirth", "Affects Fjordland armies only, and its effects last a full turn rather than the usual duration."],
    [15, "Cronax the Berserkir · Song of Slaying", "Freyja's Wings of Valor may be used to prevent Cronax being eliminated."],
    [16, "Astrid Laufgrein · Gyda's Fury", NONE],
    [17, "Karl Bondarsson · Song of Bravery", NONE],
  ],
  empire: [
    [11, "Ariadne, the Gray Wolf · Beast Slayer", NONE],
    [12, "Anna Lontius · Velvet Glove", NONE],
    [13, "Princess Sofia · The Sacred Banner", "After Sofia's stack advances it may move into any adjacent legal hex or stay where it is — and it may attack again."],
    [14, "Frostheart · Helm of the White Dragon", "An opponent in combat with Frostheart may not play spells during the battle magic step. Blessings and treasures are unaffected, and spells become available again at combat step 3."],
    [15, "Vesta Psellos · Blinding Ray", "Cannot target a unit or stack with no light dice in its combat rating."],
    [16, "Bardas Maleinos · Lightbringer", NONE],
  ],
  oathborn: [
    [11, "Haga-Tor: The Red Eagle · Blade of the Ancestors", "Lets his stack advance after winning as the defender, as well as declare its own attack. If Haga-Tor advances into a settlement, the Oathborn loot it and take control."],
    [12, "Yeti Elder · Lore of the Ancients", "Each combat, attacking or defending, the Yeti Elder may draw a spell and then immediately discard one. Unplayable with no spells in hand."],
    [13, "Stormcaller · Heart of Ice", "Decide whether to add the heavy die to the strike before rolling anything."],
    [14, "Smith-Master Horne · Dwarven Defense", "While Horne is in a settlement — port or not — three enemy armies are needed to besiege it. He may also be built in a besieged settlement."],
    [15, "Throndil · Durngur's Hammer", "An ongoing power: one extra light die for as long as Throndil is stacked with a miner army."],
    [16, "Dara Firemane · Lightning Rune", "Lock to gain a light die. It carries the cantrip symbol, so you may lock her during any player's turn, and she unlocks at the start of the next Oathborn turn."],
  ],
  goblins: [
    [11, "Finger Cutter · Khark's Tailor", "An ongoing power. While stacked with a fragile army it negates one hit every time hits are scored against it — except hits from strikes."],
    [12, "Weasel Eyes · Cull the Weak", "Wins combats that end in a draw, meaning neither side rolled a success, inflicting one hit. Ambushes never produce wins, ties or draws, so it does nothing there."],
    [13, "Manstrangler · Living Siege Engine", "Gains a siege engine's ability until the end of the activation: it negates an adjacent fortification's −1, or reduces an adjacent magical fortification's −2 to −1."],
    [14, "Iron Skull · Deadskull's Helm", "An ongoing power: one extra light die for as long as Iron Skull is stacked with a goblin elite army."],
    [15, "Swarm Master · Thousand Wing Cloak", "An ongoing power: he gains Flying for as long as he is stacked with a plague fly army."],
    [16, "Siskar · Khark's Troubadour", "Not a cantrip. On the goblin turn you may lock Siskar at any moment to force a re-roll, including someone else's — and it can be any d6 roll in the game, not just a combat roll."],
    [17, "Turku · Pyromania", NONE],
  ],
  orcs: [
    [11, "Warlord Szark · Lightning Axes", "Playable whenever a strike is declared in combat, whether Szark's or his opponent's. It overrides the rule that a strike inflicts only one hit. Note that Szark himself does not have Stealth."],
    [12, "Spy-Master Kagash · Prince of Deception", "Targets two enemy units within three hexes of Kagash, provided those two are adjacent to each other. One strikes the other with its combat rating, and the orc player rolls it. Either player may cast cards to influence the strike."],
    [13, "Gond the Unbreakable", "His power is ongoing — the heavy die printed on his card."],
    [14, "Kovat the Flayer · Terror Rides Before Him", "The target must be adjacent to Kovat, and cannot be moved into a hex it could not legally enter. The target's own owner makes the move."],
    [15, "Karsch · Stranglethorn", NONE],
    [16, "Sumesh · The Black Death", "Spells Sumesh cast before his elimination are not cancelled."],
  ],
  night: [
    [11, "Lilith, Queen of the Night · Immortal Sorceress", "Only triggers when Lilith casts a spell or blessing carrying the mage requirement — Knives in the Dark, for instance, would not set it off. She also has a second, always-on power: +2 to Enslave rolls, which survives her card being locked."],
    [12, "Luna, Mist Hunter · Deadly Assassin", "A strike that inflicts no hits when it succeeds and cannot generate criticals. If the strike fails and you hold no spells, Luna is eliminated."],
    [13, "Dominia, Herald of Scyx · Ring of Domination", "Covens placed within 5 hexes of Dominia go down automatically with no roll. She also has an always-on +1 to Enslave rolls, which survives her card being locked."],
    [14, "Kali, Shrouded Reaper · Scourge of Shadows", "Her power works on the opponent's combat rating, so it bites in both ambushes and ordinary combat. Lairs do not count as wilderness for this, but wilderness settlements do."],
    [15, "Kharis · Night Winds", "An ongoing power: +1 movement to a flying army she is stacked with. It does not affect ship movement."],
    [16, "Bela · Animal Lover", "An ongoing power: one extra light die for as long as Bela is stacked with a feral army."],
  ],
};

/* ========================== RULES REFERENCE ========================= */
/* [category, term, rule, body, advanced?] */

const REF_BASE = [
  ["Sequence", "Years and seasons", "5.1", "A campaign runs across years of spring, summer and autumn, plus winter. Every kingdom takes exactly one turn per campaign season. Winter is skipped entirely in the basic game."],
  ["Sequence", "Turn order", "5.2", "Kingdoms act in banner order along the turn track, left to right. When the last banner finishes, the season ends."],
  ["Sequence", "Income actions step", "6.1", "Before you collect gold: you may disband a siege engine. The Empire must roll for revolts, the Army of the Night may attempt a coven, and a Shashka kingdom may lay waste to its own settlements."],
  ["Sequence", "Income step", "6.2", "Collect gold equal to your income. The Army of the Night adds 1 per coven. The Empire pays out gold equal to its revolt total. A Shashka kingdom pays 1 gold per control marker or collapses."],
  ["Sequence", "Activation phase", "7.0", "Your units all become ready. Build new armies and activate existing ones, one at a time, in whatever order you like."],
  ["Sequence", "Ending the activation phase", "7.5", "Declare it over whenever you want, or it ends automatically when you can no longer build or activate anything."],
  ["Sequence", "Season ends", "11.0", "Advance the season marker. If it lands on the campaign end marker the game is over — score it. Otherwise pull all banners out of the turn-complete boxes and start again."],
  ["Sequence", "Arcane study phase", "13.2, 17.3", "In the advanced game every kingdom's turn ends with an arcane study phase that all players take part in. Flip that turn's marker: a glyph lets everyone study three different disciplines, a churn lets everyone study one.", true],
  ["Sequence", "Winter season", "13.2.2", "In the advanced game winter is played, not skipped. In order: place the Autumn Churn marker on next year's autumn and redistribute study markers, clear defeated monsters out of lairs to reopen them, sell treasures down to two, reshuffle all discard piles, then move to next spring.", true],

  ["Actions", "What counts as an action", "7.2", "A unit may move, then take exactly one action: attack, ship movement, recover, work a mine if it is an Oathborn miner, or pass. Then it is finished."],
  ["Actions", "Free actions", "7.3", "These do not use your action and you may take any number: looting, placing a control or razed marker, removing a razed marker for 2 gold, regenerating, Fjordland ship movement, and in the advanced game playing a magic card, using a hero power, or selling a treasure."],
  ["Actions", "Ready and finished", "7.1", "All your units start your turn ready. A unit that has moved or acted is finished and cannot activate again this turn. Rotate finished units 45° so the table can see at a glance."],
  ["Actions", "Ending a unit's activation", "7.4", "A unit becomes finished when it performs an action, when another unit activates, or when you build something."],

  ["Combat", "Declaring an attack", "9.0", "An active army may attack an adjacent enemy army or a hostile settlement — and in the advanced game an unexplored lair or an enemy-commanded monster."],
  ["Combat", "Combat rating", "1.7.2", "The dice symbols printed on a counter. A white square is one light die (d6); a black diamond is one heavy die (d8)."],
  ["Combat", "Rolling", "1.10", "Any die that comes up 5 or better is a success. Modifiers written as +x or −x adjust the roll itself, so a −1 means you need 6 or better."],
  ["Combat", "Total combat rating", "9.1.1", "Add your army's printed rating, plus — for the defender only — dice from the hexside between the two hexes and dice from the terrain in the defending hex. In the advanced game, hero powers and magic cards add to it as well."],
  ["Combat", "Winning", "9.2", "Most successes wins, and the loser takes hits equal to the difference. Equal successes with at least one rolled is a tie. Zero successes on both sides is a draw and nothing happens."],
  ["Combat", "Taking hits", "9.2.1", "A full-strength army flips to weakened. A weakened army is eliminated. A fragile army is eliminated outright. A garrison is defeated, and the attacker must then advance. In the advanced game a hero is eliminated and a monster defeated."],
  ["Combat", "Advancing", "9.3", "If your attack empties the defending hex you may move into it. You must move in if the hex held a settlement you just defeated. You may never advance into a prohibited hex."],
  ["Combat", "Kingdom, card and hero modifiers", "9.4.1", "Separate from the terrain chart, and an important exception to the terrain-helps-the-defender rule: a kingdom's own rules can add dice to an attacker. A Fjordland ranger gains a light die when attacking into a forest hex as well as when defending in one. Magic cards and hero powers modify combat ratings the same way. Read the information card before counting your dice."],
  ["Combat", "Dice versus roll modifiers", "9.1.1, 9.4, 4.4", "Two different things, easily confused. Terrain adds dice to the defender's pool — hexside terrain between the hexes, and the terrain inside the defending hex. A fortification instead modifies the attacker's die rolls, so the number of dice is unchanged but each one needs a higher result. The values for terrain in a hex live on the Terrain Effects Chart on the player aid card, not in the rulebook."],
  ["Combat", "Terrain modifiers", "9.4", "Chart terrain only ever helps the defender. If several modifiers apply, all of them apply together. Terrain is ignored completely during strikes, and during combat with a monster. The worked example: an unoccupied mountain wilderness settlement attacked across a major river rolls 1 light die for its garrison, 1 more for the mountain wilderness terrain, and 2 for the major river hexside — four in all."],
  ["Combat", "Garrisons", "9.5", "An unoccupied settlement defends with one light die. A city defends with three light dice whether or not an army stands in it. Razing a settlement removes its garrison."],
  ["Combat", "Ambush", "9.6", "If either side has Stealth it may declare an ambush, which replaces normal combat with two sequential strikes — the Stealth side goes first. If both sides have Stealth, neither may ambush."],
  ["Combat", "Strikes", "9.7", "Only the striking side rolls. Terrain is ignored, so no river or in-hex dice — a garrison is not terrain, so an unoccupied settlement still answers with its own. One hit is inflicted no matter how many successes you roll, and only a confirmed critical adds more. Strikes cannot target units in fortified settlements."],
  ["Combat", "Critical hits", "9.8, 9.8.1", "A result of 7 or better is both a success and a critical. Roll one d6 to confirm it — on 5 or better it adds another success, and the confirmation roll is never affected by fortification modifiers. Because modifiers adjust the roll itself (1.10), a −1 fortification means you need a raw 8 to score a critical, and a magical fortification puts criticals out of reach until siege engines cut the modifier down."],
  ["Combat", "Fortified settlements", "4.4", "Fortified imposes −1 on every attacking die roll; magically fortified imposes −2. Against a magical fortification light dice cannot succeed at all without siege help."],
  ["Combat", "Siege engines", "9.11", "Each siege engine adjacent to a fortification cancels one −1 for itself and all friendly and allied attackers. Two allied engines erase a magical fortification's −2 entirely; a third adds nothing. A siege engine's own combat rating only works on defence and against un-razed settlements."],
  ["Combat", "Attacking an empty settlement", "4.7", "A settlement with no army in it still fights back with its garrison. Beat it and you must advance in and loot."],
  ["Combat", "Battle magic ordering", "16.7.3", "When an attack is declared, card play becomes strictly ordered: the attacker plays cards or powers, then the defender may play cantrips only, then the attacker may play cantrips only. After the dice are rolled in combat step 2 the restriction lifts and everyone plays normally again.", true],
  ["Combat", "Battle magic in an ambush", "16.7.3", "Battle magic restrictions stay in force until the unit that declared the ambush actually rolls its dice.", true],
  ["Combat", "Allies and battle magic", "16.7.4", "During battle magic, the attacker's allies may only play cantrips when the attacker plays cards, and the defender's allies only when the defender plays cards.", true],
  ["Combat", "Advanced combat sequence", "16.8", "Battle magic, then ambush declaration, then dice and critical confirmation — at which point battle magic ends — then results, hits and advance.", true],
  ["Combat", "Strikes outside combat", "16.9", "A hit on a monster defeats it but earns no reward. If a strike leaves a hostile settlement unoccupied, its control marker is removed — or the settlement is razed if there was none. No looting, no control marker placed. Strikes never hit welcoming settlements. Ambush strikes are part of combat and are not governed by this.", true],

  ["Movement", "Movement rating", "8.0", "The number printed on the counter. Spend movement points as you enter each hex; you may never exceed the rating in one activation."],
  ["Movement", "The one-hex minimum", "8.1", "An activated unit may always move at least one hex, even if that hex costs more than its entire movement rating."],
  ["Movement", "Roads and bridges", "8.1.1", "Crossing a hexside marked with a road or bridge costs 1 MP regardless of the terrain. A non-flying unit that travels entirely along roads gains +1 MP for the turn."],
  ["Movement", "River hexsides", "8.1.2", "Cost +1 MP to cross, and give the defender one extra light die when attacked across. A river symbol that dead-ends inside a hex is just a source and does nothing."],
  ["Movement", "Major river hexsides", "8.1.2", "Cost +2 MP to cross, and give the defender two extra light dice when attacked across. Roads and bridges cancel the movement cost but not the combat effect."],
  ["Movement", "Major river hexes", "8.1.2", "Major rivers are also a hex type. Ships travel inland along them, moving from one major river hex to the next."],
  ["Movement", "Sea and coastal hexes", "8.1.3", "Sea hexes are solid blue; coastal hexes carry a coastline. Only flying units and units using ship movement may cross sea hexsides, and nothing may ever end its move in a sea hex."],
  ["Movement", "Ship movement", "8.1.4", "An action giving a second move using a ship rating: 6 leaving a friendly port or entry hex, otherwise 3. It costs 1 MP per hexside and must end in a coastal or major river hex."],
  ["Movement", "Crossing a river by ship", "8.1.6", "You may spend ship movement to cross a river or major river hexside and end in an ordinary hex — but your ship movement ends immediately, even with points left."],
  ["Movement", "Prohibited hexes", "8.2", "You may not enter a hex holding an enemy army, a hostile settlement, an allied or enemy entry hex, a sea hex, or a lair. Flying units may pass through some of these but never stop there. Lairs have no exceptions at all."],
  ["Movement", "Stacking", "8.3", "One army per hex in the basic game, checked at the end of each move. You may pass through a friendly hex but not stop in it."],
  ["Movement", "Switching places", "8.3.1", "You may end a move in an over-stacked hex if the unit already there is friendly and ready. You then get no action, and that unit must activate next and leave."],
  ["Movement", "Entry hexes", "4.11", "You may build in your own entry hexes. You may pass through another kingdom's entry hex but never stop in it, and entry hexes are never besieged."],

  ["Settlements", "Loyalty", "4.1", "A settlement with a kingdom's crest belongs to them, as long as it carries no control or razed marker. It welcomes their units and their allies, and is hostile to their enemies."],
  ["Settlements", "Loyal neutral", "4.1.1", "Loyal to a kingdom that is not in this campaign. Your campaign rules say whether it is friendly or hostile to you."],
  ["Settlements", "Neutral", "4.1.2", "No crest at all. Again, the campaign rules decide its posture."],
  ["Settlements", "Cities", "4.2", "Cities loot for double, keep a three-dice garrison even when occupied, and are what most kingdoms lose the game by losing."],
  ["Settlements", "Wilderness settlements", "4.3", "Count as both a settlement and the forest or mountain hex they sit in — so they get both benefits on defence. There is no extra movement cost to enter one."],
  ["Settlements", "Ports", "4.5", "A unit starting ship movement in a port gets a rating of 6. A port is only besieged when two enemy armies stand adjacent, not one."],
  ["Settlements", "Posture", "4.6", "Welcoming settlements you may walk into freely. Hostile settlements you must beat in combat first. Control and razed markers change a settlement's posture."],
  ["Settlements", "Looting", "4.8", "Entering a hostile settlement loots it — a free action worth 2 gold, or 3 for a Shashka army, doubled in a city. Huge armies never loot, and feral armies only loot when stacked with a hero."],
  ["Settlements", "Capturing a settlement", "4.9.2", "In order: loot it, remove any enemy control marker, advance in, then place your control or razed marker depending on the settlement's posture, then adjust both incomes."],
  ["Settlements", "Control markers", "4.9.1", "Placed on settlements you take. Each lets you build there and is worth +1 income. You are limited to the markers on your playmat."],
  ["Settlements", "Removing control markers", "4.9.4", "You may voluntarily pull your own markers on your turn. If doing so would make the settlement hostile to you, it is razed instead — and you do not loot it."],
  ["Settlements", "Income adjustment", "4.9.5", "+1 when you place a control marker, or when an enemy marker is cleared off one of your loyal settlements. −1 when your marker is removed, or when one of your loyal settlements is razed or taken."],
  ["Settlements", "Razed markers", "4.10", "A settlement is razed when a huge or feral army enters it, when a Shashka kingdom lays waste, when a capturing army chooses to burn rather than hold, or when pulling a control marker would leave it hostile."],
  ["Settlements", "What razed means", "4.10.1", "The settlement is gone from play while the marker sits there: no looting, no control, no building or recovery, no garrison, no fortification, no port, no loyalty. The hex reverts to plain terrain."],
  ["Settlements", "Clearing a razed marker", "4.10.2", "On your turn, an army sitting in a welcoming razed settlement may clear the marker as a free action for 2 gold. Then place a control marker and fix the incomes."],

  ["Building", "Where you can build", "10.1", "In a friendly entry hex, or in or adjacent to a friendly settlement. Never weakened, never while another army is active, never into an occupied hex, never into a settlement you made friendly this turn, and never in or beside a besieged settlement."],
  ["Building", "When you can build", "10.1", "Before, between, and after your activations. This is the rule most new players miss, and most of the strategy lives in it."],
  ["Building", "Ready or finished on arrival", "10.1.1", "An army built in an entry hex or settlement hex arrives ready. One built in an adjacent hex arrives finished."],
  ["Building", "Besieged settlements", "10.3", "An enemy army adjacent to a settlement besieges it: you cannot build or recover there. Movement is unaffected — units walk in and out freely. Ports need two adjacent enemies to be besieged."],
  ["Building", "Recovery", "10.4", "A weakened army may spend its action to flip back to full strength, paying the recovery cost printed on its weakened side. It must be in a friendly entry hex, or in or beside an un-besieged welcoming settlement."],
  ["Building", "Unit limits", "10.0", "Each kingdom has a fixed pool of each unit type. Once they are all on the map you cannot build more until one dies. You may never voluntarily return a unit to the playmat — except a siege engine."],
  ["Building", "Magic and recovery", "10.4.2", "When a magic card or hero power causes an army to recover, no gold is paid and no settlement is needed. It simply flips back to full strength.", true],

  ["Abilities", "Ranged", "3.1.1", "Wins tied combats, inflicting one hit. If both sides have it, neither wins the tie. It also stops flying units passing through the hex. It has no effect during an ambush."],
  ["Abilities", "Stealth", "3.1.2", "Lets the unit declare an ambush. If both sides have Stealth, neither may."],
  ["Abilities", "Regenerate", "3.1.3", "Recover as a free action, anywhere on the map, with no settlement needed. Not usable inside a besieged settlement or in the middle of resolving combat."],
  ["Abilities", "Flying", "3.1.4", "Ignores terrain costs, may pass through enemy armies and hostile settlements, denies the defender river modifiers, and may attack across sea hexsides. It cannot enter lairs, and it has no effect while using ship movement."],
  ["Abilities", "Mage", "3.1.5", "A unit with this ability counts as a mage for casting magic cards. Heroes and some monsters have it.", true],

  ["Characteristics", "Feral", "3.2.1", "Wild beasts. They raze hostile settlements rather than taking them, and can never loot, place control markers, or use ship movement. All of those limits are lifted while the army is stacked with a non-feral hero."],
  ["Characteristics", "Fragile", "3.2.2", "One hit destroys it outright. It never becomes weakened, and it can never recover."],
  ["Characteristics", "Huge", "3.2.3", "Giants. They raze what they enter, may never end an activation in a welcoming settlement, never loot or control, and cannot use ship movement. A hex with a huge army in it cannot have its razed marker cleared."],
  ["Characteristics", "Siege engine", "1.7.7", "A specialist army for cracking fortifications. Its combat rating only works on defence and when attacking un-razed settlements — it cannot attack an army in the open."],

  ["Heroes", "What a hero is", "14.1", "Heroes are units — wizards and warriors that add their abilities, combat rating and unique power to an army they stack with.", true],
  ["Heroes", "Building heroes", "14.2", "Heroes are drawn at random from a face-down stack. Build them in an entry hex, or in or adjacent to an un-besieged friendly settlement, never into a hex already holding a hero. Built in an entry or settlement hex they arrive ready; adjacent, they arrive finished.", true],
  ["Heroes", "Gaining a hero from a card", "14.3", "A hero gained through a magic card may be placed with any friendly army anywhere, including inside a besieged settlement. It arrives ready or finished to match that army.", true],
  ["Heroes", "Heroes in combat", "14.4", "The stack gains the hero's powers, combat rating and abilities — everything except Flying. A hit on the stack may be assigned to the hero, killing it, or to the army. All eliminated heroes are shuffled back face down with the unbuilt ones at the end of each turn.", true],
  ["Heroes", "Hero cards", "14.5", "When a hero reaches the map its card goes face up beside the playmat, unlocked. The card describes its power.", true],
  ["Heroes", "Lock", "14.5.2", "Playing a power with the Lock keyword turns its card 90° to the right. It stays locked — power unusable — until the beginning of that player's next activation phase. Locking the card has no effect on the hero unit itself.", true],
  ["Heroes", "Stacking with heroes", "14.6", "One army and one hero of the same kingdom may share a hex, moving, acting and fighting together.", true],
  ["Heroes", "Moving as a stack", "14.6.1", "A stack moves at the speed of its slowest member and neither may exceed its own rating. A moving unit may pick up a ready friendly unit and carry on, or drop one off — the dropped unit is finished and gets no action.", true],
  ["Heroes", "Stacks and abilities", "14.6.3", "The stack benefits from both units' abilities, except Flying — which the stack only gains if both units have it. Characteristics are never shared between stacked units.", true],
  ["Heroes", "Stacks and advancing", "14.6.4", "A stack advances together or not at all. Advancing into a hex holding an enemy hero eliminates it. Defeating a monster never permits an advance.", true],
  ["Heroes", "Lone heroes", "14.6.5", "A hero with no army can neither attack nor be attacked. An enemy army entering its hex simply eliminates it. Inside a settlement, though, it is not lone — the settlement counts as unoccupied but the hero commands the garrison, adding its rating and abilities.", true],

  ["Monsters", "Lairs", "15.1", "Hexes marked with a monster symbol. No unit of any kind may ever enter a lair, flying included. A lair with no monster in it is unexplored and may be attacked.", true],
  ["Monsters", "Sea monsters", "15.1.1", "A separate pool, marked with a blue symbol, drawn when a sea lair is attacked. An army adjacent to a sea lair or sea monster may always attack it, even across a sea hexside.", true],
  ["Monsters", "Attacking a monster", "15.2", "Attacking an unexplored lair draws a monster at random into the hex, and combat is resolved at once. Terrain is ignored entirely in combat with a monster.", true],
  ["Monsters", "Defeating a monster", "15.2.1", "A single hit defeats a monster. In a lair it flips face down and the lair becomes explored, safe from further attack. Anywhere else it goes back into its pool.", true],
  ["Monsters", "Commanding monsters", "15.3", "A monster entering play comes under the command of an opponent of whoever attacked it. Each kingdom may command at most three. A commanded monster with Mage may cast spells for its commander — never blessings or treasures. Monsters cannot move, stack or advance.", true],
  ["Monsters", "What a commanded monster may do", "15.4", "Once per turn it may strike a target in range, slink away back to the pool, or pass. It may never be attacked or struck by the kingdom commanding it or that kingdom's allies — anyone else may have a go.", true],
  ["Monsters", "Monster strike range", "15.5", "Sea monsters reach 4 hexes, flying monsters 3, mages 2, and everything else adjacent only. Range may be traced through prohibited hexes, except that a sea monster traces only across sea and coastal hexsides.", true],
  ["Monsters", "Reward", "15.6", "Defeating a monster in combat earns the gold printed on its counter plus a treasure card. A monster eliminated outside combat earns nothing.", true],
  ["Monsters", "Wandering monsters", "15.7", "Placed by magic cards outside lairs. They enter play ready under the active kingdom's command, and cannot go into a lair, an occupied hex, or a settlement hex — razed ones included. Their hex becomes prohibited while they sit there. Defeating one earns the gold but no treasure.", true],
  ["Monsters", "Abandoned lairs", "15.8", "Lairs your campaign marks as abandoned may never be attacked, but count as lairs for everything else.", true],

  ["Magic", "The three decks", "16.0", "Spells are a common deck everyone draws from. Treasures are a common deck, usually won from monsters. Blessings are kingdom-specific — only that kingdom's player may draw, cast or benefit from them, and only on their turn unless the card is a cantrip.", true],
  ["Magic", "Treasures become owned", "16.1.2", "A played treasure is not discarded — it goes face up beside your playmat as an owned card, and may be retrieved to hand later by studying treasures.", true],
  ["Magic", "Hand size", "16.1.3", "There is no maximum hand size. Full strength governs only how many you may draw up to.", true],
  ["Magic", "Selling treasures", "16.5", "On your turn, sell any treasure — owned or in hand — for 2 gold. You may not play and sell the same treasure in one turn. In winter you must sell down to two.", true],
  ["Magic", "Casting", "16.6", "A card may require a mage. If so, pick a friendly or commanded unit with the Mage ability to be its caster — the effect originates there. Casting is a free action. A hero power may only ever be cast by the hero named on the card.", true],
  ["Magic", "Requirements", "16.6.2", "Cards may demand a mage, a range, a specific ability, a specific kingdom, or be a tome. Ranges given as a span, like 3–5, mean no closer than the first and no farther than the second.", true],
  ["Magic", "Tomes", "16.6.2", "A tome may only be played alongside a spell from your own hand, and it counts as a cantrip if that spell is a cantrip. Cancel the spell and you cancel the tome with it.", true],
  ["Magic", "Cantrips", "16.7.2", "Cards marked with the cantrip symbol are the only ones playable during an opposing kingdom's turn. During battle magic the active player may answer the defender's cantrips with cantrips of their own.", true],
  ["Magic", "Duration", "16.7.1", "Unless the card says otherwise, an effect lasts until the currently active unit or stack finishes its activation. With no unit active, it resolves immediately and ends.", true],
  ["Magic", "Playing to no effect", "16.7", "A card may never be played to no effect — you cannot, for instance, raise the movement rating of a unit that has already finished.", true],
  ["Magic", "Keywords", "16.6.3", "Strike: an attack the defender rolls no dice against. Gain: temporary abilities or dice. Eliminate this card: removed from the game, returning to its deck in winter. Place: put into a hex without moving, so its ready or finished state does not change. Discard: playing the card costs you an extra spell.", true],

  ["Arcane study", "Study markers", "17.1", "Two kingdoms use 2 glyphs and 1 churn; three kingdoms 3 glyphs and 1 churn; four or more 4 glyphs and 2 churn. They are shuffled face down and one goes under each kingdom's banner, extras set aside unexamined.", true],
  ["Arcane study", "Autumn churn", "17.2", "The Autumn Churn marker sits on the autumn space of the season track. When summer is finalised it joins the study pool, making magic harder as the year darkens. In winter it comes back out and goes onto next year's autumn.", true],
  ["Arcane study", "Glyph or churn", "17.3", "A glyph lets every player study three different disciplines. A churn lets every player study just one.", true],
  ["Arcane study", "Study treasures", "17.4.1", "Retrieve one treasure you own back into your hand. You cannot study this if you own none, and there is no limit on treasures in hand.", true],
  ["Arcane study", "Study blessings", "17.4.2", "Draw up to full strength in blessings — one from each kingdom you control. You may discard one first if you want a different card.", true],
  ["Arcane study", "Study spells", "17.4.3", "Draw up to full strength in spells, which is three. You may discard one first.", true],
  ["Arcane study", "Full strength", "17.4.4", "Three spells; one blessing per kingdom you control; any number of treasures. Full strength applies only during arcane study and setup — it is not a hand limit.", true],
  ["Arcane study", "Reshuffling", "17.5", "Discard piles and eliminated treasures return to their decks in winter. If a deck runs dry when you must draw, reshuffle its discards immediately and carry on.", true],

  ["Team play", "Friends, allies, enemies", "1.2.1", "Your own units are friendly. Units of a kingdom on your side are allied. Everything on the other side is an enemy."],
  ["Team play", "Sending gold", "1.11.1", "On your turn you may transfer gold to an allied kingdom at two for one — you spend 2, they receive 1."],
  ["Team play", "Allied settlements", "1.11.3", "You may never attack an allied settlement, and you may never place a control marker in one."],
  ["Team play", "Denying entry", "1.11.4", "An ally may refuse to let your unit enter their controlled settlement. It stays allied and still cannot be attacked."],
  ["Team play", "Winning together", "1.11.5", "Unless a campaign says otherwise, everyone on a side wins or loses together."],

  ["Collapse", "Kingdom collapse", "7.6", "At the end of your activation, if every one of your cities is razed or holds an enemy control marker, the kingdom collapses. The Empire and Oathborn are exempt unless all of their cities are in play — two for the Empire, three for the Oathborn."],
  ["Collapse", "What collapse does", "7.6", "The kingdom leaves the game. Armies and control markers come off the map, its loyal settlements become loyal neutrals, and razed markers stay where they are. In the advanced game no study marker goes under its banner, and treasures owned by the player stay in play."],
  ["Collapse", "Shashka collapse", "7.7", "Checked twice a season: during income if it cannot pay 1 gold per control marker, and at the end of activation if it has no control markers left. It is immune until it takes its first settlement."],
  ["Collapse", "Imperial collapse", "12.4.7", "The Empire falls if it takes a revolt while the marker already sits on its +10 side at the top of the revolt track."],
];

/* Fold the card index into the same searchable list. */
const kingdomCards = (src, cat) => Object.keys(src).reduce((acc, kid) => acc.concat(
  src[kid].map((c) => [cat, KINGDOMS[kid].name + " " + c[0] + ". " + c[1], "18.3", c[2], true])
), []);

const REF = REF_BASE
  .concat(SPELLS.map((s) => ["Spells", s[0] + ". " + s[1], "18.1", s[2], true]))
  .concat(TREASURES.map((t) => ["Treasures", t[0] + ". " + t[1], "18.2", t[2], true]))
  .concat(kingdomCards(BLESSINGS, "Blessings"))
  .concat(kingdomCards(HEROCARDS, "Hero cards"));

const CATS = ["Sequence", "Actions", "Combat", "Movement", "Settlements", "Building", "Abilities", "Characteristics", "Heroes", "Monsters", "Magic", "Arcane study", "Team play", "Collapse", "Spells", "Treasures", "Blessings", "Hero cards"];

/* ========================= MODULE 1 · SETUP ========================= */

function Setup({ onBegin, teach, existing, mode }) {
  const [stage, setStage] = useState(0);
  const [name, setName] = useState("");
  const [maps, setMaps] = useState(["The Wildlands"]);
  const [year, setYear] = useState(1);
  const [season, setSeason] = useState(0);
  const [endYear, setEndYear] = useState(2);
  const [endSeason, setEndSeason] = useState(2);
  const [picked, setPicked] = useState({ empire: "resistance", goblins: "invader" });
  const [order, setOrder] = useState(["goblins", "empire"]);
  const [gold, setGold] = useState({});
  const [income, setIncome] = useState({});
  const [controls, setControls] = useState({});
  const [covens, setCovens] = useState({});
  const [checks, setChecks] = useState({});

  const adv = mode === "advanced";
  const stages = adv
    ? ["The campaign", "Kingdoms", "Banner order", "Treasury", "Magic", "Table check"]
    : ["The campaign", "Kingdoms", "Banner order", "Treasury", "Table check"];
  const lastStage = stages.length - 1;

  // Switching rules set from the header adds or removes the magic stage — keep the wizard in range.
  useEffect(() => { setStage((s) => Math.min(s, lastStage)); }, [lastStage]);

  const toggleKingdom = (id) => setPicked((p) => {
    const n = { ...p };
    if (n[id]) { delete n[id]; setOrder((o) => o.filter((x) => x !== id)); }
    else { n[id] = "resistance"; setOrder((o) => o.concat([id])); }
    return n;
  });
  const move = (id, dir) => setOrder((o) => {
    const i = o.indexOf(id), j = i + dir;
    if (j < 0 || j >= o.length) return o;
    const n = o.slice(); const t = n[i]; n[i] = n[j]; n[j] = t; return n;
  });
  const toggleMap = (m) => setMaps((ms) => ms.indexOf(m) >= 0 ? ms.filter((x) => x !== m) : ms.concat([m]));

  const canAdvance = stage === 0 ? maps.length > 0 : stage === 1 ? order.length >= 2 : true;
  const kc = order.length;

  const checklist = useMemo(() => {
    const items = [
      ["maps", `Fit together ${maps.length === 1 ? "the map" : "all " + maps.length + " maps"}: ${maps.join(", ")}.`],
      ["season", `Season marker on ${SEASONS[season]}, Year ${year}. Campaign end marker on ${SEASONS[endSeason]}, Year ${endYear}.`],
      ["banners", "Place each kingdom's banner on the turn track in the order you set."],
      ["incomeMk", "Put an income marker on the track for every kingdom that has income. Orcs and goblins get none."],
      ["playmats", adv
        ? "Lay out each playmat with its gold, armies, siege engine, control markers, heroes and monster command markers."
        : "Lay out each playmat with its gold, armies, siege engine and control markers. Ignore the advanced-game spaces."],
      ["infocards", "Set each kingdom's information card beside its playmat."],
      ["markers", adv
        ? "Place the starting control, razed and abandoned lair markers your campaign lists on the map."
        : "Place the starting control and razed markers your campaign lists on the map."],
      [adv ? "arcaneAdv" : "arcane", adv
        ? `Build the study pool: ${kc === 2 ? "2 glyphs and 1 churn" : kc === 3 ? "3 glyphs and 1 churn" : "4 glyphs and 2 churn"} for ${kc} kingdoms. Shuffle face down, one under each banner, extras aside unexamined.`
        : "Ignore every space on the turn track marked with a book — those are advanced-game arcane study spaces."],
      ["builds", "Resolve opening builds in the order your campaign gives, placing armies in or beside friendly settlements and entry hexes."],
      ["siegenote", "Ignore the besieged-settlement build restriction while setting up. It only applies once play begins."],
    ];
    if (adv) {
      items.push(["churn", "Put the Autumn Churn marker on the autumn space of the season track."]);
      items.push(["monsters", "Randomise the monsters into two face-down pools — land and sea — so nobody knows what is where."]);
      items.push(["decks", "Shuffle the spell and treasure decks onto the magic card display, and each kingdom's blessing deck beside its playmat."]);
      items.push(["heroes", "Shuffle each kingdom's heroes face down onto the heroes space, generic side up, with their hero cards nearby."]);
      items.push(["draw", "Every player draws to full strength: three spells, plus one blessing from each kingdom they control."]);
    }
    order.forEach((id) => (KINGDOMS[id].setup || []).forEach((s, i) => items.push([id + i, KINGDOMS[id].name + ": " + s])));
    return items;
  }, [maps, season, year, endSeason, endYear, order, adv, kc]);

  const allChecked = checklist.every((c) => checks[c[0]]);
  const isTableCheck = stage === lastStage;
  const isMagicStage = adv && stage === 4;

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <Eyebrow>Module one · rule 2</Eyebrow>
      <h2 className="font-serif mt-2 mb-1" style={{ color: C.vellum, fontSize: 30, letterSpacing: "-0.01em" }}>Set up the campaign</h2>
      <p style={{ color: C.mute, fontSize: 14, lineHeight: 1.7 }}>
        Open your campaign book and copy its numbers across. Everything after this runs itself.
      </p>

      {existing && (
        <Panel className="mt-5 p-3.5" style={{ borderColor: C.brassDim }}>
          <div className="flex items-center gap-2.5 flex-wrap">
            <AlertTriangle size={14} style={{ color: C.brass }} />
            <span style={{ color: C.vellum, fontSize: 13 }}>A campaign is already in progress.</span>
            <Btn small tone="ghost" onClick={existing}>Return to it</Btn>
          </div>
        </Panel>
      )}

      <div className="flex items-center gap-1 mt-7 mb-6">
        {stages.map((w, i) => (
          <button key={w} onClick={() => { if (i <= stage) setStage(i); }} className="flex-1 text-left">
            <div style={{ height: 2, background: i <= stage ? C.brass : C.lineSoft, marginBottom: 7 }} />
            <div className="uppercase" style={{ color: i === stage ? C.brass : i < stage ? C.mute : C.faint, fontSize: 9, letterSpacing: "0.14em", fontWeight: 700 }}>{w}</div>
          </button>
        ))}
      </div>

      {stage === 0 && (
        <Panel className="p-5">
          <Eyebrow rule="2.1, 5.1">Which game, which campaign, how long</Eyebrow>
          <Coach on={teach}>
            The campaign book carries everything: which maps and kingdoms are in play, who sets up first, the
            starting forces, and how you win. Pick a small one for a first game — a single map, two kingdoms, basic rules.
          </Coach>

          <div className="mt-5 rounded-sm px-3.5 py-3 flex items-start gap-2.5"
            style={{
              background: adv ? "rgba(155,127,196,0.08)" : C.panel2,
              border: `1px solid ${adv ? "rgba(155,127,196,0.35)" : C.lineSoft}`,
            }}>
            <Wand2 size={14} style={{ color: adv ? C.arcane : C.brassDim, marginTop: 2, flexShrink: 0 }} />
            <div>
              <div className="font-serif" style={{ color: C.vellum, fontSize: 14 }}>
                Setting up the {adv ? "advanced" : "basic"} game
              </div>
              <div style={{ color: C.mute, fontSize: 12.5, lineHeight: 1.65, marginTop: 3 }}>
                {adv
                  ? "Heroes, monsters, magic cards, arcane study, and a winter that actually gets played."
                  : "Armies, gold and ground, with winter skipped."}
                {" Change it with the "}
                <strong style={{ color: adv ? "#c0aade" : C.brass }}>{adv ? "ADVANCED" : "BASIC"}</strong>
                {" button in the header — now, or partway through a campaign."}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <Field label="Campaign name">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Invasion of Drefeld"
                className="rounded-sm px-2.5 py-1.5 flex-1"
                style={{ background: C.ink, color: C.vellum, border: `1px solid ${C.line}`, fontSize: 13, minWidth: 190 }} />
            </Field>
          </div>

          <div className="mt-5">
            <div style={{ color: C.mute, fontSize: 11, marginBottom: 8 }}>Maps in play</div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {MAPS.map((m) => {
                const on = maps.indexOf(m) >= 0;
                return (
                  <button key={m} onClick={() => toggleMap(m)} className="rounded-sm px-3 py-2 text-left flex items-center gap-2.5"
                    style={{ background: on ? "rgba(192,154,78,0.1)" : "transparent", border: `1px solid ${on ? C.brass : C.lineSoft}` }}>
                    <span style={{ width: 12, height: 12, borderRadius: 2, background: on ? C.brass : "transparent", border: `1px solid ${on ? C.brass : C.line}` }} />
                    <span style={{ color: on ? C.vellum : C.mute, fontSize: 13 }}>{m}</span>
                  </button>
                );
              })}
            </div>
            {maps.length === 1 && maps[0] === "Fields of Ash" && (
              <div className="mt-2.5 flex items-start gap-2" style={{ color: C.brass, fontSize: 12 }}>
                <Info size={12} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>Fields of Ash alone: the Empire adds +2 to every revolt roll. The turn runner will apply it for you.</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-8 mt-6">
            <div>
              <div style={{ color: C.mute, fontSize: 11, marginBottom: 6 }}>Begins</div>
              <div className="flex gap-2">
                <select value={season} onChange={(e) => setSeason(+e.target.value)} className="rounded-sm px-2 py-1.5"
                  style={{ background: C.ink, color: C.vellum, border: `1px solid ${C.line}`, fontSize: 13 }}>
                  {SEASONS.map((s, i) => <option key={s} value={i}>{s}</option>)}
                </select>
                <select value={year} onChange={(e) => setYear(+e.target.value)} className="rounded-sm px-2 py-1.5"
                  style={{ background: C.ink, color: C.vellum, border: `1px solid ${C.line}`, fontSize: 13 }}>
                  {[1, 2, 3].map((y) => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div style={{ color: C.mute, fontSize: 11, marginBottom: 6 }}>Ends after</div>
              <div className="flex gap-2">
                <select value={endSeason} onChange={(e) => setEndSeason(+e.target.value)} className="rounded-sm px-2 py-1.5"
                  style={{ background: C.ink, color: C.vellum, border: `1px solid ${C.line}`, fontSize: 13 }}>
                  {SEASONS.map((s, i) => <option key={s} value={i}>{s}</option>)}
                </select>
                <select value={endYear} onChange={(e) => setEndYear(+e.target.value)} className="rounded-sm px-2 py-1.5"
                  style={{ background: C.ink, color: C.vellum, border: `1px solid ${C.line}`, fontSize: 13 }}>
                  {[1, 2, 3].map((y) => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>
          </div>
          <Coach on={teach}>
            {adv
              ? "In the advanced game winter is a real season with its own housekeeping — the app will walk you through it when you reach one."
              : "Winter is skipped entirely in the basic game — after autumn you jump straight to the following spring."}
          </Coach>
        </Panel>
      )}

      {stage === 1 && (
        <Panel className="p-5">
          <Eyebrow rule="1.2, 1.11">Who is playing, and on which side</Eyebrow>
          <Coach on={teach}>
            Every campaign splits into an <em>invader</em> side and a <em>resistance</em> side. Anything on your side
            is allied: its settlements welcome your armies and you may never attack them. Everything on the other
            side is an enemy. You win or lose as a team. With fewer players than kingdoms, someone runs two.
          </Coach>
          <div className="grid gap-2 mt-5">
            {Object.keys(KINGDOMS).map((id) => {
              const k = KINGDOMS[id], on = !!picked[id];
              return (
                <div key={id} className="flex items-center gap-3 rounded-sm px-3 py-2.5 flex-wrap"
                  style={{ background: on ? C.panel2 : "transparent", border: `1px solid ${on ? C.line : C.lineSoft}` }}>
                  <button onClick={() => toggleKingdom(id)} className="flex items-center gap-3 flex-1 text-left" style={{ minWidth: 185 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 999, background: on ? k.crest : "transparent", border: `1px solid ${on ? k.crest : C.line}` }} />
                    <span className="font-serif" style={{ color: on ? C.vellum : C.mute, fontSize: 15 }}>{k.name}</span>
                    <span style={{ color: C.faint, fontSize: 11.5 }} className="hidden sm:inline">{k.motif}</span>
                  </button>
                  {on && <Pills options={[["invader", "Invader"], ["resistance", "Resistance"]]} value={picked[id]}
                    onChange={(v) => setPicked((p) => ({ ...p, [id]: v }))} />}
                </div>
              );
            })}
          </div>
          {order.length < 2 && <div className="mt-3" style={{ color: C.mute, fontSize: 12.5, fontStyle: "italic" }}>Pick at least two kingdoms.</div>}
        </Panel>
      )}

      {stage === 2 && (
        <Panel className="p-5">
          <Eyebrow rule="2.2, 5.2">Banner order on the turn track</Eyebrow>
          <Coach on={teach}>
            Fixed for the whole campaign. The leftmost banner goes first every season, and once everyone has taken a
            turn the season advances.
          </Coach>
          <div className="mt-5 space-y-1.5">
            {order.map((id, i) => (
              <div key={id} className="flex items-center gap-3 rounded-sm px-3 py-2.5"
                style={{ background: C.panel2, border: `1px solid ${C.lineSoft}` }}>
                <span className="font-mono" style={{ color: C.brassDim, fontSize: 12, width: 18 }}>{i + 1}</span>
                <span style={{ width: 3, height: 20, background: KINGDOMS[id].crest }} />
                <span className="font-serif flex-1" style={{ color: C.vellum, fontSize: 14 }}>{KINGDOMS[id].name}</span>
                <span className="uppercase hidden sm:inline" style={{ color: C.faint, fontSize: 9, letterSpacing: "0.15em", fontWeight: 700 }}>{picked[id]}</span>
                <button onClick={() => move(id, -1)} style={{ color: C.mute, fontSize: 15 }} className="px-1.5">↑</button>
                <button onClick={() => move(id, 1)} style={{ color: C.mute, fontSize: 15 }} className="px-1.5">↓</button>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {stage === 3 && (
        <Panel className="p-5">
          <Eyebrow rule="2.3, 2.5">Opening builds and starting position</Eyebrow>
          <Coach on={teach}>
            Income is where your marker sits on the income track — you collect that much gold on every one of your
            turns. Orcs and goblins have no income at all; they live off plunder and instead <em>pay</em> 1 gold per
            control marker each turn. Opening-build gold may usually be saved rather than spent.
          </Coach>
          <div className="mt-5 space-y-2">
            {order.map((id) => {
              const K = KINGDOMS[id];
              return (
                <div key={id} className="rounded-sm px-3.5 py-3" style={{ background: C.panel2, border: `1px solid ${C.lineSoft}` }}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <span style={{ width: 3, height: 18, background: K.crest }} />
                    <span className="font-serif" style={{ color: C.vellum, fontSize: 14 }}>{K.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-5">
                    <Field label="Gold"><NumInput value={gold[id] || 0} onChange={(v) => setGold((g) => ({ ...g, [id]: v }))} /></Field>
                    {!K.shashka
                      ? <Field label="Income"><NumInput value={income[id] || 0} onChange={(v) => setIncome((g) => ({ ...g, [id]: v }))} /></Field>
                      : <span style={{ color: C.faint, fontSize: 11, fontStyle: "italic", alignSelf: "center" }}>no income track</span>}
                    <Field label="Control markers"><NumInput value={controls[id] || 0} onChange={(v) => setControls((g) => ({ ...g, [id]: v }))} /></Field>
                    {K.covens && <Field label="Covens"><NumInput value={covens[id] || 0} onChange={(v) => setCovens((g) => ({ ...g, [id]: v }))} /></Field>}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {isMagicStage && (
        <Panel className="p-5">
          <div className="flex items-center gap-2.5"><Wand2 size={15} style={{ color: C.arcane }} /><Eyebrow tone={C.arcane} rule="16.7">Magic, heroes and monsters</Eyebrow></div>
          <Coach on={teach}>
            Nothing to enter here — this is the prep the advanced game adds, and the table check will repeat it as
            a tickable list. The one thing worth getting right now is the study pool, because its size depends on
            how many kingdoms you just chose.
          </Coach>
          <div className="mt-5 space-y-2">
            {[
              ["Study markers", `${kc} kingdom${kc === 1 ? "" : "s"} in play, so your pool is ${kc === 2 ? "2 glyphs and 1 churn" : kc === 3 ? "3 glyphs and 1 churn" : "4 glyphs and 2 churn"}. Shuffle face down and put one under each banner. Extras go to the unused space, unexamined.`],
              ["Autumn churn", "Its marker starts on the autumn space of the season track. It joins the pool once summer is finalised, then comes back out in winter."],
              ["Monsters", "Randomise into two face-down pools, land and sea, so their identities stay hidden until a lair is cracked open."],
              ["Decks", "Shuffle spells and treasures onto the magic card display. Each kingdom's blessings shuffle separately, beside its own playmat."],
              ["Heroes", "Shuffle each kingdom's heroes face down, generic side showing, with hero cards to hand."],
              ["Opening hands", "Everyone draws to full strength: three spells plus one blessing per kingdom they control. Running two kingdoms means five cards."],
            ].map((r) => (
              <div key={r[0]} className="rounded-sm px-3.5 py-3" style={{ background: C.panel2, border: `1px solid ${C.lineSoft}` }}>
                <div className="font-serif" style={{ color: C.vellum, fontSize: 14 }}>{r[0]}</div>
                <div style={{ color: C.mute, fontSize: 12.5, lineHeight: 1.65, marginTop: 3 }}>{r[1]}</div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {isTableCheck && (
        <Panel className="p-5">
          <div className="flex items-center gap-2.5">
            <ListChecks size={15} style={{ color: C.brass }} />
            <Eyebrow rule="2.4, 2.7">Before the first banner moves</Eyebrow>
          </div>
          <p className="mt-3" style={{ color: C.mute, fontSize: 13, lineHeight: 1.7 }}>
            Built from the choices you just made. Tick each as you do it.
          </p>
          <div className="mt-5 space-y-1.5">
            {checklist.map((c) => {
              const on = !!checks[c[0]];
              return (
                <button key={c[0]} onClick={() => setChecks((x) => ({ ...x, [c[0]]: !x[c[0]] }))}
                  className="w-full text-left rounded-sm px-3 py-2.5 flex items-start gap-3"
                  style={{ background: on ? "rgba(121,153,109,0.08)" : C.panel2, border: `1px solid ${on ? "rgba(121,153,109,0.4)" : C.lineSoft}` }}>
                  <span className="flex items-center justify-center" style={{
                    width: 15, height: 15, borderRadius: 3, marginTop: 1, flexShrink: 0,
                    background: on ? C.moss : "transparent", border: `1px solid ${on ? C.moss : C.line}`,
                  }}>{on && <Check size={10} style={{ color: C.ink }} />}</span>
                  <span style={{ color: on ? "#c5cdbd" : C.vellum, fontSize: 13, lineHeight: 1.6, textDecoration: on ? "line-through" : "none" }}>{c[1]}</span>
                </button>
              );
            })}
          </div>
          {!allChecked && <div className="mt-4" style={{ color: C.faint, fontSize: 12, fontStyle: "italic" }}>You can begin without ticking everything.</div>}
        </Panel>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Btn tone="ghost" small disabled={stage === 0} onClick={() => setStage((s) => s - 1)}>Back</Btn>
        {!isTableCheck ? (
          <Btn tone="solid" disabled={!canAdvance} onClick={() => setStage((s) => s + 1)}>
            <span className="flex items-center gap-2">Next <ArrowRight size={13} /></span>
          </Btn>
        ) : (
          <Btn tone="solid" onClick={() => {
            const kingdoms = {};
            order.forEach((id) => {
              kingdoms[id] = {
                side: picked[id], gold: gold[id] || 0, income: KINGDOMS[id].shashka ? 0 : (income[id] || 0),
                revolts: 0, revoltOver10: false, covens: covens[id] || 0, controls: controls[id] || 0, collapsed: false,
                spells: 3, blessings: 1, treasuresHand: 0, treasuresOwned: 0,
                monsters: 0, heroes: 0,
              };
            });
            onBegin({
              name: name || "Campaign in progress", mode, maps, year, season, endYear, endSeason, order,
              turnIndex: 0, step: 0, ashOnly: maps.length === 1 && maps[0] === "Fields of Ash",
              studyPool: studyPoolFor(order.length, season === 2), studyRevealed: null,
              winter: false, kingdoms, log: [],
            });
          }}>
            <span className="flex items-center gap-2"><Play size={14} /> Begin the campaign</span>
          </Btn>
        )}
      </div>
    </div>
  );
}

/* ====================== MODULE 2 · TURN RUNNER ====================== */

const StepShell = ({ n, title, active, done, children, onOpen, tone, rule }) => (
  <div className="rounded-sm mb-2.5" style={{
    background: active ? C.panel : "transparent",
    border: `1px solid ${active ? (tone || C.line) : C.lineSoft}`,
    opacity: !active && !done ? 0.5 : 1,
  }}>
    <button onClick={onOpen} className="w-full flex items-center gap-3 px-4 py-3 text-left">
      <span className="font-mono flex items-center justify-center" style={{
        width: 22, height: 22, borderRadius: 999, fontSize: 11, fontWeight: 700,
        background: done ? C.moss : active ? (tone || C.brass) : "transparent",
        color: done || active ? C.ink : C.mute,
        border: `1px solid ${done ? C.moss : active ? (tone || C.brass) : C.line}`,
      }}>{done ? <Check size={12} /> : n}</span>
      <span className="font-serif flex-1 flex items-baseline gap-2 flex-wrap" style={{ color: active ? C.vellum : C.mute, fontSize: 15 }}>
        <span>{title}</span>
        {rule && <span className="font-mono" style={{ color: C.faint, fontSize: 10.5, fontWeight: 600 }}>{rule}</span>}
      </span>
      {active ? <ChevronDown size={15} style={{ color: C.mute }} /> : <ChevronRight size={15} style={{ color: C.mute }} />}
    </button>
    {active && <div className="px-4 pb-4">{children}</div>}
  </div>
);

const Action = ({ title, note, onDo, doneLabel, tone = "brass", rule, children }) => (
  <div className="rounded-sm px-3.5 py-3 mb-2" style={{ background: C.panel2, border: `1px solid ${C.lineSoft}` }}>
    <div className="flex items-start gap-3 flex-wrap">
      <div className="flex-1" style={{ minWidth: 185 }}>
        <div className="font-serif flex items-baseline gap-2 flex-wrap" style={{ color: C.vellum, fontSize: 14 }}>
          <span>{title}</span>
          {rule && <span className="font-mono" style={{ color: C.faint, fontSize: 10.5, fontWeight: 600 }}>{rule}</span>}
        </div>
        {note && <div style={{ color: C.mute, fontSize: 12.5, lineHeight: 1.6, marginTop: 3 }}>{note}</div>}
      </div>
      {onDo && <Btn small tone={tone} onClick={onDo}>{doneLabel}</Btn>}
    </div>
    {children}
  </div>
);

function TurnRunner({ game, setGame, teach, openCombat }) {
  const adv = game.mode === "advanced";
  const id = game.order[game.turnIndex];
  const K = KINGDOMS[id];
  const k = game.kingdoms[id];
  const [revoltRoll, setRevoltRoll] = useState(null);
  const [covenRoll, setCovenRoll] = useState(null);
  const [covenMods, setCovenMods] = useState({ unocc: false, unfort: false, wild: false });
  const [studied, setStudied] = useState({});
  const [spend, setSpend] = useState(0);

  const lastStep = adv ? 4 : 3;

  const patch = (fields, note) => setGame((g) => {
    const nk = { ...g.kingdoms, [id]: { ...g.kingdoms[id], ...fields } };
    const nl = note ? [{ t: "Y" + g.year + " " + SEASONS[g.season], who: K.name, text: note }].concat(g.log).slice(0, 90) : g.log;
    return { ...g, kingdoms: nk, log: nl };
  });
  const setStep = (s) => setGame((g) => ({ ...g, step: s }));

  const resetTurnLocals = () => {
    setRevoltRoll(null); setCovenRoll(null);
    setCovenMods({ unocc: false, unfort: false, wild: false }); setStudied({}); setSpend(0);
  };

  const nextTurn = () => {
    resetTurnLocals();
    setGame((g) => {
      let ti = g.turnIndex + 1, yr = g.year, se = g.season, guard = 0, winter = false;
      while (ti < g.order.length && g.kingdoms[g.order[ti]].collapsed && guard++ < 10) ti++;
      if (ti >= g.order.length) {
        ti = 0;
        if (se === 2) {
          if (g.mode === "advanced") winter = true;   // winter is played (13.2.2)
          else { se = 0; yr += 1; }                    // basic game skips it (5.1)
        } else se += 1;
        guard = 0;
        while (ti < g.order.length && g.kingdoms[g.order[ti]].collapsed && guard++ < 10) ti++;
        if (ti >= g.order.length) ti = 0;
      }
      return {
        ...g, turnIndex: ti, year: yr, season: se, step: 0, winter,
        studyRevealed: null,
        studyPool: (ti === 0 && !winter) ? studyPoolFor(g.order.length, se === 2) : g.studyPool,
      };
    });
  };

  const finishWinter = () => setGame((g) => ({
    ...g, winter: false, season: 0, year: g.year + 1, turnIndex: 0, step: 0,
    studyPool: studyPoolFor(g.order.length, false), studyRevealed: null,
    log: [{ t: "Y" + g.year + " Winter", who: "—", text: "Winter resolved; a new year begins" }].concat(g.log).slice(0, 90),
  }));

  const overEnd = game.year > game.endYear || (game.year === game.endYear && game.season > game.endSeason);
  const isFinalSeason = game.year === game.endYear && game.season === game.endSeason;
  const owed = k.revolts + (k.revoltOver10 ? 10 : 0);

  const doRevolt = () => {
    const raw = d(6), v = raw + (game.ashOnly ? 2 : 0);
    const n = v === 1 ? 4 : v === 2 ? 3 : v === 3 ? 2 : v <= 5 ? 1 : 0;
    setRevoltRoll({ raw, v, n });
    if (n === 0) { patch({}, "Revolt roll " + raw + (game.ashOnly ? " +2" : "") + " — no revolts"); return; }
    let r = k.revolts + n, over = k.revoltOver10;
    if (r > 9) {
      if (over) { patch({ collapsed: true }, "The Empire collapsed — revolts spilled past the top of the track"); return; }
      over = true; r -= 10;
    }
    patch({ revolts: r, revoltOver10: over }, "Revolt roll " + raw + (game.ashOnly ? " +2" : "") + " → +" + n + " revolt" + (n === 1 ? "" : "s"));
  };

  const covenTarget = 5 - (covenMods.unocc ? 1 : 0) - (covenMods.unfort ? 1 : 0) - (covenMods.wild ? 1 : 0);
  const doCoven = () => {
    const v = d(6), ok = v >= covenTarget;
    setCovenRoll({ v, ok });
    if (ok) patch({ covens: k.covens + 1 }, "Coven planted (rolled " + v + ", needed " + covenTarget + "+)");
  };

  const loot = (city) => {
    const base = K.shashka ? 3 : 2, amt = city ? base * 2 : base;
    patch({ gold: k.gold + amt }, "Looted " + (city ? "a city" : "a settlement") + " for " + amt + " gold");
  };

  const revealStudy = () => setGame((g) => {
    const pool = g.studyPool && g.studyPool.length ? g.studyPool : studyPoolFor(g.order.length, g.season === 2);
    const marker = pool[g.turnIndex % pool.length];
    return { ...g, studyRevealed: marker };
  });

  const blessingsFull = 1;   // one per kingdom controlled; the app tracks one kingdom at a time
  const studyLimit = game.studyRevealed === "glyph" ? 3 : 1;
  const studiedCount = Object.keys(studied).filter((x) => studied[x]).length;

  const doStudy = (kind) => {
    if (studied[kind]) return;
    setStudied((s) => ({ ...s, [kind]: true }));
    if (kind === "spells") patch({ spells: 3 }, "Studied spells — drew back to three");
    if (kind === "blessings") patch({ blessings: blessingsFull }, "Studied blessings — drew back to full strength");
    if (kind === "treasures") {
      if (k.treasuresOwned > 0) patch({ treasuresOwned: k.treasuresOwned - 1, treasuresHand: k.treasuresHand + 1 }, "Studied treasures — retrieved one owned treasure");
      else patch({}, "Studied treasures — none owned to retrieve");
    }
  };

  /* ---------- winter interlude ---------- */
  if (game.winter) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-7">
        <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: `1px solid ${C.line}` }}>
          <Snowflake size={22} style={{ color: C.frost }} />
          <div>
            <Eyebrow tone={C.frost} rule="13.2.2">Year {game.year} · no turns are taken</Eyebrow>
            <h2 className="font-serif mt-1.5" style={{ color: C.vellum, fontSize: 28 }}>Winter</h2>
          </div>
        </div>
        <Coach on={teach}>
          All fighting stops. Nobody takes a turn — this is pure housekeeping, and it resets the magic economy for
          the year ahead. Work down the list, then start spring.
        </Coach>
        <div className="mt-4 space-y-2">
          {[
            ["The silent tide flows", "Put the Autumn Churn marker on the autumn space of the coming year. Collect the other study markers, randomise them, and place one under each kingdom's banner. Extras go to the unused space."],
            ["Drums in the deep", "Take defeated monsters out of their lair hexes, reopening those lairs for exploration, and return them to the right pools. Commanded monsters and abandoned lair markers stay exactly where they are."],
            ["Sell treasures", "Any player holding or owning more than two treasures must sell down to two, at 2 gold each. Endless Satchel lets its owner keep four."],
            ["Shuffle the discards", "Discarded spells and blessings, and every treasure eliminated during the year, go back into their decks."],
            ["A new year", "Move the season marker to spring of the next year."],
          ].map((r, i) => (
            <div key={r[0]} className="rounded-sm px-4 py-3 flex gap-4" style={{ background: C.panel, border: `1px solid ${C.lineSoft}` }}>
              <span className="font-mono" style={{ color: C.brassDim, fontSize: 12, paddingTop: 2 }}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div className="font-serif" style={{ color: C.vellum, fontSize: 14.5 }}>{r[0]}</div>
                <div style={{ color: C.mute, fontSize: 12.5, lineHeight: 1.7, marginTop: 3 }}>{r[1]}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Btn tone="solid" onClick={finishWinter}>
            <span className="flex items-center gap-2">Begin Spring of Year {game.year + 1} <ArrowRight size={13} /></span>
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-7">
      <div className="flex items-end justify-between mb-6 pb-4 flex-wrap gap-3" style={{ borderBottom: `1px solid ${C.line}` }}>
        <div>
          <Eyebrow>Year {game.year} · {SEASONS[game.season]} · turn {game.turnIndex + 1} of {game.order.length}</Eyebrow>
          <div className="flex items-center gap-3 mt-2">
            <span style={{ width: 4, height: 30, background: K.crest }} />
            <h2 className="font-serif" style={{ color: C.vellum, fontSize: 28, letterSpacing: "-0.01em" }}>{K.name}</h2>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <Coins size={15} style={{ color: C.brass }} />
            <span className="font-mono" style={{ color: C.brass, fontSize: 26, fontWeight: 700 }}>{k.gold}</span>
          </div>
          <div style={{ color: C.mute, fontSize: 11 }}>
            {K.shashka ? k.controls + " control marker" + (k.controls === 1 ? "" : "s") : "income " + k.income}
            {K.revolts ? " · " + owed + " revolt" + (owed === 1 ? "" : "s") : ""}
            {K.covens ? " · " + k.covens + " coven" + (k.covens === 1 ? "" : "s") : ""}
          </div>
          {adv && (
            <div style={{ color: C.arcane, fontSize: 11, marginTop: 2 }}>
              {k.spells} spells · {k.blessings} blessings · {k.treasuresHand + k.treasuresOwned} treasures · {k.monsters}/3 monsters
            </div>
          )}
        </div>
      </div>

      {isFinalSeason && !overEnd && (
        <Panel className="mb-5 p-4" style={{ borderColor: C.brassDim }}>
          <div className="flex items-start gap-2.5">
            <Crown size={16} style={{ color: C.brass, marginTop: 2, flexShrink: 0 }} />
            <span style={{ color: C.vellum, fontSize: 14, lineHeight: 1.6 }}>
              This is the final season. The campaign ends once every banner has taken its turn — play it out, then
              score from your campaign book (5.1.2).
            </span>
          </div>
        </Panel>
      )}

      {overEnd && (
        <Panel className="mb-5 p-4" style={{ borderColor: C.brass }}>
          <div className="flex items-center gap-2.5">
            <Crown size={16} style={{ color: C.brass }} />
            <span className="font-serif" style={{ color: C.vellum, fontSize: 15 }}>The campaign has ended. Score victory from your campaign book.</span>
          </div>
        </Panel>
      )}

      {k.collapsed && (
        <Panel className="mb-5 p-4" style={{ borderColor: C.banner, background: "rgba(179,49,47,0.08)" }}>
          <div className="flex items-start gap-2.5">
            <Skull size={16} style={{ color: C.bannerLt, marginTop: 2, flexShrink: 0 }} />
            <span className="font-serif" style={{ color: "#e8b5b1", fontSize: 14.5, lineHeight: 1.6 }}>
              {K.name} has collapsed. Flip its banner, sweep its armies and control markers off the map, and skip its
              turns from here. Razed markers stay put; its loyal settlements turn neutral.
              {adv ? " No study marker goes under its banner, and treasures its player owns stay in play." : ""}
            </span>
          </div>
        </Panel>
      )}

      {/* Step 1 */}
      <StepShell n="1" title="Income actions" rule="6.1" active={game.step === 0} done={game.step > 0} onOpen={() => setStep(0)}>
        <Coach on={teach}>
          This happens before you are paid, and most kingdoms have nothing to do here. Everything below is what
          <em> this</em> kingdom must resolve — nothing is hidden from you.
        </Coach>
        <div className="mt-3">
          <Action title="Disband your siege engine (optional)" rule="9.11.2"
            note="The only moment you may pull a siege engine off the map and back to its playmat, so you can rebuild it somewhere more useful." />

          {K.revolts && (
            <Action title="Roll on the revolt table" rule="12.4.3" onDo={doRevolt} doneLabel={revoltRoll ? "Roll again" : "Roll 1d6"}
              note={game.ashOnly ? "Mandatory. Your campaign uses Fields of Ash alone, so +2 is applied automatically." : "Mandatory, every turn."}>
              {revoltRoll && (
                <div className="mt-3 flex items-center gap-3 rounded-sm px-3 py-2.5" style={{ background: C.ink, border: `1px solid ${C.line}` }}>
                  <Die value={revoltRoll.raw} hit />
                  <div>
                    <div className="font-serif" style={{ color: C.vellum, fontSize: 14 }}>
                      {(REVOLT_TABLE.filter((r) => r.n === revoltRoll.n)[0] || {}).title}
                    </div>
                    <div style={{ color: revoltRoll.n ? C.bannerLt : C.moss, fontSize: 12.5 }}>
                      {game.ashOnly ? "Rolled " + revoltRoll.raw + ", +2 = " + revoltRoll.v + ". " : ""}
                      {revoltRoll.n ? "The Empire suffers " + revoltRoll.n + " revolt" + (revoltRoll.n === 1 ? "" : "s") : "No revolts this season"}
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-3 grid gap-1">
                {REVOLT_TABLE.map((r) => (
                  <div key={r.roll} className="flex gap-3" style={{ fontSize: 11.5, color: C.mute }}>
                    <span className="font-mono" style={{ width: 30, color: C.brassDim }}>{r.roll}</span>
                    <span className="flex-1">{r.title}</span>
                    <span className="font-mono">{r.n === 0 ? "—" : "+" + r.n}</span>
                  </div>
                ))}
              </div>
            </Action>
          )}

          {K.covens && (
            <Action title="Attempt to place a coven" rule="12.3.2" onDo={doCoven} doneLabel="Roll 1d6"
              note="One attempt per turn, into any hostile settlement that does not already hold a coven. Tick the modifiers that apply.">
              <div className="flex flex-wrap gap-2 mt-3">
                {[["unocc", "Unoccupied"], ["unfort", "Unfortified"], ["wild", "Wilderness or beside one"]].map((m) => (
                  <button key={m[0]} onClick={() => setCovenMods((x) => ({ ...x, [m[0]]: !x[m[0]] }))} className="rounded-sm px-2.5 py-1"
                    style={{
                      fontSize: 11.5, fontWeight: 600,
                      background: covenMods[m[0]] ? "rgba(192,154,78,0.15)" : "transparent",
                      border: `1px solid ${covenMods[m[0]] ? C.brass : C.lineSoft}`,
                      color: covenMods[m[0]] ? C.brass : C.mute,
                    }}>+1 {m[1]}</button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <span style={{ color: C.mute, fontSize: 12 }}>Need</span>
                <span className="font-mono" style={{ color: C.brass, fontSize: 17, fontWeight: 700 }}>{covenTarget}+</span>
                {covenRoll && (
                  <>
                    <Die value={covenRoll.v} hit={covenRoll.ok} />
                    <span style={{ color: covenRoll.ok ? C.moss : C.bannerLt, fontSize: 13 }}>
                      {covenRoll.ok ? "Coven planted" : "The cell is discovered — no coven"}
                    </span>
                  </>
                )}
              </div>
              {adv && (
                <div className="mt-2 flex items-start gap-2" style={{ color: C.arcane, fontSize: 11.5 }}>
                  <Info size={12} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>Dominia on the map places covens within 5 hexes of her automatically — skip the roll entirely.</span>
                </div>
              )}
              <Coach on={teach}>
                Covens are the Night's engine. Each pays 1 gold a turn, lets you raise feral armies out in the
                wilderness beside it, and adds a die when you attack the settlement hiding it.
              </Coach>
            </Action>
          )}

          {K.shashka && (
            <Action title="Lay waste to your own settlements (optional)" rule="12.2.2"
              note="Swap any of your control markers for razed markers, looting each as you go. You lose the marker — and a Shashka kingdom with none left collapses.">
              <div className="flex gap-2 mt-3 flex-wrap">
                <Btn small disabled={k.controls < 1} onClick={() => patch({ controls: k.controls - 1, gold: k.gold + 3 }, "Laid waste to a settlement, looted 3 gold")}>Lay waste (+3 gold)</Btn>
                <Btn small disabled={k.controls < 1} onClick={() => patch({ controls: k.controls - 1, gold: k.gold + 6 }, "Laid waste to a city, looted 6 gold")}>Lay waste to a city (+6 gold)</Btn>
              </div>
              <Coach on={teach}>
                The horde's dilemma in one button. Holding ground costs gold every turn; burning it pays once and
                then you must move on. Stop growing and you fall apart.
              </Coach>
            </Action>
          )}

          {!K.revolts && !K.covens && !K.shashka && (
            <div style={{ color: C.mute, fontSize: 13, fontStyle: "italic", padding: "6px 2px" }}>Nothing else for {K.name} here. Move on.</div>
          )}
        </div>
        <div className="mt-3 flex justify-end">
          <Btn onClick={() => setStep(1)}><span className="flex items-center gap-2">Collect income <ArrowRight size={13} /></span></Btn>
        </div>
      </StepShell>

      {/* Step 2 */}
      <StepShell n="2" title="Income" rule="6.2" active={game.step === 1} done={game.step > 1} onOpen={() => setStep(1)}>
        <div className="mt-3">
          {!K.shashka ? (
            <Action title={"Collect " + k.income + " gold"} rule="6.2" doneLabel="Collect"
              onDo={() => patch({ gold: k.gold + k.income }, "Collected " + k.income + " gold")}
              note="Your income is the position of your marker on the income track." />
          ) : (
            <Action title="No income to collect" rule="12.2.1" note="Shashka kingdoms never draw from an income track. Gold comes only from plunder." />
          )}

          {K.covens && k.covens > 0 && (
            <Action title={"Covens pay " + k.covens + " gold"} rule="12.3.3" doneLabel="Collect"
              onDo={() => patch({ gold: k.gold + k.covens }, k.covens + " coven(s) paid " + k.covens + " gold")}
              note={"One gold for each of your " + k.covens + " coven" + (k.covens === 1 ? "" : "s") + " on the map."} />
          )}

          {K.revolts && (
            <Action title={"Pay " + owed + " gold to hold the provinces"} rule="12.4.4" doneLabel="Pay"
              tone={k.gold < owed ? "danger" : "brass"}
              onDo={() => {
                if (k.gold >= owed) { patch({ gold: k.gold - owed }, "Paid " + owed + " gold against revolts"); return; }
                const short = owed - k.gold;
                let r = k.revolts + short, over = k.revoltOver10, dead = false;
                if (r > 9) { if (over) dead = true; else { over = true; r -= 10; if (r > 9) dead = true; } }
                patch({ gold: 0, revolts: dead ? k.revolts : r, revoltOver10: over, collapsed: dead },
                  dead ? "The Empire collapsed — unpaid revolts spilled past the track"
                    : "Short " + short + " gold → +" + short + " revolt" + (short === 1 ? "" : "s"));
              }}
              note="Not optional. If you hold the gold, you must spend it. Every gold you cannot cover becomes another revolt." />
          )}

          {K.shashka && (
            <Action title={"Pay " + k.controls + " gold to feed the horde"} rule="6.2.1" doneLabel="Pay"
              tone={k.gold < k.controls ? "danger" : "brass"}
              onDo={() => {
                if (k.gold >= k.controls) patch({ gold: k.gold - k.controls }, "Paid " + k.controls + " gold for control markers");
                else patch({ collapsed: true }, "Collapsed — could not pay for its control markers");
              }}
              note="One gold for every control marker on the map. Fail to pay and the kingdom collapses on the spot.">
              <Coach on={teach}>
                A Shashka kingdom that has never held a settlement cannot collapse. The moment it takes its first
                one, this clock starts running.
              </Coach>
            </Action>
          )}
        </div>
        <div className="mt-3 flex justify-between">
          <Btn tone="ghost" small onClick={() => setStep(0)}>Back</Btn>
          <Btn onClick={() => setStep(2)}><span className="flex items-center gap-2">Activate <ArrowRight size={13} /></span></Btn>
        </div>
      </StepShell>

      {/* Step 3 */}
      <StepShell n="3" title="Activation" rule="7.0" active={game.step === 2} done={game.step > 2} onOpen={() => setStep(2)}>
        <Coach on={teach} label="The single most missed rule">
          You may build armies <strong>before, between, and after</strong> your activations — not all at the start.
          Most players default to "build everything, then move everything" because that is how other games work, and
          it quietly costs them the game. Move an army, see what opens up, then decide what to build.
        </Coach>

        {adv && (
          <div className="mt-3 rounded-sm px-3.5 py-3" style={{ background: "rgba(155,127,196,0.07)", border: `1px solid rgba(155,127,196,0.3)` }}>
            <div className="flex items-center gap-2 mb-2"><Wand2 size={13} style={{ color: C.arcane }} /><Eyebrow tone={C.arcane} rule="13.2, 14.5.2">First, at the start of the phase</Eyebrow></div>
            <div style={{ color: "#bdb2d4", fontSize: 12.5, lineHeight: 1.7 }}>
              Turn all your locked hero cards upright — they unlock now. Your units and every monster you command
              become ready. Only you may play magic cards this phase; everyone else is limited to cantrips.
            </div>
          </div>
        )}

        <div className="mt-3">
          <Action title="Move and act, one unit at a time" rule="7.2, 7.4"
            note="A unit moves, then takes one action, then it is finished — rotate it 45° so you remember. Once finished it cannot activate again this turn." />
          <div className="mt-4">
            <Eyebrow tone={C.brassDim} rule="10.1, 10.4">Spending gold</Eyebrow>
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <NumInput value={spend} onChange={setSpend} />
              <Btn small disabled={spend < 1 || spend > k.gold}
                onClick={() => { patch({ gold: k.gold - spend }, "Spent " + spend + " gold on builds or recovery"); setSpend(0); }}>
                <span className="flex items-center gap-2"><Coins size={12} /> Spend on builds or recovery</span>
              </Btn>
              {spend > k.gold && <span style={{ color: C.bannerLt, fontSize: 11.5 }}>You only have {k.gold}.</span>}
            </div>
            <div style={{ color: C.faint, fontSize: 11.5, lineHeight: 1.55, marginTop: 4 }}>
              Build costs are printed on the front of each counter, recovery costs on the weakened side.
            </div>
          </div>

          <div className="mt-4">
            <Eyebrow tone={C.brassDim} rule="7.3">Free actions</Eyebrow>
            <div className="grid gap-2 sm:grid-cols-2 mt-2.5">
              <Btn small onClick={() => loot(false)}><span className="flex items-center gap-2"><Coins size={12} /> Looted a settlement (+{K.shashka ? 3 : 2})</span></Btn>
              <Btn small onClick={() => loot(true)}><span className="flex items-center gap-2"><Coins size={12} /> Looted a city (+{K.shashka ? 6 : 4})</span></Btn>
              <Btn small disabled={k.gold < 2} onClick={() => patch({ gold: k.gold - 2 }, "Cleared a razed marker (−2 gold)")}>
                <span className="flex items-center gap-2"><RotateCcw size={12} /> Cleared a razed marker (−2)</span>
              </Btn>
              {K.mines && (
                <Btn small onClick={() => patch({ gold: k.gold + 1 }, "Worked a mine (+1 gold)")}>
                  <span className="flex items-center gap-2"><Pickaxe size={12} /> Worked a mine (+1)</span>
                </Btn>
              )}
              {K.revolts && (
                <Btn small disabled={k.gold < 1 || owed === 0}
                  onClick={() => {
                    let r = k.revolts - 1, over = k.revoltOver10;
                    if (r < 0) { if (over) { r = 9; over = false; } else r = 0; }
                    patch({ gold: k.gold - 1, revolts: r, revoltOver10: over }, "Suppressed a revolt (−1 gold)");
                  }}>
                  <span className="flex items-center gap-2"><Shield size={12} /> Suppress a revolt (−1)</span>
                </Btn>
              )}
              <Btn small disabled={k.gold < 2} onClick={() => patch({ gold: k.gold - 2 }, "Sent an ally gold (spent 2, they gain 1)")}>
                <span className="flex items-center gap-2"><ArrowRight size={12} /> Send an ally gold (2 for 1)</span>
              </Btn>
              <Btn small tone="solid" onClick={openCombat}>
                <span className="flex items-center gap-2"><Swords size={12} /> Resolve a combat</span>
              </Btn>
            </div>
            <div style={{ color: C.faint, fontSize: 11.5, lineHeight: 1.55, marginTop: 4 }}>
              Clearing a razed marker turns the hex back into a settlement — place a control marker below and take
              the income with it (4.10.2).
            </div>
          </div>

          <div className="mt-4">
            <Eyebrow tone={C.brassDim} rule="4.9.5">Control and income</Eyebrow>
            <div className="grid gap-2 sm:grid-cols-2 mt-2.5">
              <Btn small onClick={() => patch({ controls: k.controls + 1, income: K.shashka ? 0 : k.income + 1 }, "Placed a control marker" + (K.shashka ? "" : " (+1 income)"))}>
                <span className="flex items-center gap-2"><Landmark size={12} /> Placed a control marker</span>
              </Btn>
              <Btn small tone="danger" onClick={() => patch({ controls: Math.max(0, k.controls - 1), income: K.shashka ? 0 : Math.max(0, k.income - 1) }, "Lost a control marker" + (K.shashka ? "" : " (−1 income)"))}>
                <span className="flex items-center gap-2"><Flame size={12} /> Lost a control marker</span>
              </Btn>
              {!K.shashka && (
                <>
                  <Btn small onClick={() => patch({ income: k.income + 1 }, "An enemy marker came off a loyal settlement (+1 income)")}>
                    <span className="flex items-center gap-2"><Landmark size={12} /> Freed a loyal settlement (+1)</span>
                  </Btn>
                  <Btn small tone="danger" onClick={() => patch({ income: Math.max(0, k.income - 1) }, "A loyal settlement was razed or taken (−1 income)")}>
                    <span className="flex items-center gap-2"><Flame size={12} /> Lost a loyal settlement (−1)</span>
                  </Btn>
                </>
              )}
            </div>
            {!K.shashka && (
              <div style={{ color: C.faint, fontSize: 11.5, lineHeight: 1.55, marginTop: 4 }}>
                The lower pair is for settlements printed with your own crest: income rises when an enemy control or
                razed marker comes off one, and falls when one is razed or taken.
              </div>
            )}
          </div>

          {adv && (
            <div className="mt-4">
              <Eyebrow tone={C.arcane} rule="13.1">Magic, heroes and monsters</Eyebrow>
              <div className="grid gap-2 sm:grid-cols-2 mt-2.5">
                <Btn small tone="arcane" disabled={k.spells < 1} onClick={() => patch({ spells: k.spells - 1 }, "Cast a spell")}>
                  <span className="flex items-center gap-2"><Sparkles size={12} /> Cast a spell ({k.spells} in hand)</span>
                </Btn>
                <Btn small tone="arcane" disabled={k.blessings < 1} onClick={() => patch({ blessings: k.blessings - 1 }, "Played a blessing")}>
                  <span className="flex items-center gap-2"><Scroll size={12} /> Play a blessing ({k.blessings})</span>
                </Btn>
                <Btn small tone="arcane" disabled={k.treasuresHand < 1} onClick={() => patch({ treasuresHand: k.treasuresHand - 1, treasuresOwned: k.treasuresOwned + 1 }, "Played a treasure — it is now owned")}>
                  <span className="flex items-center gap-2"><Gem size={12} /> Play a treasure ({k.treasuresHand} in hand)</span>
                </Btn>
                <Btn small tone="arcane" disabled={k.treasuresHand + k.treasuresOwned < 1}
                  onClick={() => {
                    if (k.treasuresHand > 0) patch({ treasuresHand: k.treasuresHand - 1, gold: k.gold + 2 }, "Sold a treasure (+2 gold)");
                    else patch({ treasuresOwned: k.treasuresOwned - 1, gold: k.gold + 2 }, "Sold an owned treasure (+2 gold)");
                  }}>
                  <span className="flex items-center gap-2"><Coins size={12} /> Sell a treasure (+2)</span>
                </Btn>
                <Btn small tone="arcane" onClick={() => patch({ treasuresHand: k.treasuresHand + 1 }, "Drew a treasure — monster reward")}>
                  <span className="flex items-center gap-2"><Gem size={12} /> Won a treasure from a monster</span>
                </Btn>
                <Btn small tone="arcane" disabled={k.monsters >= 3} onClick={() => patch({ monsters: k.monsters + 1 }, "Took command of a monster")}>
                  <span className="flex items-center gap-2"><Eye size={12} /> Command a monster ({k.monsters}/3)</span>
                </Btn>
                <Btn small tone="arcane" disabled={k.monsters < 1} onClick={() => patch({ monsters: k.monsters - 1 }, "A monster was defeated or slunk away")}>
                  <span className="flex items-center gap-2"><Eye size={12} /> Lose a commanded monster</span>
                </Btn>
                <Btn small tone="arcane" onClick={() => patch({ heroes: k.heroes + 1 }, "Built or gained a hero")}>
                  <span className="flex items-center gap-2"><Crown size={12} /> Hero enters play ({k.heroes})</span>
                </Btn>
              </div>
              <Coach on={teach} label="Commanded monsters">
                Each monster you command may do one thing on your turn: strike a target in range, slink away back to
                the pool to free up a command marker, or pass. They never move, stack, or advance — and you can
                never attack the ones you command.
              </Coach>
            </div>
          )}

          <Coach on={teach} label={adv ? "Stacking, in the advanced game" : "Stacking, in the basic game"}>
            {adv
              ? "One army and one hero of the same kingdom may share a hex. They move at the speed of the slower, fight as one, and advance together or not at all. A hit on the stack can be assigned to either — losing the hero is often the cheaper choice."
              : "One army per hex. You may pass through a friendly hex but not stop in it. Two ready friendly units may swap places: move into the hex, and the unit already there must activate next and leave."}
          </Coach>
        </div>
        <div className="mt-4 flex justify-between">
          <Btn tone="ghost" small onClick={() => setStep(1)}>Back</Btn>
          <Btn onClick={() => setStep(3)}><span className="flex items-center gap-2">End the turn <ArrowRight size={13} /></span></Btn>
        </div>
      </StepShell>

      {/* Step 4 */}
      <StepShell n="4" title="Check for collapse" rule="7.6, 7.7" active={game.step === 3} done={game.step > 3} onOpen={() => setStep(3)}>
        <div className="mt-3">
          {K.shashka ? (
            <Action title="Do you still hold a control marker?" rule="7.7"
              note="A Shashka kingdom with nothing left on the map at the end of its activation collapses — unless it has never controlled a settlement at all." />
          ) : (
            <Action title="Are all your cities razed or enemy-held?" rule="7.6"
              note={
                id === "empire" ? "The Empire only falls this way if both of its cities are in play."
                  : id === "oathborn" ? "The Oathborn only falls this way if all three of its cities are in play."
                    : "If every one of your cities is razed or under an enemy control marker, the kingdom collapses."
              } />
          )}
          <div className="flex gap-2 mt-1">
            <Btn small tone="danger" onClick={() => patch({ collapsed: true }, "Kingdom collapsed")}>Yes — it collapses</Btn>
            <Btn small tone="ghost" onClick={() => patch({}, "Checked for collapse — the kingdom holds")}>No, it holds</Btn>
          </div>
          {adv && (
            <Action title="Return eliminated heroes" rule="14.4"
              note="At the end of every turn, all players shuffle their eliminated heroes face down back in with any unbuilt ones on the playmat." />
          )}
          <Coach on={teach}>
            A collapsed kingdom is out for good. If a player was running it alongside another kingdom, they simply
            carry on with that one — or take over a kingdom from a player running two.
          </Coach>
        </div>
        <div className="mt-4 flex justify-between">
          <Btn tone="ghost" small onClick={() => setStep(2)}>Back</Btn>
          {adv ? (
            <Btn tone="arcane" onClick={() => setStep(4)}><span className="flex items-center gap-2">Arcane study <ArrowRight size={13} /></span></Btn>
          ) : (
            <Btn tone="solid" onClick={nextTurn}>
              <span className="flex items-center gap-2">
                {game.turnIndex + 1 >= game.order.length ? "Begin " + SEASONS[(game.season + 1) % 3] : "Pass to " + KINGDOMS[game.order[game.turnIndex + 1]].name}
                <ArrowRight size={13} />
              </span>
            </Btn>
          )}
        </div>
      </StepShell>

      {/* Step 5 · arcane study, advanced only */}
      {adv && (
        <StepShell n="5" title="Arcane study" rule="17.3" active={game.step === 4} done={false} onOpen={() => setStep(4)} tone={C.arcane}>
          <Coach on={teach}>
            Every player takes part in this, not just the kingdom whose turn it was. Flip the study marker sitting
            under this banner: a glyph means the tide ran strong and everyone studies three different disciplines;
            a churn means it was choppy and everyone studies just one.
          </Coach>

          <div className="mt-3">
            {!game.studyRevealed ? (
              <Action title="Flip this turn's study marker" rule="17.1.2" onDo={revealStudy} doneLabel="Reveal" tone="arcane"
                note="The marker was placed face down under the banner during setup or at the start of the season." />
            ) : (
              <>
                <div className="rounded-sm px-4 py-4 mb-3 flex items-center gap-4"
                  style={{ background: "rgba(155,127,196,0.08)", border: `1px solid rgba(155,127,196,0.4)` }}>
                  <div className="flex items-center justify-center" style={{
                    width: 48, height: 48, borderRadius: 999,
                    border: `2px solid ${game.studyRevealed === "glyph" ? C.brass : C.frost}`,
                    color: game.studyRevealed === "glyph" ? C.brass : C.frost,
                  }}>
                    {game.studyRevealed === "glyph" ? <Sparkles size={20} /> : <RotateCcw size={20} />}
                  </div>
                  <div>
                    <div className="font-serif" style={{ color: C.vellum, fontSize: 18 }}>
                      {game.studyRevealed === "glyph" ? "A glyph" : "Churn"}
                    </div>
                    <div style={{ color: C.mute, fontSize: 12.5, lineHeight: 1.6, marginTop: 2 }}>
                      {game.studyRevealed === "glyph"
                        ? "The wizards of Kalar drew power cleanly. Every player studies three different disciplines."
                        : "The silent tide is disordered. Every player studies one discipline only."}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <Eyebrow tone={C.arcane} rule="17.4">Choose {studyLimit === 3 ? "up to three, none twice" : "one"}</Eyebrow>
                  <span className="font-mono" style={{ color: C.mute, fontSize: 12 }}>{studiedCount} / {studyLimit}</span>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    ["spells", "Study spells", "Draw back up to three. You may discard one first.", Sparkles],
                    ["blessings", "Study blessings", "Draw back to one per kingdom you control. You may discard one first.", Scroll],
                    ["treasures", "Study treasures", "Retrieve one treasure you own back into hand. Nothing owned, nothing to study.", Gem],
                  ].map((disc) => {
                    const DIcon = disc[3];
                    const done = !!studied[disc[0]];
                    const blocked = !done && studiedCount >= studyLimit;
                    return (
                      <button key={disc[0]} disabled={done || blocked} onClick={() => doStudy(disc[0])}
                        className="rounded-sm px-3.5 py-3 text-left"
                        style={{
                          background: done ? "rgba(121,153,109,0.1)" : C.panel2,
                          border: `1px solid ${done ? "rgba(121,153,109,0.45)" : blocked ? C.lineSoft : "rgba(155,127,196,0.35)"}`,
                          opacity: blocked ? 0.45 : 1,
                          cursor: done || blocked ? "default" : "pointer",
                        }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          {done ? <Check size={13} style={{ color: C.moss }} /> : <DIcon size={13} style={{ color: C.arcane }} />}
                          <span className="font-serif" style={{ color: C.vellum, fontSize: 13.5 }}>{disc[1]}</span>
                        </div>
                        <div style={{ color: C.mute, fontSize: 11.5, lineHeight: 1.55 }}>{disc[2]}</div>
                      </button>
                    );
                  })}
                </div>

                <Coach on={teach} label="Don't forget the others">
                  Everyone at the table studies now, including players whose turn it is not. The buttons above only
                  move {K.name}'s counters — remind the rest of the table to draw.
                </Coach>
              </>
            )}
          </div>

          <div className="mt-4 flex justify-between">
            <Btn tone="ghost" small onClick={() => setStep(3)}>Back</Btn>
            <Btn tone="solid" onClick={nextTurn}>
              <span className="flex items-center gap-2">
                {game.turnIndex + 1 >= game.order.length
                  ? (game.season === 2 ? "Enter Winter" : "Begin " + SEASONS[(game.season + 1) % 3])
                  : "Pass to " + KINGDOMS[game.order[game.turnIndex + 1]].name}
                <ArrowRight size={13} />
              </span>
            </Btn>
          </div>
        </StepShell>
      )}

      {game.log.length > 0 && (
        <div className="mt-8">
          <Eyebrow>Campaign ledger</Eyebrow>
          <div className="mt-3 space-y-1">
            {game.log.slice(0, 14).map((l, i) => (
              <div key={i} className="flex gap-3" style={{ fontSize: 12, color: C.mute }}>
                <span className="font-mono" style={{ color: C.brassDim, width: 78, flexShrink: 0 }}>{l.t}</span>
                <span style={{ color: "#7c869c", width: 130, flexShrink: 0 }}>{l.who}</span>
                <span>{l.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================= MODULE 3 · COMBAT ======================== */

const NumStep = ({ label, value, set, max = 12, heavy }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="flex items-center gap-2" style={{ color: C.mute, fontSize: 12.5 }}>
      {heavy !== undefined && (
        <span style={{
          width: 11, height: 11, background: heavy ? "#0e0e11" : "#ece7da",
          border: heavy ? "none" : "1px solid #b9b2a1", borderRadius: heavy ? 0 : 2,
          clipPath: heavy ? OCT : undefined,
        }} />
      )}
      {label}
    </span>
    <div className="flex items-center gap-1.5">
      <button onClick={() => set(Math.max(0, value - 1))} className="rounded-sm px-1.5" style={{ border: `1px solid ${C.lineSoft}`, color: C.mute }}><Minus size={11} /></button>
      <span className="font-mono text-center" style={{ color: C.vellum, fontSize: 16, minWidth: 24, fontWeight: 700 }}>{value}</span>
      <button onClick={() => set(Math.min(max, value + 1))} className="rounded-sm px-1.5" style={{ border: `1px solid ${C.lineSoft}`, color: C.mute }}><Plus size={11} /></button>
    </div>
  </div>
);

const DiceNote = ({ children }) => (
  <div className="flex items-start gap-2 mt-3 rounded-sm px-2.5 py-2"
    style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.lineSoft}` }}>
    <Info size={12} style={{ color: C.brassDim, marginTop: 2, flexShrink: 0 }} />
    <div style={{ color: C.faint, fontSize: 11.5, lineHeight: 1.6 }}>{children}</div>
  </div>
);

const Toggle = ({ on, set, label, note }) => (
  <button onClick={() => set(!on)} className="w-full text-left rounded-sm px-3 py-2 mb-1.5"
    style={{ background: on ? "rgba(192,154,78,0.1)" : "transparent", border: `1px solid ${on ? C.brass : C.lineSoft}` }}>
    <div className="flex items-center gap-2.5">
      <span style={{ width: 13, height: 13, borderRadius: 2, flexShrink: 0, background: on ? C.brass : "transparent", border: `1px solid ${on ? C.brass : C.line}` }} />
      <span style={{ color: on ? C.vellum : C.mute, fontSize: 13 }}>{label}</span>
    </div>
    {note && <div style={{ color: "#69738a", fontSize: 11.5, marginLeft: 23, marginTop: 2 }}>{note}</div>}
  </button>
);

const BATTLE_MAGIC_STEPS = [
  ["Attacker plays cards or hero powers", "Anything goes — spells, blessings, treasures, powers. Allies may answer with cantrips only."],
  ["Defender plays cantrips only", "Nothing else. Their allies may also play cantrips here."],
  ["Attacker plays cantrips only", "Last word before the dice. Nothing but cantrips — Negation and its kin cannot reach this far."],
];

function Combat({ teach, mode, onBack }) {
  const adv = mode === "advanced";
  const [aL, setAL] = useState(0), [aH, setAH] = useState(0);
  const [aRanged, setARanged] = useState(false), [aStealth, setAStealth] = useState(false);
  const [dL, setDL] = useState(0), [dH, setDH] = useState(0);
  const [dRanged, setDRanged] = useState(false), [dStealth, setDStealth] = useState(false);
  const [garrison, setGarrison] = useState("none");
  const [river, setRiver] = useState("none");
  const [fort, setFort] = useState("none");
  const [siege, setSiege] = useState(0);
  const [monster, setMonster] = useState(false);
  const [bmStep, setBmStep] = useState(0);
  const [result, setResult] = useState(null);

  const fortRaw = fort === "fort" ? 1 : fort === "magic" ? 2 : 0;
  const fortEff = monster ? 0 : Math.max(0, fortRaw - siege);
  const attackerThreshold = 5 + fortEff;
  const garrisonDice = monster ? 0 : garrison === "city" ? 3 : garrison === "settlement" ? 1 : 0;
  const riverDice = monster ? 0 : river === "major" ? 2 : river === "river" ? 1 : 0;
  const defTotalL = dL + garrisonDice + riverDice;

  const ambushBlocked = aStealth && fort !== "none" && !monster;
  const bothStealth = aStealth && dStealth;
  const canAmbush = (aStealth && !ambushBlocked && !bothStealth) || (dStealth && !bothStealth);
  const bmReady = !adv || bmStep >= BATTLE_MAGIC_STEPS.length;
  const attackerEmpty = aL + aH === 0;
  const canRoll = bmReady && !attackerEmpty;

  const clear = () => { setResult(null); setBmStep(0); };

  const resolveNormal = () => {
    const a = rollPool({ light: aL, heavy: aH, threshold: attackerThreshold, confirmCrits: true });
    const dfd = rollPool({ light: defTotalL, heavy: dH, threshold: 5, confirmCrits: true });
    let winner = null, hits = 0, note = "";
    if (a.successes > dfd.successes) { winner = "attacker"; hits = a.successes - dfd.successes; }
    else if (dfd.successes > a.successes) { winner = "defender"; hits = dfd.successes - a.successes; }
    else if (a.successes === 0) note = "A draw — neither side rolled a success. Nothing happens.";
    else if (aRanged && !dRanged) { winner = "attacker"; hits = 1; note = "Tied, but the attacker has Ranged and wins ties."; }
    else if (dRanged && !aRanged) { winner = "defender"; hits = 1; note = "Tied, but the defender has Ranged and wins ties."; }
    else note = (aRanged && dRanged) ? "Tied. Both sides have Ranged, so neither wins the tie." : "Tied. No hits.";
    setResult({ mode: "normal", a, d: dfd, winner, hits, note });
  };

  const resolveAmbush = () => {
    const first = aStealth ? "attacker" : "defender";
    const bonus = (rolls) => rolls.reduce((n, r) => n + (r.confirms ? r.confirms.filter((c) => c.hit).length : 0), 0);
    /* Strikes ignore terrain (9.7), so no river or in-hex dice — but a garrison is not terrain,
       so an unoccupied settlement still answers with it. A strike back also ignores the
       fortification modifier (4.4), which is why both pools roll at a flat 5+. */
    const defPool = { light: dL + garrisonDice, heavy: dH, threshold: 5, confirmCrits: true };
    const atkPool = { light: aL, heavy: aH, threshold: 5, confirmCrits: true };
    const open = rollPool(first === "attacker" ? atkPool : defPool);
    const openHits = open.successes > 0 ? 1 + bonus(open.rolls) : 0;
    const back = rollPool(first === "attacker" ? defPool : atkPool);
    const backHits = back.successes > 0 ? 1 + bonus(back.rolls) : 0;
    setResult({ mode: "ambush", first, open, openHits, back, backHits });
  };

  return (
    <div className="max-w-4xl mx-auto px-5 py-7">
      <div className="flex items-center justify-between mb-6 pb-4 flex-wrap gap-3" style={{ borderBottom: `1px solid ${C.line}` }}>
        <div>
          <Eyebrow>Module three · rule {adv ? "16.8" : "9"}</Eyebrow>
          <h2 className="font-serif mt-1.5" style={{ color: C.vellum, fontSize: 28 }}>Resolve a combat</h2>
        </div>
        <Btn tone="ghost" small onClick={onBack}>Back to the turn</Btn>
      </div>

      <Coach on={teach} label="How a fight works">
        Both sides roll everything at once and count results of 5 or better. Whoever rolls more successes wins, and
        the loser takes hits equal to the <em>difference</em>. A full-strength army flips to weakened on a hit; a
        weakened one is destroyed; a fragile one is destroyed by the first hit it takes (3.2.2). Two different
        kinds of adjustment are in play: terrain hands the
        defender <strong style={{ color: C.vellum }}>extra dice</strong>, while a fortification is a
        <strong style={{ color: C.vellum }}> roll modifier</strong> that makes the attacker's dice harder to hit with.
      </Coach>

      {adv && (
        <Panel className="mt-5 p-4" style={{ borderColor: "rgba(155,127,196,0.35)" }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2"><Wand2 size={14} style={{ color: C.arcane }} /><Eyebrow tone={C.arcane} rule="16.7.3">Battle magic · walk it in order</Eyebrow></div>
            {bmStep > 0 && <Btn small tone="ghost" onClick={() => setBmStep(0)}>Restart</Btn>}
          </div>
          <div className="mt-3 space-y-1.5">
            {BATTLE_MAGIC_STEPS.map((s, i) => {
              const done = bmStep > i, active = bmStep === i;
              return (
                <div key={s[0]} className="rounded-sm px-3.5 py-2.5 flex items-start gap-3"
                  style={{
                    background: active ? "rgba(155,127,196,0.1)" : done ? "rgba(121,153,109,0.07)" : "transparent",
                    border: `1px solid ${active ? "rgba(155,127,196,0.45)" : done ? "rgba(121,153,109,0.3)" : C.lineSoft}`,
                    opacity: !active && !done ? 0.55 : 1,
                  }}>
                  <span className="font-mono flex items-center justify-center" style={{
                    width: 19, height: 19, borderRadius: 999, fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1,
                    background: done ? C.moss : active ? C.arcane : "transparent",
                    color: done || active ? C.ink : C.mute,
                    border: `1px solid ${done ? C.moss : active ? C.arcane : C.line}`,
                  }}>{done ? <Check size={10} /> : String.fromCharCode(97 + i)}</span>
                  <div className="flex-1">
                    <div style={{ color: active || done ? C.vellum : C.mute, fontSize: 13 }}>{s[0]}</div>
                    {active && <div style={{ color: "#bdb2d4", fontSize: 11.5, lineHeight: 1.6, marginTop: 2 }}>{s[1]}</div>}
                  </div>
                  {active && <Btn small tone="arcane" onClick={() => setBmStep(i + 1)}>Done</Btn>}
                </div>
              );
            })}
          </div>
          {bmReady && (
            <div className="mt-3 flex items-center gap-2" style={{ color: C.moss, fontSize: 12.5 }}>
              <Check size={13} /> <span>Battle magic closed. Declare an ambush if you have one, then roll.</span>
            </div>
          )}
          <Coach on={teach}>
            The ordering is the whole point. A cantrip the attacker plays in step c is the last word — Negation,
            Banished to Meji and Undertow all arrive too late to touch it. After the dice land, the restriction
            lifts and everyone plays normally again, which is when Tidal Shelter and Cure Wounds come out.
          </Coach>
        </Panel>
      )}

      {adv && (
        <Panel className="mt-4 p-4">
          <Toggle on={monster} set={setMonster} label="The defender is a monster or an unexplored lair"
            note="Terrain, garrison and fortification are all ignored. One hit defeats it — and wins you its gold plus a treasure card · 15.1, 15.2, 15.6" />
          {monster && (
            <div style={{ color: C.mute, fontSize: 12.5, lineHeight: 1.7 }}>
              Attacking an unexplored lair draws a monster at random into the hex first, and that monster defends.
              Beat it and the lair becomes explored and safe. Survive its counter and it stays in play under an
              opponent's command. Defeating a monster never lets you advance.
            </div>
          )}
        </Panel>
      )}

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Panel className="p-4">
          <div className="flex items-center gap-2 mb-3"><Swords size={14} style={{ color: C.banner }} /><Eyebrow tone={C.banner} rule="9.1.1">Attacker</Eyebrow></div>
          <NumStep label="Light dice (d6)" value={aL} set={setAL} heavy={false} />
          <NumStep label="Heavy dice (d8)" value={aH} set={setAH} heavy={true} />
          <DiceNote>
            Fold everything into those numbers. Your kingdom's rules can grant dice for the terrain you are
            attacking <em>into</em> — a Fjordland ranger attacking into forest gains a light die (9.4.1).
            {adv ? " Hero powers and any cards you have played go in here too (14.5, 16.6)." : ""} Check the information card.
          </DiceNote>

          <div className="mt-3">
            <Toggle on={aRanged} set={setARanged} label="Ranged" note="Wins tied combats · 3.1.1" />
            <Toggle on={aStealth} set={setAStealth} label="Stealth" note="May declare an ambush · 3.1.2" />
          </div>

          {!monster && (
            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.lineSoft}` }}>
              <Eyebrow tone={C.brassDim} rule="9.11.1">Siege support</Eyebrow>
              <div className="mt-1.5">
                <NumStep label="Friendly siege engines adjacent" value={siege} set={setSiege} max={3} />
              </div>
              {fort !== "none" && (
                <div style={{ color: siege > 0 ? C.moss : C.faint, fontSize: 11.5, lineHeight: 1.55, marginTop: 2 }}>
                  {siege === 0
                    ? "No siege support — the fortification bites at full strength."
                    : fortEff === 0
                      ? "The fortification is fully negated."
                      : "Fortification cut to −" + fortEff + "."}
                </div>
              )}
              <Coach on={teach}>
                A siege engine parked next to a fortification cancels one −1 for itself and for every friendly and
                allied army attacking that hex. Two allied engines wipe out a magical fortification's −2 entirely.
                A third does nothing at all.
              </Coach>
            </div>
          )}
        </Panel>

        <Panel className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} style={{ color: C.frost }} />
            <Eyebrow tone={C.frost} rule={monster ? "15.2" : "9.1.1"}>{monster ? "Monster" : "Defender"}</Eyebrow>
          </div>
          <NumStep label="Light dice (d6)" value={dL} set={setDL} heavy={false} />
          <NumStep label="Heavy dice (d8)" value={dH} set={setDH} heavy={true} />
          <DiceNote>
            Fold everything into those numbers: terrain dice for this hex from the Terrain Effects Chart on your
            player aid, plus anything your kingdom's rules grant here (9.4.1).
            {adv ? " Hero powers and any cards you have played go in here too (14.5, 16.6)." : ""}
            {monster ? "" : " Garrison and river dice are added for you below."}
          </DiceNote>

          <div className="mt-3">
            <Toggle on={dRanged} set={setDRanged} label="Ranged" note="Wins tied combats · 3.1.1" />
            <Toggle on={dStealth} set={setDStealth} label="Stealth" note="May declare an ambush, fortified or not · 3.1.2, 4.4" />
          </div>

          {monster ? (
            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.lineSoft}`, color: C.faint, fontSize: 12, lineHeight: 1.6, fontStyle: "italic" }}>
              Terrain, garrison and fortification never apply to a monster (15.2).
            </div>
          ) : (
            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.lineSoft}` }}>
              <Eyebrow tone={C.brassDim} rule="9.5">Garrison</Eyebrow>
              <div className="mt-1.5">
                <Pills value={garrison} onChange={setGarrison} options={[
                  ["none", "None"],
                  ["settlement", <span>Unoccupied +1<LightPip /></span>],
                  ["city", <span>City +3<LightPip /></span>],
                ]} />
              </div>
              <div style={{ color: C.faint, fontSize: 11.5, lineHeight: 1.55, marginTop: 4 }}>
                A settlement with an army standing in it has no garrison — pick None. A city keeps its three dice
                whether it is occupied or not (9.5.1, 9.5.2).
              </div>

              <div className="mt-3.5"><Eyebrow tone={C.brassDim} rule="8.1.2">Attacked across</Eyebrow></div>
              <div className="mt-1.5">
                <Pills value={river} onChange={setRiver} options={[
                  ["none", "Open"],
                  ["river", <span>River +1<LightPip /></span>],
                  ["major", <span>Major river +2<LightPip /></span>],
                ]} />
              </div>

              <div className="mt-3.5"><Eyebrow tone={C.brassDim} rule="4.4">Fortification</Eyebrow></div>
              <div className="mt-1.5">
                <Pills options={[["none", "Open"], ["fort", "Fortified −1"], ["magic", "Magically −2"]]} value={fort} onChange={setFort} />
              </div>
              <div style={{ color: C.faint, fontSize: 11.5, lineHeight: 1.55, marginTop: 4 }}>
                No die pip on these — a fortification is a roll modifier, not dice. It makes the attacker's dice
                harder to hit with rather than giving you more of them.
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* Roll bar — the numbers you actually need live right beside the button */}
      <Panel className="mt-4 p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Btn tone="solid" disabled={!canRoll} onClick={resolveNormal}>
              <span className="flex items-center gap-2"><Dices size={14} /> Roll the combat</span>
            </Btn>
            {canAmbush && (
              <Btn tone="danger" disabled={!canRoll} onClick={resolveAmbush}>
                <span className="flex items-center gap-2"><Sparkles size={14} /> Declare an ambush</span>
              </Btn>
            )}
            {result && <Btn tone="ghost" small onClick={clear}><span className="flex items-center gap-1.5"><X size={12} /> Clear</span></Btn>}
          </div>

          <div className="flex items-center gap-4 sm:ml-auto">
            <div>
              <Eyebrow tone={C.banner} rule="1.10">Attacker needs</Eyebrow>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono" style={{ color: attackerThreshold > 6 ? C.bannerLt : C.vellum, fontSize: 21, fontWeight: 700 }}>{attackerThreshold}+</span>
                <span style={{ color: C.faint, fontSize: 11.5, whiteSpace: "nowrap" }}>{aL} light, {aH} heavy</span>
              </div>
            </div>
            <div style={{ width: 1, height: 34, background: C.line }} />
            <div>
              <Eyebrow tone={C.frost} rule="1.10">{monster ? "Monster needs" : "Defender needs"}</Eyebrow>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono" style={{ color: C.vellum, fontSize: 21, fontWeight: 700 }}>5+</span>
                <span style={{ color: C.faint, fontSize: 11.5, whiteSpace: "nowrap" }}>{defTotalL} light, {dH} heavy</span>
              </div>
            </div>
          </div>
        </div>

        {(attackerEmpty || attackerThreshold > 6 || !bmReady || ambushBlocked || bothStealth) && (
          <div className="mt-4 pt-3 space-y-1.5" style={{ borderTop: `1px solid ${C.lineSoft}` }}>
            {attackerEmpty && (
              <div className="flex items-start gap-2" style={{ color: C.mute, fontSize: 12.5 }}>
                <Info size={13} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>Give the attacker some dice first — read its combat rating off the counter, white squares are light, black diamonds heavy.</span>
              </div>
            )}
            {attackerThreshold > 6 && (
              <div className="flex items-start gap-2" style={{ color: C.bannerLt, fontSize: 12.5 }}>
                <AlertTriangle size={13} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>Light dice cannot reach 7 — only heavy dice can hurt this place. Bring siege engines.</span>
              </div>
            )}
            {!bmReady && (
              <div className="flex items-start gap-2" style={{ color: C.arcane, fontSize: 12.5 }}>
                <Wand2 size={13} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>Walk battle magic first — the dice are locked until you do.</span>
              </div>
            )}
            {ambushBlocked && (
              <div className="flex items-start gap-2" style={{ color: C.mute, fontSize: 12.5 }}>
                <Info size={13} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>An attacker with Stealth cannot ambush a fortified settlement.</span>
              </div>
            )}
            {bothStealth && (
              <div className="flex items-start gap-2" style={{ color: C.mute, fontSize: 12.5 }}>
                <Info size={13} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>Both sides have Stealth — no ambush is possible. Roll it straight.</span>
              </div>
            )}
          </div>
        )}
      </Panel>

      {result && (
        <Panel className="mt-5 p-5">
          {result.mode === "normal" ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <DiceRow rolls={result.a.rolls} title={"Attacker · " + result.a.successes + " success" + (result.a.successes === 1 ? "" : "es")} tone={C.banner} />
                <DiceRow rolls={result.d.rolls} title={(monster ? "Monster · " : "Defender · ") + result.d.successes + " success" + (result.d.successes === 1 ? "" : "es")} tone={C.frost} />
              </div>
              <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
                {result.winner ? (
                  <>
                    <div className="font-serif" style={{ color: C.vellum, fontSize: 20 }}>
                      The {result.winner === "defender" && monster ? "monster" : result.winner} wins — {result.hits} hit{result.hits === 1 ? "" : "s"}
                    </div>
                    <div style={{ color: C.mute, fontSize: 13, marginTop: 6, lineHeight: 1.7 }}>
                      {result.note ? result.note + " " : ""}
                      {monster
                        ? (result.winner === "attacker"
                          ? "One hit defeats the monster. Take the gold printed on its counter, plus a treasure card if it was guarding a lair — a wandering monster pays gold only (15.6, 15.7). Either way you may not advance into its hex."
                          : "The monster survives and stays in play under an opponent's command. It will be able to strike back on their turn.")
                        : (result.winner === "attacker"
                          ? "If the defending hex is left empty, the attacker may advance into it — and must advance if the hex holds a settlement."
                          : "The attacker stays put.")}
                    </div>
                  </>
                ) : <div className="font-serif" style={{ color: C.mute, fontSize: 18 }}>{result.note}</div>}
                {adv && (
                  <div className="mt-3 flex items-start gap-2" style={{ color: C.arcane, fontSize: 12 }}>
                    <Info size={12} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>Battle magic is over — cards flow normally again. This is the window for Tidal Shelter, Cure Wounds and Ray of Weakness.</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <Eyebrow tone={C.banner}>Opening strike · the {result.first} has Stealth</Eyebrow>
                <div className="mt-2"><DiceRow rolls={result.open.rolls} title={result.openHits + " hit" + (result.openHits === 1 ? "" : "s") + " inflicted"} tone={C.brassDim} /></div>
              </div>
              <div className="pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
                <Eyebrow tone={C.frost}>Strike back · only if the target survived</Eyebrow>
                <div className="mt-2"><DiceRow rolls={result.back.rolls} title={result.backHits + " hit" + (result.backHits === 1 ? "" : "s") + " inflicted"} tone={C.brassDim} /></div>
              </div>
              <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${C.line}`, color: C.mute, fontSize: 13, lineHeight: 1.7 }}>
                A strike inflicts exactly one hit no matter how many successes you roll — the only way to get more is
                a confirmed critical. There is no winner or loser in an ambush and no ties. If the opening strike
                destroyed the target, it never strikes back.
              </div>
            </>
          )}
        </Panel>
      )}

      <Coach on={teach} label="Reading the tray">
        A die outlined in green scored a success. A die outlined in red rolled 7 or 8 — that is a critical, and the
        small die hanging beneath it is the confirmation roll. Confirm on 5 or better and it adds another success.
        Fortifications never make confirmation harder.
      </Coach>
    </div>
  );
}

/* ======================= MODULE 4 · REFERENCE ======================= */

function Reference({ mode }) {
  const adv = mode === "advanced";
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [openKingdom, setOpenKingdom] = useState(null);

  const grouped = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const hits = REF.filter((e) => {
      if (cat !== "all" && e[0] !== cat) return false;
      if (!needle) return true;
      return (e[1].toLowerCase().indexOf(needle) >= 0
        || e[3].toLowerCase().indexOf(needle) >= 0
        || e[2].indexOf(needle) >= 0
        || e[0].toLowerCase().indexOf(needle) >= 0);
    });
    const m = {}; const orderSeen = [];
    hits.forEach((e) => { if (!m[e[0]]) { m[e[0]] = []; orderSeen.push(e[0]); } m[e[0]].push(e); });
    return { m, orderSeen, count: hits.length };
  }, [q, cat]);

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <Eyebrow>Module four</Eyebrow>
      <h2 className="font-serif mt-2 mb-1" style={{ color: C.vellum, fontSize: 30, letterSpacing: "-0.01em" }}>Look it up</h2>
      <p style={{ color: C.mute, fontSize: 14, lineHeight: 1.7 }}>
        Every rule and every card, condensed and searchable. The numbers point back to the rulebook, and the card
        entries tell you how each one actually resolves — the wording itself stays on the card in your hand.
      </p>
      {!adv && (
        <div className="mt-3 flex items-start gap-2" style={{ color: C.faint, fontSize: 12 }}>
          <Info size={12} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>You are in basic mode. Advanced entries are still here and still searchable — they are just tagged.</span>
        </div>
      )}

      <div className="sticky top-14 py-3" style={{ background: C.ink, zIndex: 5 }}>
        <div className="flex items-center gap-2.5 rounded-sm px-3 py-2" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
          <Search size={14} style={{ color: C.brass, flexShrink: 0 }} />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="ambush, besieged, cantrip, fireball, 9.8, Lilith…"
            className="flex-1 bg-transparent outline-none" style={{ color: C.vellum, fontSize: 13.5 }} />
          {q && <button onClick={() => setQ("")} style={{ color: C.mute }}><X size={13} /></button>}
        </div>
        <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-1">
          {[["all", "Everything"]].concat(CATS.map((c) => [c, c])).map((t) => (
            <button key={t[0]} onClick={() => setCat(t[0])} className="rounded-sm px-2.5 py-1 whitespace-nowrap"
              style={{
                fontSize: 11, fontWeight: 600, flexShrink: 0,
                background: cat === t[0] ? C.brass : "transparent",
                color: cat === t[0] ? C.ink : C.mute,
                border: `1px solid ${cat === t[0] ? C.brass : C.lineSoft}`,
              }}>{t[1]}</button>
          ))}
        </div>
      </div>

      {grouped.count === 0 && (
        <Panel className="p-6 text-center mt-3">
          <div style={{ color: C.vellum, fontSize: 14 }}>Nothing matches "{q}".</div>
          <div style={{ color: C.mute, fontSize: 12.5, marginTop: 6 }}>
            Try a rule number, a card name, or a plainer word — "burn" will not find it, but "razed" will.
          </div>
        </Panel>
      )}

      {grouped.orderSeen.map((c) => (
        <div key={c} className="mt-6">
          <Eyebrow>{c} <span style={{ color: C.faint }}>· {grouped.m[c].length}</span></Eyebrow>
          <div className="mt-3 space-y-2">
            {grouped.m[c].map((e, i) => (
              <div key={e[1] + e[2] + i} className="rounded-sm px-4 py-3" style={{ background: C.panel, border: `1px solid ${C.lineSoft}` }}>
                <div className="flex items-baseline gap-2.5 mb-1.5 flex-wrap">
                  <span className="font-serif" style={{ color: C.vellum, fontSize: 14.5 }}>{e[1]}</span>
                  <span className="font-mono" style={{ color: C.brassDim, fontSize: 11 }}>{e[2]}</span>
                  {e[4] && <AdvTag />}
                </div>
                <div style={{ color: C.mute, fontSize: 13, lineHeight: 1.7 }}>{e[3]}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-10">
        <Eyebrow rule="12.0">Kingdom special rules</Eyebrow>
        <div className="mt-3 space-y-2">
          {Object.keys(KINGDOMS).map((id) => {
            const k = KINGDOMS[id], open = openKingdom === id;
            return (
              <div key={id} className="rounded-sm" style={{ background: C.panel, border: `1px solid ${C.lineSoft}` }}>
                <button onClick={() => setOpenKingdom(open ? null : id)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                  <span style={{ width: 3, height: 18, background: k.crest }} />
                  <span className="font-serif flex-1" style={{ color: C.vellum, fontSize: 14.5 }}>{k.name}</span>
                  <span style={{ color: C.faint, fontSize: 11.5 }} className="hidden sm:inline">{k.motif}</span>
                  {open ? <ChevronDown size={14} style={{ color: C.mute }} /> : <ChevronRight size={14} style={{ color: C.mute }} />}
                </button>
                {open && (
                  <div className="px-4 pb-4 space-y-2.5">
                    {k.rules.map((r) => (
                      <div key={r[0]}>
                        <span style={{ color: C.brass, fontSize: 12.5, fontWeight: 600 }}>{r[0]} — </span>
                        <span style={{ color: C.mute, fontSize: 12.5, lineHeight: 1.7 }}>{r[1]}</span>
                      </div>
                    ))}
                    <div className="flex gap-4 flex-wrap pt-1">
                      <button onClick={() => { setCat("Blessings"); setQ(k.name); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        style={{ color: C.brass, fontSize: 12, fontWeight: 600 }}>
                        {BLESSINGS[id].length} blessings →
                      </button>
                      <button onClick={() => { setCat("Hero cards"); setQ(k.name); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        style={{ color: C.brass, fontSize: 12, fontWeight: 600 }}>
                        {HEROCARDS[id].length} hero cards →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <Panel className="p-4">
          <Eyebrow rule="4.81, 12.2.6">Loot values</Eyebrow>
          <div className="mt-3 space-y-1.5" style={{ fontSize: 12.5 }}>
            {[["Settlement", "2 gold"], ["City", "4 gold"], ["Settlement, Shashka army", "3 gold"], ["City, Shashka army", "6 gold"]].map((r) => (
              <div key={r[0]} className="flex justify-between gap-3"><span style={{ color: C.mute }}>{r[0]}</span><span className="font-mono" style={{ color: C.brass }}>{r[1]}</span></div>
            ))}
          </div>
        </Panel>
        <Panel className="p-4">
          <Eyebrow rule="9.5, 8.1.2">Defensive dice</Eyebrow>
          <div className="mt-3 space-y-1.5" style={{ fontSize: 12.5 }}>
            {[["Unoccupied settlement", "1 light"], ["City, always", "3 light"], ["Across a river", "1 light"], ["Across a major river", "2 light"]].map((r) => (
              <div key={r[0]} className="flex justify-between gap-3"><span style={{ color: C.mute }}>{r[0]}</span><span className="font-mono" style={{ color: C.brass }}>{r[1]}</span></div>
            ))}
          </div>
          <div className="mt-3" style={{ color: C.faint, fontSize: 11.5, lineHeight: 1.6 }}>
            Terrain inside the defending hex comes from the Terrain Effects Chart on your player aid.
          </div>
        </Panel>
        <Panel className="p-4">
          <div className="flex items-center gap-2"><Eyebrow tone={C.arcane} rule="15.5">Monster strike range</Eyebrow><AdvTag /></div>
          <div className="mt-3 space-y-1.5" style={{ fontSize: 12.5 }}>
            {[["Sea monster", "4 hexes"], ["Flying", "3 hexes"], ["Mage", "2 hexes"], ["Everything else", "adjacent"]].map((r) => (
              <div key={r[0]} className="flex justify-between gap-3"><span style={{ color: C.mute }}>{r[0]}</span><span className="font-mono" style={{ color: C.brass }}>{r[1]}</span></div>
            ))}
          </div>
        </Panel>
        <Panel className="p-4">
          <div className="flex items-center gap-2"><Eyebrow tone={C.arcane} rule="17.4.4">Full strength</Eyebrow><AdvTag /></div>
          <div className="mt-3 space-y-1.5" style={{ fontSize: 12.5 }}>
            {[["Spells", "3"], ["Blessings", "1 per kingdom"], ["Treasures in hand", "no limit"], ["Treasures kept in winter", "2"]].map((r) => (
              <div key={r[0]} className="flex justify-between gap-3"><span style={{ color: C.mute }}>{r[0]}</span><span className="font-mono" style={{ color: C.brass }}>{r[1]}</span></div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ============================== LEARN =============================== */

const Card = ({ title, children, icon: Icon }) => (
  <Panel className="p-5">
    <div className="flex items-center gap-2.5 mb-3">
      {Icon && <Icon size={15} style={{ color: C.brass }} />}
      <h3 className="font-serif" style={{ color: C.vellum, fontSize: 17 }}>{title}</h3>
    </div>
    <div style={{ color: "#b3ac99", fontSize: 13.5, lineHeight: 1.75 }}>{children}</div>
  </Panel>
);

const GLOSSARY = [
  ["Welcoming", "A settlement your units can just walk into — your own, or an ally's."],
  ["Hostile", "A settlement you must beat in combat before entering. When you do, you loot it."],
  ["Loyal", "A settlement with a kingdom's crest printed on the map. Theirs, unless a marker says otherwise."],
  ["Neutral", "No crest at all. The campaign rules say who it is friendly to."],
  ["Control marker", "Dropped on a settlement you have taken. Worth +1 income, and lets you build there."],
  ["Razed", "Scrubbed from play — no loot, no garrison, no fortification, no building. It reverts to plain terrain."],
  ["Besieged", "An enemy army sits next door. You cannot build or recover there — but units still move in and out."],
  ["Weakened", "A damaged army, flipped to its red-edged side. Another hit kills it."],
  ["Fragile", "A brittle army with a grey edge. One hit destroys it — it never weakens and never recovers."],
  ["Feral", "Wild beasts. They raze what they take, and cannot loot, control, or board ships."],
  ["Huge", "Giants. They raze what they enter, cannot end a turn in a friendly settlement, and cannot board ships."],
  ["Ready / finished", "Units start your turn ready. Once one moves or acts it is finished — rotate it 45°."],
  ["Free action", "Something that does not cost your action: looting, placing a control marker, regenerating."],
];

const GLOSSARY_ADV = [
  ["Cantrip", "The only kind of card you may play on somebody else's turn. Look for the symbol under the title."],
  ["Tome", "A card that never plays alone — it rides along with a spell from your own hand."],
  ["Lock", "Using a hero's power usually turns its card sideways. It stays unusable until your next activation phase."],
  ["Owned", "A played treasure is not discarded. It sits face up beside your playmat and can be fetched back later."],
  ["Glyph and churn", "The two faces of a study marker. A glyph means everyone draws three disciplines' worth; a churn, one."],
  ["Lair", "A hex nobody may ever enter. Attack it and a random monster comes out to meet you."],
  ["Commanded", "A monster that survived a fight now belongs to one of your opponents, and will strike at you on their turn."],
  ["Lone hero", "A hero standing alone. It cannot attack or be attacked — an enemy army simply walks in and kills it."],
];

const MISTAKES = [
  ["Building everything up front", "You may build before, between, and after activations. Timing your builds is most of the strategy."],
  ["Forgetting the loser takes the difference", "Three successes against one is not one hit, it is two."],
  ["Applying terrain to the attacker", "Terrain only ever adds dice to the defender, and it is ignored completely during strikes."],
  ["Letting feral or huge armies capture towns", "They burn what they take. They never place a control marker, so they never grow your income."],
  ["Treating a siege as a blockade", "Besieging only shuts off building and recovery. Units walk in and out of the hex as they please."],
  ["Missing that a city always has a garrison", "Cities defend with three light dice whether or not an army is standing in them."],
];

const MISTAKES_ADV = [
  ["Playing cards out of order in combat", "Battle magic is strictly sequenced: attacker's cards, defender's cantrips, attacker's cantrips, then dice. Play something late and it simply does not work."],
  ["Forgetting everyone studies", "Arcane study happens at the end of every kingdom's turn and every player takes part — not just the one who just played."],
  ["Attacking a monster you command", "You can never attack or strike a monster under your own command, or an ally's. Only the other side gets to try."],
  ["Hoarding treasures into winter", "Come winter you must sell down to two. Spend or play them before then, or take 2 gold each and like it."],
  ["Leaving a hero standing alone", "A lone hero cannot fight back at all. Any enemy army that walks into its hex kills it outright."],
];

function Learn({ onStart, onRules, mode }) {
  const adv = mode === "advanced";
  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <Eyebrow>Before your first game</Eyebrow>
      <h2 className="font-serif mt-2 mb-2" style={{ color: C.vellum, fontSize: 32, letterSpacing: "-0.015em", lineHeight: 1.15 }}>
        Everything a new player needs, in about five minutes
      </h2>
      <p style={{ color: C.mute, fontSize: 14.5, lineHeight: 1.75 }}>
        Read this to the table before you set up. It covers the shape of the game — the details arrive as you need them.
        {adv ? " You are in advanced mode, so the extra layer is included below." : ""}
      </p>

      <div className="grid gap-3 mt-7">
        <Card title="What you're doing" icon={Crown}>
          Two sides — invaders and defenders — fight over a hex map of the continent of Kheros. On your turn you
          collect gold, spend it raising armies, and march those armies at each other's towns. Take a town and you
          loot it for gold and gain income; hold enough of the right ones and you win. Your campaign book says
          exactly which ones.
        </Card>
        <Card title="The rhythm of a turn" icon={ArrowRight}>
          Every kingdom takes one turn per season, in banner order, and it is always the same beats:
          <strong style={{ color: C.vellum }}> income actions</strong> (a few kingdoms have special business here),
          <strong style={{ color: C.vellum }}> income</strong> (get paid, pay your debts), then
          <strong style={{ color: C.vellum }}> activation</strong> (build and fight)
          {adv ? <>, and finally <strong style={{ color: C.vellum }}>arcane study</strong>, where everyone refreshes their cards</> : null}.
          Once everyone has gone, the season advances. Spring, summer, autumn{adv ? ", winter." : " — winter is skipped in the basic game."}
        </Card>
        <Card title="How fighting resolves" icon={Dices}>
          Every unit has a combat rating printed as dice symbols: white squares are six-sided, black diamonds are
          eight-sided. Both sides roll everything at once and count 5s and up. More successes wins, and the loser
          takes hits equal to the gap. A full army flips to weakened; a weakened one dies. Roll a 7 or 8 and you
          have scored a critical — roll one more d6, and on a 5 or better it counts as an extra success.
        </Card>
        <Card title="The bit that surprises everyone" icon={AlertTriangle}>
          You are not required to build all your armies at the start of your turn. Move a unit, watch what happens,
          then build. Then move another. Knowing where the gap opened before you commit gold to filling it is the
          whole game.
        </Card>
        {adv && (
          <Card title="What the advanced game adds" icon={Wand2}>
            Four things, all bolted onto the frame above. <strong style={{ color: C.vellum }}>Heroes</strong> stack with
            an army and lend it their dice, abilities and a unique power.
            <strong style={{ color: C.vellum }}> Monsters</strong> lurk in lairs you can crack open for gold and treasure —
            and if one survives, it turns and fights for your opponent.
            <strong style={{ color: C.vellum }}> Magic cards</strong> come in three flavours: spells everyone shares, treasures
            you win and keep, and blessings unique to your kingdom.
            <strong style={{ color: C.vellum }}> Arcane study</strong> is how you refill your hand, and its rhythm is set by
            markers you flip at the end of each turn.
          </Card>
        )}
      </div>

      <div className="mt-10">
        <Eyebrow>{adv ? "Things players get wrong" : "Six things first-timers get wrong"}</Eyebrow>
        <div className="mt-4 space-y-3">
          {MISTAKES.concat(adv ? MISTAKES_ADV : []).map((m, i) => (
            <div key={m[0]} className="flex gap-4">
              <span className="font-mono" style={{ color: C.brassDim, fontSize: 12, paddingTop: 2 }}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div className="font-serif" style={{ color: C.vellum, fontSize: 14.5 }}>{m[0]}</div>
                <div style={{ color: C.mute, fontSize: 13, lineHeight: 1.65, marginTop: 2 }}>{m[1]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <Eyebrow>The words that trip people up</Eyebrow>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {GLOSSARY.concat(adv ? GLOSSARY_ADV : []).map((g) => (
            <div key={g[0]} className="rounded-sm px-3.5 py-3" style={{ background: C.panel, border: `1px solid ${C.lineSoft}` }}>
              <div className="font-serif" style={{ color: C.brass, fontSize: 13.5 }}>{g[0]}</div>
              <div style={{ color: C.mute, fontSize: 12.5, lineHeight: 1.6, marginTop: 3 }}>{g[1]}</div>
            </div>
          ))}
        </div>
        <button onClick={onRules} className="mt-4" style={{ color: C.brass, fontSize: 12.5, fontWeight: 600 }}>
          Every other rule and every card is in Rules, searchable →
        </button>
      </div>

      <div className="mt-10 flex justify-center">
        <Btn tone="solid" onClick={onStart}>
          <span className="flex items-center gap-2"><Play size={14} /> Set up a campaign</span>
        </Btn>
      </div>
    </div>
  );
}

/* =============================== APP ================================ */

/* Fill in advanced fields on a campaign started in basic mode. */
function ensureAdvanced(g) {
  const kingdoms = {};
  Object.keys(g.kingdoms).forEach((id) => {
    const k = g.kingdoms[id];
    kingdoms[id] = {
      ...k,
      spells: k.spells === undefined ? 3 : k.spells,
      blessings: k.blessings === undefined ? 1 : k.blessings,
      treasuresHand: k.treasuresHand || 0,
      treasuresOwned: k.treasuresOwned || 0,
      monsters: k.monsters || 0,
      heroes: k.heroes || 0,
    };
  });
  return {
    ...g, kingdoms, mode: "advanced",
    studyPool: g.studyPool && g.studyPool.length ? g.studyPool : studyPoolFor(g.order.length, g.season === 2),
    studyRevealed: g.studyRevealed || null,
    winter: g.winter || false,
  };
}

export default function App() {
  const [view, setView] = useState("learn");
  const [teach, setTeach] = useState(true);
  const [game, setGame] = useState(null);
  const [freeMode, setFreeMode] = useState("basic");   // mode when no campaign is running
  const [loaded, setLoaded] = useState(false);

  const mode = game ? game.mode : freeMode;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("bb:campaign");
      if (raw) { setGame(JSON.parse(raw)); setView("turn"); }
    } catch (e) { /* nothing saved — start fresh */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || !game) return;
    try { window.localStorage.setItem("bb:campaign", JSON.stringify(game)); } catch (e) { }
  }, [game, loaded]);

  const toggleMode = () => {
    if (!game) { setFreeMode((m) => (m === "basic" ? "advanced" : "basic")); return; }
    setGame((g) => {
      if (g.mode === "advanced") {
        const next = { ...g, mode: "basic", winter: false };
        if (next.step > 3) next.step = 3;
        return next;
      }
      return ensureAdvanced(g);
    });
  };

  const tabs = [
    ["learn", "Learn", BookOpen],
    ["setup", "Setup", ListChecks],
    ["turn", "Turn", Crown],
    ["combat", "Combat", Swords],
    ["reference", "Rules", Search],
  ];

  const advOn = mode === "advanced";

  return (
    <div className="min-h-screen" style={{ background: C.ink, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <div className="sticky top-0" style={{ background: "rgba(11,17,29,0.94)", borderBottom: `1px solid ${C.line}`, backdropFilter: "blur(8px)", zIndex: 20 }}>
        <div className="max-w-4xl mx-auto px-5 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div style={{ width: 3, height: 26, background: C.banner }} />
            <div>
              <div className="font-serif" style={{ color: C.vellum, fontSize: 16, lineHeight: 1.1 }}>Burning Banners</div>
              <div className="uppercase" style={{ color: C.brassDim, fontSize: 8.5, letterSpacing: "0.24em", fontWeight: 700 }}>
                {game ? game.name : "Table companion"}
              </div>
            </div>
          </div>

          <nav className="flex gap-1 ml-auto">
            {tabs.map((t) => {
              const Icon = t[2];
              return (
                <button key={t[0]} onClick={() => setView(t[0])} className="rounded-sm px-2.5 py-1.5 flex items-center gap-1.5"
                  style={{
                    background: view === t[0] ? C.panel2 : "transparent",
                    border: `1px solid ${view === t[0] ? C.line : "transparent"}`,
                    color: view === t[0] ? C.vellum : C.mute, fontSize: 12.5, fontWeight: 600,
                  }}>
                  <Icon size={13} /> <span className="hidden lg:inline">{t[1]}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex gap-1.5">
            <button onClick={toggleMode} title="Switch between the basic and advanced game"
              className="rounded-sm px-2.5 py-1.5 flex items-center gap-1.5"
              style={{
                background: advOn ? "rgba(155,127,196,0.16)" : "transparent",
                border: `1px solid ${advOn ? C.arcane : C.lineSoft}`,
                color: advOn ? "#c0aade" : C.mute, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                whiteSpace: "nowrap",
              }}>
              <Wand2 size={12} /> <span className="hidden sm:inline">{advOn ? "ADVANCED" : "BASIC"}</span>
            </button>
            <button onClick={() => setTeach((t) => !t)} title="Show or hide the teaching notes"
              className="rounded-sm px-2.5 py-1.5 flex items-center gap-1.5"
              style={{
                background: teach ? "rgba(192,154,78,0.14)" : "transparent",
                border: `1px solid ${teach ? C.brass : C.lineSoft}`,
                color: teach ? C.brass : C.mute, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              }}>
              <Info size={12} /> <span className="hidden sm:inline">TEACH</span>
            </button>
          </div>
        </div>
      </div>

      {view === "learn" && <Learn mode={mode} onStart={() => setView("setup")} onRules={() => setView("reference")} />}

      {view === "setup" && (
        <Setup teach={teach} mode={mode} existing={game ? () => setView("turn") : null}
          onBegin={(g) => { setGame(g); setView("turn"); }} />
      )}

      {view === "turn" && (game ? (
        <TurnRunner game={game} setGame={setGame} teach={teach} openCombat={() => setView("combat")} />
      ) : (
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
          <Crown size={26} style={{ color: C.brassDim, margin: "0 auto 14px" }} />
          <div className="font-serif" style={{ color: C.vellum, fontSize: 20 }}>No campaign in progress</div>
          <p className="mt-2 mb-6 mx-auto" style={{ color: C.mute, fontSize: 13.5, lineHeight: 1.7, maxWidth: 430 }}>
            Set one up and this becomes your turn tracker — gold, income, revolts, covens, collapse checks and, in
            the advanced game, arcane study and winter, all handled as you go.
          </p>
          <Btn tone="solid" onClick={() => setView("setup")}>
            <span className="flex items-center gap-2"><ListChecks size={14} /> Go to setup</span>
          </Btn>
        </div>
      ))}

      {view === "combat" && <Combat teach={teach} mode={mode} onBack={() => setView(game ? "turn" : "learn")} />}
      {view === "reference" && <Reference mode={mode} />}

      {game && view === "turn" && (
        <div className="max-w-3xl mx-auto px-5 pb-10">
          <button onClick={() => {
            setGame(null); setView("setup");
            try { window.localStorage.removeItem("bb:campaign"); } catch (e) { }
          }} style={{ color: "#4d566b", fontSize: 11.5 }}>
            Abandon this campaign and set up a new one
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-5 pb-8" style={{ color: "#3f485c", fontSize: 11, lineHeight: 1.7 }}>
        A play aid for Christopher Moeller's Burning Banners (Compass Games), following Undying Rules v1.1.
        Rule and card numbers point back to the rulebook and to the cards themselves — keep both on the table.
      </div>
    </div>
  );
}
