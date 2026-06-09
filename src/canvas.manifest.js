export const manifest = {
  screens: {
    scr_81btvq: { name: "Home", route: "/", state: { "currentView": "home" }, position: { "x": 160, "y": 220 } },
    scr_j7w7yy: { name: "Collection", route: "/", state: { "currentView": "collection" }, position: { "x": 1560, "y": 220 } },
    scr_h1vpfp: { name: "Product Detail", route: "/", state: { "currentView": "pdp" }, position: { "x": 2960, "y": 220 } }
  },
  sections: {
    sec_jru0ad: { name: "Shopping flow", x: 0, y: 0, width: 4320, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_jru0ad", children: [
    { kind: "screen", id: "scr_81btvq" },
    { kind: "screen", id: "scr_j7w7yy" },
    { kind: "screen", id: "scr_h1vpfp" }]
  }]

};