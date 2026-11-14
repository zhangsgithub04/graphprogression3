# Graph Progression Lab

A dependency-free HTML, CSS, and JavaScript graph progression explorer with three simultaneous update rules: u (toggle), u+ (add only), and u− (remove only).

## Run locally

From this directory, start a static HTTP server:

    python3 -m http.server 8000 --directory dist

Open http://localhost:8000. Use an HTTP server rather than double-clicking index.html because browsers restrict Web Workers on file:// URLs. No Python packages or JavaScript installation are needed; Python only serves the files. Any static HTTP server works.

## Explore

- Choose n = 1–6 and generate the complete labeled state space.
- Select u, u+, or u−; changing the rule rebuilds the transition map and preserves the selected graph when n is unchanged.
- Inspect both u+ completeness and u− collapsibility, their stable graph IDs, and steps to stability for any graph, regardless of the active map rule.
- Filter trajectories by either property, its negation, or both properties together. Summary counts always cover all labeled graphs.
- For u+ and u−, attractors are stable graphs with a self-loop (period 1). The final duplicate in a trajectory confirms the graph remains unchanged.
- Drag to pan, use the wheel or pinch to zoom, or use + / − / Fit.
- Keyboard on the focused canvas: arrows pan, + / − zoom, 0 fits.
- Filter by basin; click any state to see its graph, degrees, and edges.
- Center the selection or trace its trajectory. Trajectories are paginated and expanded on demand.
- Export JSON includes all transitions, cycle membership, transient lengths, edge lists, and measured cycle periods.
- Expand the map to fullscreen on supporting browsers.

## Mathematical conventions

Nodes are 0,...,n−1. For each unordered pair with equal current degrees: u toggles adjacency; u+ adds the edge if absent and retains it if present; u− removes the edge if present and leaves it absent otherwise. Different-degree pairs retain adjacency. Updates are simultaneous; all degrees are calculated before any changes in a step. IDs encode adjacency bits, in lexicographic unordered-pair order. IDs differ from the notebook's enumeration order (which groups graphs by edge count), but the labeled graphs and transitions are identical. Transient depth counts steps to the first cycle state; cycle states have depth zero. Every cycle state is marked as cycle, and only the final repeated state is marked as repeat.

The original fixed three layers and assumed period two are replaced by exact depths and measured periods. The app does not merge graph isomorphism classes. Complete enumeration grows as 2^(n(n−1)/2). n = 6 has 32,768 states; n = 7 has 2,097,152 and is intentionally excluded. Large overview maps require basin filtering and zoom for readable individual states. Canvas keeps rendering bounded without adding one DOM node per graph. The background worker keeps enumeration off the interface thread.

## Files

- dist/index.html — interface
- dist/style.css — responsive styling
- dist/app.js — canvas, navigation, inspectors, trajectory views, export
- dist/engine.js — exact enumeration and functional-graph analysis
- dist/worker.js — background computation

No external runtime libraries, fonts, APIs, or CDN connections are required.

## Stable graphs and classification

u+ and u− always stabilize because each nonstationary step strictly increases or decreases the number of edges, respectively. There can be at most n(n−1)/2 changing steps (more sharply, at most that number minus the initial edge count for u+, or the initial edge count for u−). A graph already stable has depth zero.

A graph is **u+ complete** exactly when its u+ stable outcome is K_n. A graph is **u− collapsible** exactly when its u− stable outcome has no edges and all n vertices remain. A stable graph need not be complete under u+ or empty under u−. For n=1, the one-vertex graph qualifies for both properties with zero steps.

The JSON export records the active rule and its transitions as well as both classifications, stable outcome IDs, and steps for every state. IDs and classifications use labeled graphs, not isomorphism classes.

## Validation

Run `node tests/engine.test.cjs`. The tests exhaustively compare every transition for all three rules and n=1–6 against an independent adjacency-matrix implementation, verify monotonicity and fixed points, and check complement duality between u+ and u−.
