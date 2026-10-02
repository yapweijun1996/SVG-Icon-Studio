# Individual SVG review — v0.9.67

Scope: all 130 canonical assets in `data/icon-registry.json`, starting from commit `0b0a288` (v0.9.66). Each source was inspected individually and compared with its native Chrome rendering at **24px and 48px, on light and dark backgrounds**. Keep decisions are deliberate: recognisable, already-correct geometry is not changed merely to manufacture a diff.

Contract: exact 24×24 viewBox; root-only `fill="none"`, `stroke="currentColor"`, 1.5px round-cap/round-join outlines; existing delivery-truck drawing-style exception preserved. IDs, names, aliases, category assignments and count remain unchanged. Geometry improvements are in canonical source files, never preview-only patches.

Review performed inline: this session exposes no subagent/reviewer tool. Final verification uses separate static validation, Node regression tests and Chrome rendering/readback.

## Interface — 20/20 reviewed

| Icon | Decision | Individual finding / action |
| --- | --- | --- |
| `search` | Keep | Circular lens and joined diagonal handle are clear at both sizes; adequate perimeter padding. |
| `settings` | Keep | Eight symmetric teeth and central aperture retain separation at 24px. |
| `notification` | Keep | Continuous bell silhouette and detached clapper are legible without extra detail. |
| `calendar` | Improve | Shorten binding stems and replace offset/incomplete date strokes with a symmetric six-dot grid. |
| `clock` | Keep | Centred face and two hands have clear, unequal lengths without touching the rim. |
| `home` | Keep | Roof and recessed doorway form one unambiguous continuous outline. |
| `menu` | Keep | Three equal horizontal strokes retain even spacing and standard padding. |
| `close` | Improve | Inset the diagonals to 6–18 so their optical weight matches neighbouring simple controls. |
| `lock` | Keep | Shackle joins the body cleanly and the keyhole has sufficient separation. |
| `eye` | Keep | Symmetric eye contour and pupil are distinct at 24px. |
| `mail` | Keep | Envelope flap joins within the rounded perimeter; no stray crossing. |
| `star` | Keep | Five symmetric points and inner notches remain readable without clipping. |
| `unlock` | Keep | Open shackle gap is obvious and the body matches the locked counterpart. |
| `eye-off` | Keep | Interrupted contour/pupil allow the diagonal slash to read cleanly. |
| `globe` | Keep | Equator and symmetric meridians meet the circular rim consistently. |
| `plus` | Keep | Centred equal arms provide balanced addition semantics. |
| `minus` | Keep | Centred stroke matches the plus counterpart's width. |
| `info` | Keep | Stem and round-cap dot are separated within the circle. |
| `help-circle` | Keep | Question curve and detached dot retain counter space at 24px. |
| `bookmark` | Keep | Centred V-notch and rounded top leave clear interior space. |

## Arrows and Actions — 19/19 reviewed

| Icon | Decision | Individual finding / action |
| --- | --- | --- |
| `download` | Keep | Downward shaft meets both arrowhead arms; detached baseline matches Upload. |
| `upload` | Keep | Reversed shaft/head and shared baseline give a consistent transfer pair. |
| `delete` | Keep | Lid, handle and two inner grooves stay separated in the tapered body. |
| `edit` | Keep | Closed pencil tip and end band remain recognisable at 24px. |
| `share` | Keep | Both connecting strokes meet the three node circumferences without crossing their centres. |
| `filter` | Keep | Symmetric funnel and angled stem retain useful interior space. |
| `arrow-left` | Keep | Shaft terminates exactly at the centred left arrowhead. |
| `arrow-right` | Keep | Exact horizontal counterpart of Arrow Left. |
| `check` | Keep | Unequal arms and clear corner read as confirmation, not a symmetric chevron. |
| `alert` | Improve | Round the triangle's corners and align the detached dot within its inset silhouette. |
| `refresh` | Improve | Join each circular sweep to its own arrowhead corner; the old arcs ended away from the heads. |
| `external-link` | Keep | Outward diagonal meets the top-right arrow; frame is interrupted around the exit. |
| `copy` | Keep | Rear outline is interrupted rather than drawn through the front rounded sheet. |
| `print` | Keep | Top feed, body, output sheet and status dot occupy distinct regions. |
| `send` | Keep | Plane's fold terminates at its interior vertex and remains clear at 24px. |
| `link` | Keep | Two open, interlocking link contours retain separation without a heavy central knot. |
| `arrow-up` | Keep | Centred vertical counterpart with head and shaft meeting exactly. |
| `arrow-down` | Keep | Exact vertical reversal of Arrow Up. |
| `undo` | Keep | Return arrow joins the curved shaft at one shared corner; tail remains separated. |

