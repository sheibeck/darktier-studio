// The single source for what Delve, Die, Repeat does with Compete OFF.
// Rendered in full by src/components/CompeteOff.astro (the "With Compete off"
// item on /privacy/apps, id #compete-off, and the delete-data page). Every other
// page mentions Compete off only in passing and links to COMPETE_OFF_URL.
// Wording matches store-listing/LISTING.md, ACCOUNT_COPY.sheet.offHelp
// (content/account.js) and docs/PLAY-GAMES-SETUP.md in the mazeworld repo.
export const COMPETE_OFF_URL = "/privacy/apps#compete-off";

export const competeOff = {
  atLaunch:
    "Nothing is sent. The Play Games software never starts when you open the game, so no Google Play Games sign-in is asked for and no game ID is created.",
  queued:
    "Any runs still waiting to be sent are thrown away, and runs you finish while Compete is off are never uploaded later, even if you turn Compete back on.",
  midSession:
    "If you turn Compete off while the game is open, it takes full effect the next time you open the game: Play Games stays signed in until the app closes, and nothing reaches the board.",
  erase:
    "Compete must be on to reach the board, and so to erase anything already sitting there.",
};