## Files, Users and Commerce — 13/13 reviewed

| Icon | Decision | Individual finding / action |
| --- | --- | --- |
| `invoice` | Improve | Replace the crowded tiny dollar badge (brushing the document edge) with a separated banknote; interrupt the page around it. |
| `customer` | Keep | Circular head and detached shoulder arch remain readable and fully inside the viewBox. |
| `cart` | Keep | Basket, handle and separated wheels retain clear shopping semantics. |
| `user-add` | Keep | Plus sign occupies its own space beside the person rather than crossing the head. |
| `folder` | Keep | Raised tab and smooth perimeter distinguish it from rectangular containers. |
| `file` | Keep | Rounded folded corner and two content lines remain balanced. |
| `sales-order` | Keep | Three order lines leave room for a clearly separated confirmation tick. |
| `vendor` | Keep | Awning divisions, storefront and recessed doorway are recognisable at 24px. |
| `receipt` | Keep | Three-line content and zigzag tear edge distinguish it from File. |
| `users` | Keep | Secondary head/shoulder contours sit outside the foreground person without overlap. |
| `tag` | Keep | Angled price-tag outline and punched hole are distinct from the barcode-bearing Serial Number. |
| `percent` | Keep | Equal circular counters and centred diagonal provide a balanced percentage mark. |
| `archive` | Keep | Lid overhang and central handle have consistent spacing and clear box semantics. |

## Finance, Logistics and AI — 18/18 reviewed

| Icon | Decision | Individual finding / action |
| --- | --- | --- |
| `delivery-truck` | Keep | Approved butt-cap/miter-join truck has distinct cargo/cab regions and wheels below the chassis; preserve its exception. |
| `payment` | Improve | Replace the near-duplicate Credit Card silhouette with a clear banknote and central denomination ring. |
| `ai-spark` | Keep | Three separated sparkles retain counter space and distinguish AI from the single brand mark. |
| `chart-bar` | Keep | Three increasing rounded bars meet the same baseline without crossing neighbours. |
| `delivery-order` | Improve | Restore the missing outer diagonal of the folded page and join the outgoing shaft exactly to its arrowhead. |
| `warehouse` | Keep | Roof, walls and two roll-up door divisions retain coherent storage-building semantics. |
| `package` | Keep | Symmetric isometric box seams share vertices and give clear three-face depth. |
| `credit-card` | Keep | Stripe and lower signature mark form a recognisable card, now distinct from Payment. |
| `wallet` | Keep | Detached clasp/slot meets the rounded outer edge with ample interior space. |
| `calculator` | Keep | Display and evenly spaced six-dot keypad remain legible at 24px. |
| `map-pin` | Keep | Centred aperture and rounded pointed foot read clearly without a clipped tip. |
| `trending-up` | Keep | Zigzag terminates exactly at the upper-right arrow; both head arms are aligned. |
| `pallet` | Keep | Taped carton, deck and three pallet feet remain distinct at both sizes. |
| `conveyor` | Keep | Floating parcel, three rollers and two feet remain separated from the belt outline. |
| `delivery-route` | Keep | Two location markers and the intervening route arrow occupy separate spaces. |
| `payment-schedule` | Keep | Calendar header/date marks and external banknote are separated; no border through the note. |
| `currency-exchange` | Keep | Opposing curved arrows and two coins remain readable without clipping. |
| `cash-flow` | Keep | Incoming/outgoing arrows remain outside the note and clearly distinguish it from Payment. |

## ERP — page 1, 20/20 reviewed

| Icon | Decision | Individual finding / action |
| --- | --- | --- |
| `purchase-order` | Improve | Restore the missing diagonal enclosing the folded page; retain the separate approval badge. |
| `database` | Keep | Top ellipse and two stacked cylinder tiers share consistent side walls. |
| `collection` | Keep | Rear outline is offset without drawing through the foreground square. |
| `clipboard` | Keep | Clip interrupts the board edge correctly; content lines retain interior padding. |
| `barcode` | Keep | Five bars with varied gaps remain distinct within four scanner corners. |
| `calendar-check` | Improve | Match Calendar's shortened binding stems while preserving the central check. |
| `quotation` | Keep | Large currency glyph is separated from the fold and perimeter; larger than Invoice's old crowded badge. |
| `goods-receipt` | Keep | Open flaps and a centred incoming arrow give clear receiving semantics. |
| `stock-transfer` | Keep | Opposing curved routes connect two non-overlapping stock nodes. |
| `bill-of-materials` | Improve | Increase gaps between the three child boxes beyond the stroke width and centre their connectors. |
| `work-order` | Keep | Six radial gear spokes remain centred under the paper fold without border overlap. |
| `inventory` | Keep | Two shelves and four boxes retain a clear rack silhouette at 24px. |
| `ledger` | Keep | Spine, page lines and curved lower binding remain distinct. |
| `approval` | Keep | Check sits inside the seal; ribbon tails attach below without crossing the check. |
| `workflow` | Keep | Rightward/downward arrows terminate at the next node's edge; three nodes remain separate. |
| `tax` | Keep | Percentage counters and diagonal fit within the document with sufficient border clearance. |
| `report` | Keep | Three unequal bars share a baseline and occupy a separate document region. |
| `reconciliation` | Keep | Equal level pans and centred beam/pivot clearly express balancing. |
| `credit-note` | Keep | Return arrow and curved tail fit inside the page without crowding its fold. |
| `goods-issue` | Keep | Outgoing arrow is detached above the package; isometric seams remain aligned. |

## ERP — page 2, 20/20 reviewed

| Icon | Decision | Individual finding / action |
| --- | --- | --- |
| `contract` | Keep | Signature curve and detached seal fit below the content line without intersecting the fold. |
| `bank` | Keep | Pediment, four equal columns and two baselines remain recognisable and evenly spaced. |
| `employee` | Keep | Badge clip and inset head/shoulders distinguish it from Customer. |
| `timesheet` | Improve | Interrupt the table perimeter around the clock and remove grid strokes from its face. |
| `audit-trail` | Keep | Four progressively shorter log lines leave a separate region for the magnifier. |
| `budget` | Keep | Three equal allocations connect the inner hub to the circular envelope cleanly. |
| `price-list` | Keep | Three aligned item/amount rows retain a clear gap between columns. |
| `batch-lot` | Keep | Three separate layer outlines preserve stacking depth at 24px. |
| `bin-location` | Keep | Two small bins sit on separate rack levels without intersecting posts. |
| `cost-center` | Keep | Three concentric rings remain centred and distinct from Budget's segmented ring. |
| `purchase-requisition` | Improve | Restore the missing outer diagonal of the folded page; keep the external plus badge. |
| `debit-note` | Improve | Restore the same missing page diagonal; keep the distinct minus badge. |
| `packing-list` | Keep | Two square bullets and aligned item lines remain distinguishable from Pick List's ticks. |
| `pick-list` | Keep | Two small ticks are separated from their aligned item lines and clipboard clip. |
| `journal-entry` | Keep | Plus/minus entries and paired lower rows fit within the folded document. |
| `dashboard` | Keep | Four differently sized tiles and a small chart retain separate regions at 24px. |
| `supplier-invoice` | Keep | Incoming arrow occupies the deliberate right-edge interruption of the invoice. |
| `accounts-payable` | Keep | Outgoing downward arrow remains separate from the left account mark and card header. |
| `accounts-receivable` | Keep | Incoming upward arrow clearly reverses the payable counterpart. |
| `sales-return` | Improve | Move the return arrow off the box seams; show a curved incoming arrow above the package. |

## ERP — page 3, 20/20 reviewed

| Icon | Decision | Individual finding / action |
| --- | --- | --- |
| `purchase-return` | Improve | Move the return arrow off the box seams; show a curved outgoing arrow above the package, distinct from Sales Return. |
| `cycle-count` | Keep | Two joined circular arrows encircle a small box without crossing its seams. |
| `stock-adjustment` | Keep | Plus/minus marks occupy separate box faces and the tape seam meets the upper face edge. |
| `quality-inspection` | Keep | Magnifier/check are separate from the deliberately interrupted package outline. |
| `fixed-asset` | Keep | Tall property outline and separate identification tag distinguish it from Bank. |
| `payroll` | Keep | Person and separate payslip retain sufficient horizontal clearance. |
| `material-request` | Improve | Move the incoming arrow away from the top-right page edge so rounded stroke caps cannot brush it. |
| `serial-number` | Keep | Tag hole and four vertical code bars retain distinct spaces in the horizontal label. |
| `item-master` | Keep | Package and database cylinder are separated, with no shared/intersecting walls. |
| `trial-balance` | Keep | Two equal ledger columns share a total line and remain separated below the header. |
| `shipment` | Keep | Parcel cargo, cab/window and wheels below the chassis remain readable at 24px. |
| `expense-claim` | Improve | Restore short right-edge sections above/below the external approval badge; the old interruption removed the entire lower side. |
| `customer-payment` | Keep | Person, incoming arrow and banknote occupy three separate regions. |
| `supplier-payment` | Keep | Supplier storefront, outgoing arrow and shared banknote make the counterpart distinct. |
| `invoice-verification` | Keep | Folded invoice and detached check-bearing magnifier do not cross each other's outlines. |
| `depreciation` | Keep | Property and falling value trend remain distinct from Fixed Asset and Trending Up. |
| `manufacturing` | Keep | Sawtooth factory roof, chimney and small windows occupy separate regions. |
| `maintenance` | Keep | Open wrench jaws and diagonal handle remain recognisable at 24px. |
| `inventory-reservation` | Improve | Close the package's unnecessarily missing right wall; the separate lock has adequate clearance already. |
| `reorder-point` | Keep | Stock boxes, minimum-level ticks and upward replenishment arrow are separated. |

## Final verification and evidence

**Coverage:** 130 unique decisions match the registry exactly. **Improved:** 18; **kept:** 112. The set of Improve rows equals the set of changed SVG files against `0b0a288`; there are no unreviewed asset edits. The registry is unchanged.

### Native before/after captures

Each image includes every listed icon twice per background: 48px and 24px. Source hashes in the manifests bind the baseline captures to `0b0a288` and the final captures to the reviewed canonical files. HTML inputs are regenerated by the review tool; PNG captures are checked in as the actual visual evidence.

| Group | Before | After |
| --- | --- | --- |
| Interface (20) | [image](svg-v0.9.67/before/interface-1.png) | [image](svg-v0.9.67/after/interface-1.png) |
| Arrows/Actions (19) | [image](svg-v0.9.67/before/arrows-actions-1.png) | [image](svg-v0.9.67/after/arrows-actions-1.png) |
| Files/Users/Commerce (13) | [image](svg-v0.9.67/before/files-users-commerce-1.png) | [image](svg-v0.9.67/after/files-users-commerce-1.png) |
| Finance/Logistics/AI (18) | [image](svg-v0.9.67/before/finance-logistics-ai-1.png) | [image](svg-v0.9.67/after/finance-logistics-ai-1.png) |
| ERP 1 (20) | [image](svg-v0.9.67/before/erp-1.png) | [image](svg-v0.9.67/after/erp-1.png) |
| ERP 2 (20) | [image](svg-v0.9.67/before/erp-2.png) | [image](svg-v0.9.67/after/erp-2.png) |
| ERP 3 (20) | [image](svg-v0.9.67/before/erp-3.png) | [image](svg-v0.9.67/after/erp-3.png) |

- [Before source manifest](svg-v0.9.67/before/manifest.json) and [after source manifest](svg-v0.9.67/after/manifest.json): all 130 file hashes cross-checked against their actual sources.
- [Before native bounds](svg-v0.9.67/before/bounds.json) and [after native bounds](svg-v0.9.67/after/bounds.json): all 130 IDs present. Geometric bounds retain at least 0.75 units of edge clearance (half the standard stroke). `getBBox()` excludes stroke; the round joins/caps and the preserved truck exception were also inspected visually for clipping.

### Gates

- `timeout 120 npm test` — pass, including all 130 SVGs and the new authoring/gallery tests.
- `timeout 90 npm run typecheck` — pass (the repository uses JavaScript syntax checks, not TypeScript semantic checking).
- `timeout 120 npm run build` — pass; registry totals and aliases remain intact.
- `git diff --check` — pass.
- Production version metadata, worker version and bundle — v0.9.67.
- Clean-profile production Chrome — every one of the 130 IDs searched, loaded through the real repository/sanitizer/preview path and rendered without fallback; preview bounds match the final canonical gallery. No runtime exceptions.
- Responsive smoke checks at 1440px, 834px and 390px — no page horizontal overflow; existing fill-switch geometry, 44px hit target, native click/Tab/Space operation and visible keyboard focus remain correct in light/dark and off/on states. The smoke harness waits for transition completion rather than assuming a fixed frame deadline.

### Reproduction

```bash
npm run review-icons -- --out /tmp/icon-studio-review
# Open the seven generated HTML pages to review all artwork.
npm test
npm run typecheck
npm run build
```

Non-goal: redesigning already-correct artwork just to change every file, changing taxonomy or count, and unrelated dependency remediation. Existing development-dependency audit advisories are unchanged by this SVG review.

